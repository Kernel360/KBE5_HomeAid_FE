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

// 보호된 라우트 라우트 목록/설정
export const protectedAppRoutes = [
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

  // 매니저(MANAGER) 권한이 필요한 라우트
  {
    path: '/matching/service-checkin',
    element: <ManagerServiceCheckIn />,
    allowedRoles: ['ROLE_MANAGER'],
  },
  {
    path: '/matching/matching-request',
    element: <ManagerMatchingRequest />,
    allowedRoles: ['ROLE_MANAGER'],
  },

  // 고객(CUSTOMER) 권한이 필요한 라우트
  {
    path: '/user/service-option',
    element: <UserServiceOption />,
    allowedRoles: ['ROLE_CUSTOMER'],
  },
  {
    path: '/user/service-sub-option',
    element: <UserServiceSubOption />,
    allowedRoles: ['ROLE_CUSTOMER'],
  },
  {
    path: '/user/service-option-cart',
    element: <UserServiceOptionCart />,
    allowedRoles: ['ROLE_CUSTOMER'],
  },
  {
    path: '/user/service-request',
    element: <UserServiceRequest />,
    allowedRoles: ['ROLE_CUSTOMER'],
  },
]; 