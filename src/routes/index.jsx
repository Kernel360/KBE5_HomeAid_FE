import { useRoutes, Navigate, Routes, Route } from 'react-router-dom';
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
import AdminManagerApproval from '../features/admin/pages/AdminManagerApproval';
import MainPage from "../customer/MainPage.jsx";
import Reservation from "../customer/Rerservation.jsx";
import MyPage from "../customer/mypage/pages/Mypage.jsx";
import CustomerLayout from '../customer/layout/CustomerLayout.jsx';
import ServiceRegistration from '../manager/features/additionalInfoForm/pages/ServiceRegistration.jsx';
import ScheduleSetup from '../manager/features/additionalInfoForm/components/ScheduleSetup.jsx';
import ProfileCompletion from '../manager/features/additionalInfoForm/components/ProfileCompletion.jsx';
import ManagerLayout from '../layouts/ManagerLayout.jsx';
import ManagerMypage from '../manager/features/mypage/pages/ManagerMypage.jsx';

export const AppRoutes = () => {
  const commonRoutes = [
    {
      path: '/',
      element: <CustomerLayout />,
      children: [
        {
          index: true,
          element: <MainPage />,
        },
        {
          path: 'mypage',
          element: <MyPage />,
        }

        // 필요 시 다른 고객 전용 라우트도 여기에 추가
      ],
    },
    {
      path: '/manager/',
      element: <ManagerLayout />,
      children: [
        {
          index: true,
          element: <MainPage />,
        },
        {
          path: 'mypage',
          element: <ManagerMypage />,
        },
        {
          path: 'additional-info', // 별도 경로로 분리
          element: <ServiceRegistration />
        }
      ]
    }
    // { path: '/auth/*', element: <AuthRoutes /> },
    // { path: '/', index: <MainPage /> },
    // { path: '/admin', element: <Navigate to="/admin/users" replace /> },
    // { path: '/admin/users', element: <AdminUserManagement /> },
    // { path: '/admin/matchingsystem', element: <MatchingSystemPage /> },
    // {
    //   path: '/admin/matchingsystem/:managerId',
    //   element: <MatchingSystemActionPage />,
    // },
    // { path: '/admin/managers', element: <MatchingManagerList /> },
    // { path: '/admin/manager-approval', element: <AdminManagerApproval /> },
    // // {
    // //   path: '/admin/manager-approval/:managerId',
    // //   element: <ManagerDetailApproval />,
    // // },
    // { path: '/404', element: <NotFound /> },
    // { path: '/about', element: <About /> },
    // { path: '/contact', element: <Contact /> },
    // { path: '/policy', element: <Policy /> },
    // { path: '/terms', element: <Terms /> },
    // { path: '*', element: <Navigate to="/404" /> },
    // { path: '/more', element: <MyPage />},
    // { path: '/reservation', element: <Reservation />},

  ];

  const routes = useRoutes([
    ...publicRoutes,
    ...protectedRoutes,
    ...commonRoutes,
  ]);

  return <>{routes}</>;
};
