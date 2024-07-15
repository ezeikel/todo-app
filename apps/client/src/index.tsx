import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header/Header';
import TodoList from './components/TodoList/TodoList';
import Access from './components/Access/Access';
import Home from './components/Home/Home';
import './global.css';

export const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/access',
    element: <Access />,
  },
  {
    path: '/todo-list/:id',
    element: <TodoList />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Header />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
