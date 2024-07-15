import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import Access from './Access';
import useCreateTodoList from '../../hooks/api/useCreateTodoList';
import useUsersTodoList from '../../hooks/api/useUsersTodoList';
import useJoinTodoList from '../../hooks/api/useJoinTodoList';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../hooks/api/useCreateTodoList');
jest.mock('../../hooks/api/useUsersTodoList');
jest.mock('../../hooks/api/useJoinTodoList');

const mockUseNavigate = useNavigate as jest.Mock;
const mockUseCreateTodoList = useCreateTodoList as jest.Mock;
const mockUseUsersTodoList = useUsersTodoList as jest.Mock;
const mockUseJoinTodoList = useJoinTodoList as jest.Mock;

describe('Access', () => {
  beforeEach(() => {
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseCreateTodoList.mockReturnValue({ mutate: jest.fn() });
    mockUseUsersTodoList.mockReturnValue({ data: null, isLoading: false });
    mockUseJoinTodoList.mockReturnValue({ mutate: jest.fn() });
  });

  it('renders the Access component', () => {
    render(<Access />);

    expect(screen.getByText('Collaborative Todo List')).toBeInTheDocument();
    expect(screen.getByText('Join an existing Todo List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter join code')).toBeInTheDocument();
    expect(screen.getByText('Create a new Todo List')).toBeInTheDocument();
  });

  it('handles form submission to join a todo list', () => {
    const joinTodoListMock = jest.fn((_, { onSuccess }) =>
      onSuccess({ todoList: { id: 'test-id' } }),
    );
    mockUseJoinTodoList.mockReturnValue({ mutate: joinTodoListMock });
    const navigateMock = jest.fn();
    mockUseNavigate.mockReturnValue(navigateMock);

    render(<Access />);

    fireEvent.change(screen.getByPlaceholderText('Enter join code'), {
      target: { value: 'test-key' },
    });

    fireEvent.click(screen.getByText('Join'));

    expect(joinTodoListMock).toHaveBeenCalledWith(
      { key: 'test-key' },
      expect.any(Object),
    );
    expect(navigateMock).toHaveBeenCalledWith('/todo-list/test-id');
  });

  it('handles button click to create a new todo list', () => {
    const createTodoListMock = jest.fn((_, { onSuccess }) =>
      onSuccess({ todoList: { id: 'new-id' } }),
    );
    mockUseCreateTodoList.mockReturnValue({ mutate: createTodoListMock });
    const navigateMock = jest.fn();
    mockUseNavigate.mockReturnValue(navigateMock);

    render(<Access />);

    fireEvent.click(screen.getByText('Create New List'));

    expect(createTodoListMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/todo-list/new-id');
  });
});
