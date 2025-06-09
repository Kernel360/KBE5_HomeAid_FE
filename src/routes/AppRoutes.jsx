import { useRoutes, Navigate } from 'react-router-dom';
import { AuthRoutes } from '../features/auth/routes';
import { NotFound } from '../lib/not-found';
import { Forbidden } from '../lib/Forbidden';
import { About } from '../features/misc/routes';
import { Contact } from '../features/misc/routes';
import { Policy } from '../features/misc/routes';
import { Terms } from '../features/misc/routes';
import MainPage from '../features/main/MainPage';
import { useAuthStore } from '../stores/authStore';

import ProtectedRoute from './ProtectedRoute';
import { protectedAppRoutes } from './protectedAppRoutes.jsx';

export const AppRoutes = () => {
  const user = useAuthStore((state) => state.user);

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

  const routesWithProtection = protectedAppRoutes.map(route => ({
    path: route.path,
    element: (
      <ProtectedRoute allowedRoles={route.allowedRoles}>
        {route.element}
      </ProtectedRoute>
    ),
    children: route.children ? route.children.map(child => ({
      path: child.path,
      element: child.element,
      index: child.index
    })) : undefined,
  }));

  // 권한에 따른 리다이렉션 처리
  const getRedirectPath = () => {
    if (!user) return '/auth/login';

    const role = user.role;
    switch (role) {
      case 'ROLE_CUSTOMER':
        return '/customer/service-option';
      case 'ROLE_MANAGER':
        return '/manager/mypage';
      case 'ROLE_ADMIN':
        return '/admin';
      default:
        return '/main';
    }
  };

  const routes = useRoutes([
    {
      path: '/',
      element: user ? <Navigate to={getRedirectPath()} /> : <MainPage />
    },
    {
      path: '/main',
      element: user ? <Navigate to={getRedirectPath()} /> : <MainPage />
    },
    ...routesWithProtection,
    ...commonRoutes,
  ]);

  return <>{routes}</>;
};

