import { useMutation } from '@tanstack/react-query';
import { updateTodoState } from '../../../api';
import { TodoState, UpdateTodoResponse } from '../../../../../types';

const useUpdateTodoState = () =>
  useMutation<UpdateTodoResponse, Error, { id: string; state: TodoState }>({
    mutationFn: ({ id, state }) => updateTodoState({ id, state }),
  });

export default useUpdateTodoState;
