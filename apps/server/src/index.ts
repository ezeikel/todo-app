import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Database } from 'bun:sqlite';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import { TodoState } from '../../../types';

type UserStore = {
  userId: string;
};

const store = new Store<UserStore>();

const db = new Database('todos.sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS todolists (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    state TEXT CHECK( state IN ('TODO', 'ONGOING', 'DONE') ) NOT NULL,
    owner TEXT NOT NULL,
    todolist_id TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (owner) REFERENCES users(id),
    FOREIGN KEY (todolist_id) REFERENCES todolists(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS user_todolist (
    user_id TEXT NOT NULL,
    todolist_id TEXT NOT NULL,
    PRIMARY KEY (user_id, todolist_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (todolist_id) REFERENCES todolists(id)
  )
`);

const app = new Hono();

const getUser = () => {
  let userId = store.get('userId');

  if (!userId) {
    return null;
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);

  if (!user) {
    return null;
  }

  return user;
};

const createUser = () => {
  const userId = uuidv4();
  store.set('userId', userId);
  db.run('INSERT INTO users (id) VALUES (?)', userId);

  return userId;
};

app.use(
  cors({
    origin: 'http://localhost:9000',
  }),
);

// clear electron-store
app.get('/store/clear', (c) => {
  store.clear();
  return c.json({ message: 'Successfully cleared store' });
});

app.get('/user', (c) => {
  const user = getUser();

  if (user) {
    const userId = user.id;
    const userTodoList = db
      .prepare('SELECT todolist_id FROM user_todolist WHERE user_id = ?')
      .get(userId);

    if (userTodoList) {
      return c.json({ user, todoListId: userTodoList.todolist_id });
    } else {
      return c.json({ user, todoListId: null });
    }
  }

  const userId = createUser();
  return c.json({ user: { id: userId }, todoListId: null });
});

app.get('/todo-list', async (c) => {
  // check if userId exists in electron-store
  let userId = store.get('userId');

  // if userId exists check in db if user exists and has a todo list
  if (userId) {
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);

    if (user) {
      const todoList = db
        .prepare(
          'SELECT * FROM todolists WHERE id = (SELECT todolist_id FROM user_todolist WHERE user_id = ?)',
        )
        .get(userId);
      // if user has a todolist, fetch todos
      if (todoList) {
        const todos = db
          .prepare('SELECT * FROM todos WHERE todolist_id = ?')
          .all(todoList.id);
        todoList.todos = todos;
        return c.json({ todoList });
      } else {
        // if user has no todolist, return null
        return c.json({ todoList: null });
      }
    } else {
      // if user not found in db, create a new user and return null
      db.run('INSERT INTO users (id) VALUES (?)', userId);

      return c.json({
        todoList: null,
      });
    }
  }

  // if no userId found in electron store create a new user starting with a unique id
  userId = uuidv4();
  store.set('userId', userId);
  // insert new user into db
  db.run('INSERT INTO users (id) VALUES (?)', userId);

  return c.json({ todos: null });
});

app.get('/todo-list/:id', async (c) => {
  const { id } = c.req.param();
  let userId = store.get('userId');

  if (!userId) {
    return c.json({ error: 'User not found' }, 404);
  }

  const userTodoList = db
    .prepare(
      'SELECT * FROM user_todolist WHERE user_id = ? AND todolist_id = ?',
    )
    .get(userId, id);

  if (!userTodoList) {
    return c.json({ error: 'User is not part of this todo list' }, 403);
  }

  const todoList = db.prepare('SELECT * FROM todolists WHERE id = ?').get(id);

  if (todoList) {
    const todos = db
      .prepare('SELECT * FROM todos WHERE todolist_id = ?')
      .all(id);
    todoList.todos = todos;
    return c.json({ todoList });
  } else {
    return c.json({ error: 'Todo list not found' }, 404);
  }
});

app.post('/todo-list', async (c) => {
  // generate key for todo list
  const key = uuidv4();

  let userId = store.get('userId');

  if (!userId) {
    userId = uuidv4();
    store.set('userId', userId);
    db.run('INSERT INTO users (id) VALUES (?)', userId);
  }

  const todoListId = uuidv4();
  db.run('INSERT INTO todolists (id, key) VALUES (?, ?)', todoListId, key);
  db.run(
    'INSERT INTO user_todolist (user_id, todolist_id) VALUES (?, ?)',
    userId,
    todoListId,
  );

  return c.json({
    todoList: {
      id: todoListId,
      key,
      todos: [],
    },
  });
});

app.post('/todo-list/join', async (c) => {
  const { key } = await c.req.json();
  let userId = store.get('userId');

  if (!userId) {
    userId = uuidv4();
    store.set('userId', userId);
    db.run('INSERT INTO users (id) VALUES (?)', userId);
  }

  const todoList = db
    .prepare('SELECT id FROM todolists WHERE key = ?')
    .get(key);

  if (todoList) {
    db.run(
      'INSERT INTO user_todolist (user_id, todolist_id) VALUES (?, ?)',
      userId,
      todoList.id,
    );
    return c.json({ todoList });
  }

  return c.json({ error: 'Todo list not found' }, 404);
});

app.post('/todos', async (c) => {
  const { text, todoListId } = await c.req.json();
  let userId = store.get('userId');

  if (!userId) {
    return c.json({ error: 'User not found' }, 404);
  }

  const todoId = uuidv4();
  const updatedAt = new Date().toISOString();
  db.run(
    'INSERT INTO todos (id, text, state, owner, todolist_id, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    todoId,
    text,
    TodoState.TODO,
    userId,
    todoListId,
    updatedAt,
  );

  return c.json({
    todo: {
      id: todoId,
      text,
      state: TodoState.TODO,
      owner: userId,
      todoListId,
    },
  });
});

app.patch('/todos/:id', async (c) => {
  const { state } = await c.req.json();
  const { id } = c.req.param();
  let userId = store.get('userId');

  if (!userId) {
    return c.json({ error: 'User not found' }, 404);
  }

  const validStateTransitions = {
    [TodoState.TODO]: [TodoState.ONGOING],
    [TodoState.ONGOING]: [TodoState.DONE, TodoState.TODO],
    [TodoState.DONE]: [TodoState.ONGOING],
  };

  const todo = db.prepare('SELECT state FROM todos WHERE id = ?').get(id);
  if (todo && validStateTransitions[todo.state].includes(state)) {
    const updatedAt = new Date().toISOString();
    db.run(
      'UPDATE todos SET state = ?, updatedAt = ? WHERE id = ?',
      state,
      updatedAt,
      id,
    );
    return c.json({ todo: { id, state, updatedAt } });
  }

  return c.json({ error: 'Invalid state transition' }, 400);
});

export default app;
