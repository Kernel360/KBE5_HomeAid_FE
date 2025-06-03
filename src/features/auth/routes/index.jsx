import React from 'react';
import { Routes, Route } from 'react-router-dom';

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<div>Auth Placeholder Page</div>} />
    </Routes>
  );
};
