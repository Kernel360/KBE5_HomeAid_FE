import { useRoutes, Navigate } from 'react-router-dom';
import { AuthRoutes } from '../features/auth/routes';
import { Landing } from '../features/misc/routes';
import { NotFound } from '../lib/not-found';
import { Forbidden } from '../lib/Forbidden';
import { About } from '../features/misc/routes';
import { Contact } from '../features/misc/routes';
import { Policy } from '../features/misc/routes';
import { Terms } from '../features/misc/routes';
import HomePage from '../features/main/HomePage';

import { publicRoutes } from './public';
import ProtectedRoute from './ProtectedRoute';
import { protectedAppRoutes } from './protectedAppRoutes.jsx';

export const AppRoutes = () => {
  const commonRoutes = [
    { path: '/auth/*', element: <AuthRoutes /> },
    { path: '/', element: <Landing /> },
    { path: '/404', element: <NotFound /> },
    { path: '/about', element: <About /> },
    { path: '/contact', element: <Contact /> },
    { path: '/policy', element: <Policy /> },
    { path: '/terms', element: <Terms /> },
    { path: '/403', element: <Forbidden /> },
    { path: '*', element: <Navigate to="/404" /> },
  ];

  const routesWithProtection = protectedAppRoutes.map(route => ({
    path: route.path,
    element: (
      <ProtectedRoute allowedRoles={route.allowedRoles}>
        {route.element}
      </ProtectedRoute>
    ),
  }));

  const routes = useRoutes([
    ...publicRoutes,
    ...routesWithProtection,
    ...commonRoutes,
  ]);

  return <>{routes}</>;
};

