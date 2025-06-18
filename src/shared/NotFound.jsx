import React from 'react';
import { useNavigate } from 'react-router-dom';
export const NotFound = () => {
  const navaigate = useNavigate();

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button onClick={()=> navaigate('/')}>홈으로</button>
    </div>
  );
};
