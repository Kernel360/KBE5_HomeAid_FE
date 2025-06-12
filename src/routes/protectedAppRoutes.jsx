import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminUserManagement from '../features/admin/pages/AdminUserManagement';
import MatchingSystemPage from '../features/admin/pages/MatchingSystemPage';
import MatchingSystemActionPage from '../features/admin/pages/MatchingSystemActionPage';
import MatchingManagerList from '../features/admin/pages/MatchingManagerList';
import AdminManagerApproval from '../features/admin/pages/AdminManagerApproval';
import ManagerServiceCheckIn from '../features/matching/pages/ManagerServiceCheckIn';
import ManagerMatchingRequest from '../features/matching/pages/ManagerMatchingRequest';
import ManagerMatchingList from '../features/matching/pages/ManagerMatchingList';
import UserServiceOption from '../features/reservation/components/UserServiceOption';
import UserServiceSubOption from '../features/reservation/components/UserServiceSubOption';
import UserServiceOptionCart from '../features/reservation/components/UserServiceOptionCart';
import UserServiceRequest from '../features/reservation/components/UserServiceRequest';
import UserPayment from '../features/payment/pages/UserPayment';
import UserPaymentComplete from '../features/payment/pages/UserPaymentComplete';
import UserReservationList from '../features/main/UserReservationList';
import UserReservationDetail from '../features/main/UserReservationDetail';
import ServiceRegistration from '../features/additional-info/pages';
import CustomerLayout from '../layouts/CustomerLayout';
import Mypage from '../features/mypage/customer/pages/Mypage';
import ManagerLayout from '../layouts/ManagerLayout';
import ManagerMypage from '../features/mypage/manager/ManagerMypage';
import BoardWrite from '../features/board/pages/BoardWrite';
import BoardList from '../features/board/pages/BoardList';
import BoardDetail from '../features/board/pages/BoardDetail';
import EventList from '../features/main/EventList';
import AdminLayoutPage from '../features/admin/pages/AdminLayoutPage';
import ManagerMain from '../features/manager/pages/ManagerMainPage';

// 보호된 라우트 라우트 목록/설정
export const protectedAppRoutes = [
  // 고객(CUSTOMER) 권한이 필요한 라우트 (레이아웃 포함)
  {
    path: '/customer',
    element: <CustomerLayout />,
    allowedRoles: ['ROLE_CUSTOMER'],
    children: [
      { path: 'mypage', element: <Mypage /> },
      // 예약 관련 경로들 - 고객 권한 필요
      { path: 'service-option', element: <UserServiceOption /> },
      { path: 'service-sub-option', element: <UserServiceSubOption /> },
      { path: 'service-option-cart', element: <UserServiceOptionCart /> },
      { path: 'service-request', element: <UserServiceRequest /> },
      { path: 'payment', element: <UserPayment /> },
      { path: 'payment-complete', element: <UserPaymentComplete /> },
      { path: 'reservations', element: <UserReservationList /> },
      { path: 'reservations/:id', element: <UserReservationDetail /> },
    ],
  },
  // 매니저(MANAGER) 권한이 필요한 라우트 (레이아웃 포함)
  {
    path: '/manager',
    element: <ManagerLayout />,
    allowedRoles: ['ROLE_MANAGER'],
    children: [
      { path: 'mypage', element: <ManagerMypage /> },
      { path: 'additional-info', element: <ServiceRegistration /> },
      { path: 'matching/service-checkin', element: <ManagerServiceCheckIn /> },
      {
        path: 'matching/matching-request',
        element: <ManagerMatchingRequest />,
      },
      { path: 'payment', element: <UserPayment /> },
      { path: 'payment-complete', element: <UserPaymentComplete /> },
    ],
  },

  // 매칭 관련 라우트 (기존 경로 유지 - 직접 접근용)
  {
    path: '/matching/list',
    element: <ManagerMatchingList />,
    allowedRoles: ['ROLE_MANAGER', 'ROLE_ADMIN'],
  },
  {
    path: '/matching/matching-request',
    element: <ManagerMatchingRequest />,
    allowedRoles: ['ROLE_MANAGER', 'ROLE_ADMIN'],
  },
  {
    path: '/matching/service-checkin',
    element: <ManagerServiceCheckIn />,
    allowedRoles: ['ROLE_MANAGER', 'ROLE_ADMIN'],
  },

  // 관리자(ADMIN) 권한이 필요한 라우트
  {
    path: '/admin',
    element: <AdminLayoutPage />,
    allowedRoles: ['ROLE_ADMIN'],
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'users',
        element: <AdminUserManagement />,
      },
      {
        path: 'matchingsystem',
        element: <MatchingSystemPage />,
      },
      {
        path: 'matchingsystem/:managerId',
        element: <MatchingSystemActionPage />,
      },
      {
        path: 'managers',
        element: <MatchingManagerList />,
      },

      {
        path: 'manager-approval',
        element: <AdminManagerApproval />,
      },

    ],
  },
];
