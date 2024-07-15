import {
  JoinTodoListResponse,
  TodoListReponse,
  TodoResponse,
  TodoState,
  UserResponse,
} from '../../types';
import { API_URL } from './src/constants';

export const createTodoList = async (): Promise<TodoListReponse> => {
  const response = await fetch(`${API_URL}/todo-list`, {
    method: 'POST',
  });

  return response.json();
};

export const getUsersTodoList = async (): Promise<TodoListReponse> => {
  const response = await fetch(`${API_URL}/todo-list`);

  return response.json();
};

export const getTodoList = async (id: string): Promise<TodoListReponse> => {
  const response = await fetch(`${API_URL}/todo-list/${id}`);

  return response.json();
};

export const addTodo = async ({
  text,
  todoListId,
}: {
  text: string;
  todoListId: string;
}): Promise<TodoResponse> => {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, todoListId }),
  });

  return response.json();
};

export const getUser = async (): Promise<UserResponse> => {
  const response = await fetch(`${API_URL}/user`);

  return response.json();
};

export const updateTodoState = async ({
  id,
  state,
}: {
  id: string;
  state: TodoState;
}): Promise<TodoResponse> => {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  });

  return response.json();
};

export const joinTodoList = async ({
  key,
}: {
  key: string;
}): Promise<JoinTodoListResponse> => {
  const response = await fetch(`${API_URL}/todo-list/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });

  return response.json();
};
