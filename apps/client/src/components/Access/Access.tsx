import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCreateTodoList from '../../hooks/api/useCreateTodoList';
import useUsersTodoList from '../../hooks/api/useUsersTodoList';
import useJoinTodoList from '../../hooks/api/useJoinTodoList';
import { TodoList } from '../../../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const Access = () => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { data, isLoading } = useUsersTodoList();
  const { mutate: createTodoList } = useCreateTodoList();
  const { mutate: joinTodoList } = useJoinTodoList();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (data?.todoList) {
      navigate(`/todo-list/${data.todoList.id}`);
    } else {
      navigate('/access');
    }
  }, [isLoading, data]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Collaborative Todo List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();

              joinTodoList(
                { key },
                {
                  onSuccess: (response) => {
                    if ((response as { error: string }).error) {
                      setError(response.error);
                      console.error(response.error);
                      return;
                    }

                    navigate(
                      `/todo-list/${(response as { todoList: TodoList }).todoList.id}`,
                    );
                  },
                },
              );
            }}
          >
            <label
              htmlFor="join-code"
              className="block text-sm font-medium text-gray-700"
            >
              Join an existing Todo List
            </label>
            <Input
              placeholder="Enter join code"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
            <Button className="w-full mt-2">Join</Button>
            {error && (
              <div
                style={{
                  color: 'red',
                  marginTop: '10px',
                }}
              >
                {error}
              </div>
            )}
          </form>
          <div className="relative flex items-center justify-center">
            <span className="absolute bg-white px-3 text-gray-500">or</span>
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-list"
              className="block text-sm font-medium text-gray-700"
            >
              Create a new Todo List
            </label>
            <Button
              className="w-full"
              onClick={() => {
                createTodoList(undefined, {
                  onSuccess: (response) => {
                    navigate(`/todo-list/${response.todoList.id}`);
                  },
                });
              }}
            >
              Create New List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Access;
