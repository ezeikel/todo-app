import { useQuery } from '@tanstack/react-query';
import { TodoListReponse } from '../../../../../types';
import { getUsersTodoList } from '../../../api';

const useUsersTodoList = () =>
  useQuery<TodoListReponse>({
    queryKey: ['usersTodoList'],
    queryFn: getUsersTodoList,
  });

export default useUsersTodoList;
