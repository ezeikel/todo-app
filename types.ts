export enum TodoState {
  TODO = 'TODO',
  ONGOING = 'ONGOING',
  DONE = 'DONE',
}

export type Todo = {
  id: string;
  text: string;
  state: TodoState;
  owner: string;
  todolist_id: string;
  updatedAt: string;
};

export type TodoList = {
  id: string;
  key: string;
  todos: Todo[];
};

export type User = {
  id: string;
  todolistId?: string;
};

export type TodoListReponse = {
  todoList: TodoList;
};

export type TodoResponse = {
  todo: Todo;
};

export type UserResponse = {
  user: User;
};

export type UpdateTodoResponse = {
  todo: Todo;
};

export type JoinTodoListResponse =
  | {
      todoList: TodoList;
    }
  | {
      error: string;
    };
