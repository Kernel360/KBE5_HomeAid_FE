import { useRoutes, Navigate } from 'react-router-dom';
import { AuthRoutes } from '../features/auth/routes';
import { NotFound } from '../lib/not-found';
import { Forbidden } from '../lib/Forbidden';
import { About } from '../features/misc/routes';
import { Contact } from '../features/misc/routes';
import { Policy } from '../features/misc/routes';
import { Terms } from '../features/misc/routes';
import MainPage from '../features/main/MainPage';

import BoardList from '../features/board/pages/BoardList';
import BoardWrite from '../features/board/pages/BoardWrite';
import BoardDetail from '../features/board/pages/BoardDetail';
import EventList from '../features/main/EventList';

import ProtectedRoute from './ProtectedRoute';
import { protectedAppRoutes } from './protectedAppRoutes.jsx';

export const AppRoutes = () => {
  const commonRoutes = [
    { path: '/auth/*', element: <AuthRoutes /> },
    { path: '/404', element: <NotFound /> },
    { path: '/about', element: <About /> },
    { path: '/contact', element: <Contact /> },
    { path: '/policy', element: <Policy /> },
    { path: '/terms', element: <Terms /> },
    { path: '/403', element: <Forbidden /> },
    { path: '*', element: <Navigate to="/404" /> },
  ];

  const publicRoutes = [
    { path: '/board', element: <BoardList /> },
    { path: '/board/list', element: <BoardList /> },
    { path: '/board/write', element: <BoardWrite /> },
    { path: '/board/notice/:id', element: <BoardDetail /> },
    { path: '/board/inquiry/:id', element: <BoardDetail /> },
    { path: '/event', element: <EventList /> },
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
    ...publicRoutes,
    ...routesWithProtection,
    ...commonRoutes,
  ]);

  return <>{routes}</>;
};
