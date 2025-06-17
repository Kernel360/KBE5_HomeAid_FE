import { useRoutes, Navigate } from 'react-router-dom';
import { AuthRoutes } from '../features/auth/routes';
import { NotFound } from '../pages/shared/NotFound.jsx';
import { Forbidden } from '../pages/shared/Forbidden.jsx';
import MainPage from '../features/main/MainPage';

import BoardList from '../features/board/pages/BoardList';
import EventList from '../features/main/EventList';

import ProtectedRoute from './ProtectedRoute';
import { protectedAppRoutes } from './protectedAppRoutes.jsx';

export const AppRoutes = () => {
  const commonRoutes = [
    { path: '/auth/*', element: <AuthRoutes /> },
    { path: '/404', element: <NotFound /> },
    { path: '/403', element: <Forbidden /> },
    { path: '/board', element: <BoardList /> },
    { path: '/board/*', element: <BoardList /> },
    { path: '/event', element: <EventList /> },
    { path: '*', element: <Navigate to="/404" /> },
  ];

  const routesWithProtection = protectedAppRoutes.map((route) => ({
    path: route.path,
    element: (
      <ProtectedRoute allowedRoles={route.allowedRoles}>
        {route.element}
      </ProtectedRoute>
    ),
    children: route.children
      ? route.children.map((child) => ({
          path: child.path,
          element: child.element,
          index: child.index,
        }))
      : undefined,
  }));

  const routes = useRoutes([
    {
      path: '/',
      element: <MainPage />,
    },
    {
      path: '/main',
      element: <MainPage />,
    },
    ...routesWithProtection,
    ...commonRoutes,
  ]);

  return <>{routes}</>;
};
