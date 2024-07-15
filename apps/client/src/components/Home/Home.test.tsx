import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import useUsersTodoList from '../../hooks/api/useUsersTodoList';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../hooks/api/useUsersTodoList');

const mockUseNavigate = useNavigate as jest.Mock;
const mockUseUsersTodoList = useUsersTodoList as jest.Mock;

describe('Home', () => {
  beforeEach(() => {
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseUsersTodoList.mockReturnValue({ data: null, isLoading: true });
  });

  it('renders loading state', () => {
    render(<Home />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('navigates to access page if no todo list is found', () => {
    const navigateMock = jest.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseUsersTodoList.mockReturnValue({ data: null, isLoading: false });

    render(<Home />);

    expect(navigateMock).toHaveBeenCalledWith('/access');
  });

  it('navigates to the todo list page if a todo list is found', () => {
    const navigateMock = jest.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseUsersTodoList.mockReturnValue({
      data: { todoList: { id: 'test-id' } },
      isLoading: false,
    });

    render(<Home />);

    expect(navigateMock).toHaveBeenCalledWith('/todo-list/test-id');
  });
});
