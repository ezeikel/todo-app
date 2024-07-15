import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import TodoList from './TodoList';
import useTodoList from '../../hooks/api/useTodoList';
import useAddTodo from '../../hooks/api/useAddTodo';
import useUpdateTodoState from '../../hooks/api/useUpdateTodoState';
import useUsersTodoList from '../../hooks/api/useUsersTodoList';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('../../hooks/api/useTodoList');
jest.mock('../../hooks/api/useAddTodo');
jest.mock('../../hooks/api/useUpdateTodoState');
jest.mock('../../hooks/api/useUsersTodoList');

const mockUseNavigate = useNavigate as jest.Mock;
const mockUseParams = useParams as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const mockUseTodoList = useTodoList as jest.Mock;
const mockUseAddTodo = useAddTodo as jest.Mock;
const mockUseUpdateTodoState = useUpdateTodoState as jest.Mock;
const mockUseUsersTodoList = useUsersTodoList as jest.Mock;

// TODO: fix these tests
describe.skip('TodoList', () => {
  beforeEach(() => {
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseParams.mockReturnValue({ id: 'test-id' });
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    });
    mockUseTodoList.mockReturnValue({ data: null, isLoading: true });
    mockUseAddTodo.mockReturnValue({ mutate: jest.fn() });
    mockUseUpdateTodoState.mockReturnValue({ mutate: jest.fn() });
    mockUseUsersTodoList.mockReturnValue({ data: null, isLoading: true });
  });

  it('renders loading state', () => {
    render(<TodoList />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('navigates to access page if user is not part of any todo list', () => {
    const navigateMock = jest.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseUsersTodoList.mockReturnValue({ data: null, isLoading: false });

    render(<TodoList />);

    expect(navigateMock).toHaveBeenCalledWith('/access');
  });

  it('renders todo list not found state', () => {
    mockUseTodoList.mockReturnValue({ data: null, isLoading: false });
    mockUseUsersTodoList.mockReturnValue({ data: null, isLoading: false });

    render(<TodoList />);

    expect(screen.getByText('Todo list not found')).toBeInTheDocument();
  });

  it('renders todo list when data is available', () => {
    mockUseTodoList.mockReturnValue({
      data: { todoList: { id: 'test-id', key: 'test-key', todos: [] } },
      isLoading: false,
    });
    mockUseUsersTodoList.mockReturnValue({
      data: { todoList: { id: 'test-id' } },
      isLoading: false,
    });

    render(<TodoList />);

    expect(screen.getByText('Todo List: test-id')).toBeInTheDocument();
    expect(screen.getByText('Shareable key: test-key')).toBeInTheDocument();
  });

  it('adds a new todo item', async () => {
    const addTodoMock = jest.fn((_, { onSuccess }) => onSuccess());
    mockUseAddTodo.mockReturnValue({ mutate: addTodoMock });
    const queryClientMock = {
      invalidateQueries: jest.fn(),
    };
    mockUseQueryClient.mockReturnValue(queryClientMock);

    mockUseTodoList.mockReturnValue({
      data: { todoList: { id: 'test-id', key: 'test-key', todos: [] } },
      isLoading: false,
    });
    mockUseUsersTodoList.mockReturnValue({
      data: { todoList: { id: 'test-id' } },
      isLoading: false,
    });

    render(<TodoList />);

    fireEvent.change(screen.getByPlaceholderText('e.g. Buy groceries'), {
      target: { value: 'Test Todo' },
    });
    fireEvent.click(screen.getByText('Add Todo'));

    expect(addTodoMock).toHaveBeenCalledWith(
      { text: 'Test Todo', todoListId: 'test-id' },
      expect.any(Object),
    );
    expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['todoList', 'test-id'],
    });
  });
});
