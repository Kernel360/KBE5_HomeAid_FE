import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminUserManagement from '../features/admin/pages/AdminUserManagement';
import MatchingSystemPage from '../features/admin/pages/MatchingSystemPage';
import MatchingSystemActionPage from '../features/admin/pages/MatchingSystemActionPage';
import MatchingManagerList from '../features/admin/pages/MatchingManagerList';
import ManagerServiceCheckIn from '../features/matching/pages/ManagerServiceCheckIn';
import ManagerMatchingRequest from '../features/matching/pages/ManagerMatchingRequest';
import UserServiceOption from '../features/reservation/components/UserServiceOption';
import UserServiceSubOption from '../features/reservation/components/UserServiceSubOption';
import UserServiceOptionCart from '../features/reservation/components/UserServiceOptionCart';
import UserServiceRequest from '../features/reservation/components/UserServiceRequest';
import ServiceRegistration from '../features/additional-info/pages';
import CustomerLayout from '../layouts/CustomerLayout';
import MainPage from '../features/main/MainPage';
import Mypage from '../features/mypage/customer/pages/Mypage';
import ManagerLayout from '../features/mypage/manager/ManagerMypage';
import ManagerMypage from '../features/mypage/manager/ManagerMypage';

// 보호된 라우트 라우트 목록/설정
export const protectedAppRoutes = [
  // 고객(CUSTOMER) 권한이 필요한 라우트 (레이아웃 포함)
  {
    path: '/',
    element: <CustomerLayout />,
    allowedRoles: ['ROLE_CUSTOMER'],
    children: [
      { index: true, element: <MainPage /> }, // 고객 로그인 후 기본 페이지
      { path: 'mypage', element: <Mypage /> },
      { path: 'user/service-option', element: <UserServiceOption /> },
      { path: 'user/service-sub-option', element: <UserServiceSubOption /> },
      { path: 'user/service-option-cart', element: <UserServiceOptionCart /> },
      { path: 'user/service-request', element: <UserServiceRequest /> },
    ]
  },
  // 매니저(MANAGER) 권한이 필요한 라우트 (레이아웃 포함)
  {
    path: '/manager',
    element: <ManagerLayout />,
    allowedRoles: ['ROLE_MANAGER'],
    children: [
      { index: true, element: <MainPage /> }, // 매니저 로그인 후 기본 페이지
      { path: 'mypage', element: <ManagerMypage /> },
      { path: 'additional-info', element: <ServiceRegistration /> },
      { path: 'matching/service-checkin', element: <ManagerServiceCheckIn /> },
      { path: 'matching/matching-request', element: <ManagerMatchingRequest /> },
    ]
  },

  // 관리자(ADMIN) 권한이 필요한 라우트
  {
    path: '/admin',
    element: <AdminDashboardPage />,
    allowedRoles: ['ROLE_ADMIN'],
  },
  {
    path: '/admin/users',
    element: <AdminUserManagement />,
    allowedRoles: ['ROLE_ADMIN'],
  },
  {
    path: '/admin/matchingsystem',
    element: <MatchingSystemPage />,
    allowedRoles: ['ROLE_ADMIN'],
  },
  {
    path: '/admin/matchingsystem/:managerId',
    element: <MatchingSystemActionPage />,
    allowedRoles: ['ROLE_ADMIN'],
  },
  {
    path: '/admin/managers',
    element: <MatchingManagerList />,
    allowedRoles: ['ROLE_ADMIN'],
  },
]; 