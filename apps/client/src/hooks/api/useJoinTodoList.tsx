import { useMutation } from '@tanstack/react-query';
import { joinTodoList } from '../../../api';
import { JoinTodoListResponse } from '../../../../../types';

const useJoinTodoList = () =>
  useMutation<JoinTodoListResponse, Error, { key: string }>({
    mutationFn: ({ key }) => joinTodoList({ key }),
  });

export default useJoinTodoList;
