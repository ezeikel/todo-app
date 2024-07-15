import { useQuery } from '@tanstack/react-query';
import { UserResponse } from '../../../../../types';
import { getUser } from '../../../api';

const useUser = () =>
  useQuery<UserResponse>({
    queryKey: ['user'],
    queryFn: getUser,
  });

export default useUser;
