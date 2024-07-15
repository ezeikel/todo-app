import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUsersTodoList from '../../hooks/api/useUsersTodoList';

const Home = () => {
  const { data, isLoading } = useUsersTodoList();
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return null;
};

export default Home;
