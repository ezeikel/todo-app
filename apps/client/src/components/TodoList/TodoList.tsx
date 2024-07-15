import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import useTodoList from '../../hooks/api/useTodoList';
import useAddTodo from '../../hooks/api/useAddTodo';
import { TodoState } from '../../../../../types';
import useUpdateTodoState from '../../hooks/api/useUpdateTodoState';
import useUsersTodoList from '../../hooks/api/useUsersTodoList';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getNextState = (currentState: TodoState): TodoState => {
  switch (currentState) {
    case TodoState.TODO:
      return TodoState.ONGOING;
    case TodoState.ONGOING:
      return TodoState.DONE;
    default:
      return TodoState.TODO;
  }
};

const getPreviousState = (currentState: TodoState): TodoState => {
  switch (currentState) {
    case TodoState.ONGOING:
      return TodoState.TODO;
    case TodoState.DONE:
      return TodoState.ONGOING;
    default:
      return TodoState.TODO;
  }
};

const TodoList = () => {
  const [newTodo, setNewTodo] = useState('');
  const { mutate: addTodo } = useAddTodo();
  const { mutate: updateTodoState } = useUpdateTodoState();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data, isLoading } = useTodoList(id as string);

  const { data: usersTodoListData, isLoading: isLoadingUsersTodoListData } =
    useUsersTodoList();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingUsersTodoListData) {
      return;
    }

    // if user is not part of any todo list, redirect to join todo list page
    if (!usersTodoListData?.todoList) {
      navigate('/access');
    }
  }, [isLoadingUsersTodoListData, usersTodoListData]);

  if (isLoading || isLoadingUsersTodoListData) {
    return <div>Loading...</div>;
  }

  if (!data || !data.todoList || !usersTodoListData) {
    return <div>Todo list not found</div>;
  }

  const { todoList } = data;

  return (
    <div className="p-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Todo List: {todoList.id}</h2>
          <p className="text-muted-foreground">Shareable key: {todoList.key}</p>
        </div>
        <div className="space-y-4">
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();

              // add new todo
              await addTodo(
                {
                  text: newTodo,
                  todoListId: todoList.id,
                },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: ['todoList', todoList.id],
                    });
                  },
                },
              );

              // clear input
              setNewTodo('');
            }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">New Todo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Input
                    placeholder="e.g. Buy groceries"
                    required
                    value={newTodo}
                    onChange={(e) => {
                      setNewTodo(e.target.value);
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Add Todo</Button>
              </CardFooter>
            </Card>
          </form>
          <div className="grid gap-4">
            {todoList?.todos.map((todo) => (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {todo.text}
                  </CardTitle>
                  <div className="flex flex-col gap-4">
                    <span className="text-xs text-muted-foreground">
                      {todo.state}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="flex gap-4"
                        style={{
                          display: 'flex',
                        }}
                      >
                        {todo.state === TodoState.TODO ? null : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const previousState = getPreviousState(
                                todo.state,
                              );

                              await updateTodoState(
                                { id: todo.id, state: previousState },
                                {
                                  onSuccess: () => {
                                    queryClient.invalidateQueries({
                                      queryKey: ['todoList', todoList.id],
                                    });
                                  },
                                },
                              );
                            }}
                          >
                            <ArrowBigLeft />
                            Move to {getPreviousState(todo.state)}
                          </Button>
                        )}
                        {todo.state === TodoState.DONE ? null : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const nextState = getNextState(todo.state);

                              await updateTodoState(
                                { id: todo.id, state: nextState },
                                {
                                  onSuccess: () => {
                                    queryClient.invalidateQueries({
                                      queryKey: ['todoList', todoList.id],
                                    });
                                  },
                                },
                              );
                            }}
                          >
                            Move to {getNextState(todo.state)}
                            <ArrowBigRight />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">Created by: User {todo.owner}</div>
                  <div className="text-xs text-muted-foreground">
                    Last updated:{' '}
                    {formatDistanceToNow(new Date(todo.updatedAt)) + ' ago'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
