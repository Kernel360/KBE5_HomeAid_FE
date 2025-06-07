import { useRoutes, Navigate } from 'react-router-dom';
import { AuthRoutes } from '../features/auth/routes';
import { Landing } from '../features/misc/routes';
import { NotFound } from '../lib/not-found';
import { About } from '../features/misc/routes';
import { Contact } from '../features/misc/routes';
import { Policy } from '../features/misc/routes';
import { Terms } from '../features/misc/routes';

import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import MatchingSystemPage from '../features/admin/pages/MatchingSystemPage';
import MatchingSystemActionPage from '../features/admin/pages/MatchingSystemActionPage';
import MatchingManagerList from '../features/admin/pages/MatchingManagerList';
import AdminUserManagement from '../features/admin/pages/AdminUserManagement';
import AdminManagerApproval from '../features/admin/pages/adminManagerapproval';
import ManagerDetailApproval from '../features/manager/pages/ManagerDetailApproval';

import ManagerServiceCheckIn from '../features/matching/pages/ManagerServiceCheckIn';
import ManagerMatchingRequest from '../features/matching/pages/ManagerMatchingRequest';
import UserServiceOption from '../features/reservation/components/UserServiceOption';
import UserServiceSubOption from '../features/reservation/components/UserServiceSubOption';
import UserServiceOptionCart from '../features/reservation/components/UserServiceOptionCart';
import UserServiceRequest from '../features/reservation/components/UserServiceRequest';
import AdminManagerApproval from '../features/admin/pages/AdminManagerApproval';

export const AppRoutes = () => {
  const commonRoutes = [
    { path: '/auth/*', element: <AuthRoutes /> },
    { path: '/', element: <Landing /> },
    { path: '/admin', element: <Navigate to="/admin/users" replace /> },
    { path: '/admin/users', element: <AdminUserManagement /> },
    { path: '/admin/matchingsystem', element: <MatchingSystemPage /> },
    {
      path: '/admin/matchingsystem/:managerId',
      element: <MatchingSystemActionPage />,
    },
    { path: '/admin/managers', element: <MatchingManagerList /> },
    { path: '/admin/manager-approval', element: <AdminManagerApproval /> },
    {
      path: '/admin/manager-approval/:managerId',
      element: <ManagerDetailApproval />,
    },
    {
      path: '/matching/service-checkin',
      element: <ManagerServiceCheckIn />,
    },
    {
      path: '/matching/matching-request',
      element: <ManagerMatchingRequest />,
    },
    {
      path: '/user/service-option',
      element: <UserServiceOption />,
    },
    {
      path: '/user/service-sub-option',
      element: <UserServiceSubOption />,
    },
    {
      path: '/user/service-option-cart',
      element: <UserServiceOptionCart />,
    },
    {
      path: '/user/service-request',
      element: <UserServiceRequest />,
    },
    // {
    //   path: '/admin/manager-approval/:managerId',
    //   element: <ManagerDetailApproval />,
    // },
    { path: '/404', element: <NotFound /> },
    { path: '/about', element: <About /> },
    { path: '/contact', element: <Contact /> },
    { path: '/policy', element: <Policy /> },
    { path: '/terms', element: <Terms /> },
    { path: '*', element: <Navigate to="/404" /> },
  ];

  const routes = useRoutes([
    ...publicRoutes,
    ...protectedRoutes,
    ...commonRoutes,
  ]);

  return <>{routes}</>;
};
