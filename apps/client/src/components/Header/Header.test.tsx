import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';
import useUser from '../../hooks/api/useuser';

jest.mock('../../hooks/api/useuser');

const mockUseUser = useUser as jest.Mock;

describe('Header', () => {
  it('renders the header with the title', () => {
    mockUseUser.mockReturnValue({ data: null });

    render(<Header />);

    const title = screen.getByText('Todo App');
    expect(title).toBeInTheDocument();
  });

  it('renders the user ID when user data is available', () => {
    mockUseUser.mockReturnValue({
      data: { user: { id: 'user123', avatar: 'path/to/avatar.jpg' } },
    });

    render(<Header />);

    const userId = screen.getByText('user123');

    expect(userId).toBeInTheDocument();
  });
});
