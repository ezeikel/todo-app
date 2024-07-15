import { useMutation } from '@tanstack/react-query';
import { addTodo } from '../../../api';
import { TodoResponse } from '../../../../../types';

const useAddTodo = () =>
  useMutation<TodoResponse, Error, { text: string; todoListId: string }>({
    mutationFn: ({ text, todoListId }) => addTodo({ text, todoListId }),
  });

export default useAddTodo;
