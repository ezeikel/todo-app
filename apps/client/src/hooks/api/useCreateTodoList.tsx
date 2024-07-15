import { useMutation } from '@tanstack/react-query';
import { createTodoList } from '../../../api';
import { TodoListReponse } from '../../../../../types';

const useCreateTodoList = () =>
  useMutation<TodoListReponse, Error>({
    mutationFn: createTodoList,
  });

export default useCreateTodoList;
