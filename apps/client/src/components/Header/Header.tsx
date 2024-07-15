import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import useUser from '../../hooks/api/useuser';
import placeholderImage from '../../static/placeholder-user.jpg';

const Header = () => {
  const { data } = useUser();

  return (
    <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <h1 className="text-2xl font-bold">Todo App</h1>
      <div className="flex items-center gap-2">
        {data?.user ? (
          <>
            <Avatar>
              <AvatarImage
                src={placeholderImage}
                data-testid="placeholder-image"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span>{data.user.id}</span>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
