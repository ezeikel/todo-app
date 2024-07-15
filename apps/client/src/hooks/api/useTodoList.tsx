import { useQuery } from '@tanstack/react-query';
import { TodoListReponse } from '../../../../../types';
import { getTodoList } from '../../../api';

const useTodoList = (id: string) =>
  useQuery<TodoListReponse>({
    queryKey: ['todoList', id],
    queryFn: () => getTodoList(id),
  });

export default useTodoList;
