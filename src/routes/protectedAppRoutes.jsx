import { Outlet } from 'react-router-dom';
import AdminLayout from '../features/admin/components/layout/AdminLayout';
import Dashboard from '../features/admin/pages/Dashboard';
import CustomerList from '../features/admin/pages/CustomerList';
import CustomerPayment from '../features/admin/pages/CustomerPayment';
import ManagerList from '../features/admin/pages/ManagerList';
import MatchingManagement from '../features/admin/pages/MatchingManagement';
import Statistics from '../features/admin/pages/Statistics';
import ManagerSettlement from '../features/admin/pages/ManagerSettlement';
import Inquiries from '../features/admin/pages/Inquiries';
import ReviewManagement from '../features/admin/pages/ReviewManagement';
import ManagerServiceCheckIn from '../features/matching/pages/ManagerServiceCheckIn';
import ManagerMatchingRequest from '../features/matching/pages/ManagerMatchingRequest';
import UserServiceOption from '../features/reservation/components/UserServiceOption';
import UserServiceSubOption from '../features/reservation/components/UserServiceSubOption';
import UserServiceOptionCart from '../features/reservation/components/UserServiceOptionCart';
import UserServiceRequest from '../features/reservation/components/UserServiceRequest';
import UserPayment from '../features/payment/pages/UserPayment';
import UserPaymentComplete from '../features/payment/pages/UserPaymentComplete';
import UserReservationList from '../features/main/UserReservationList';
import UserReservationDetail from '../features/main/UserReservationDetail';
import ServiceRegistration from '../features/additional-info/pages';
import Mypage from '../features/mypage/customer/pages/Mypage';
import ManagerMypage from '../features/mypage/manager/pages/ManagerMypage.jsx';
import ReservationHistoryPage from '../features/review/pages/ReservationHistoryPage';
import ReservationDetailPage from '../features/review/pages/ReservationDetailPage';
import ReviewWritePage from '../features/review/pages/ReviewWritePage';
import InquiryBoard from '../features/mypage/manager/components/InquiryBoard';
import InquiryDetail from '../features/mypage/manager/components/InquiryDetail';
import CreateInquiry from '../features/mypage/manager/components/CreateInquiry';
import CustomerMyAddress from '../features/mypage/customer/components/MyAddress';
import CustomerAddressRegister from '../features/mypage/customer/components/AddressRegister';
import ManagerMatchingListPage from '../features/matching/pages/ManagerMatchingListPage';
import MyReviewListPage from '../features/review/pages/MyReviewListPage';
import ReservationDetailWithManagerList from '@/features/admin/pages/ReservationDetailWithManagerList';


// 보호된 라우트 라우트 목록/설정
export const protectedAppRoutes = [
  // 관리자(ADMIN) 권한이 필요한 라우트
  {
    path: '/admin',
    element: <AdminLayout />,
    allowedRoles: ['ROLE_ADMIN'],
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'customers', element: <CustomerList /> },
      { path: 'customer-payments', element: <CustomerPayment /> },
      { path: 'managers', element: <ManagerList /> },
      { path: 'matches', element: <MatchingManagement /> },
      { path: 'matches/reservations/:reservationId/detail', element: <ReservationDetailWithManagerList /> },
      { path: 'reviews', element: <ReviewManagement /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'settlements', element: <ManagerSettlement /> },
      { path: 'inquiries', element: <Inquiries /> },
    ],
  },

  // 고객(CUSTOMER) 권한이 필요한 라우트 (레이아웃 포함)
  {
    path: '/customer',
    element: <Outlet />,
    allowedRoles: ['ROLE_CUSTOMER'],
    children: [
      { path: 'mypage', element: <Mypage /> },
      { path: 'mypage/address', element: <CustomerMyAddress /> },
      { path: 'mypage/address/register', element: <CustomerAddressRegister /> },
      // 예약 관련 경로들 - 고객 권한 필요
      { path: 'service-option', element: <UserServiceOption /> },
      { path: 'service-sub-option', element: <UserServiceSubOption /> },
      { path: 'service-option-cart', element: <UserServiceOptionCart /> },
      { path: 'service-request', element: <UserServiceRequest /> },
      { path: 'payment', element: <UserPayment /> },
      { path: 'payment-complete', element: <UserPaymentComplete /> },
      { path: 'reservations', element: <UserReservationList /> },
      { path: 'reservations/:id', element: <UserReservationDetail /> },
      { path: 'review/history', element: <ReservationHistoryPage /> },
      {
        path: 'review/detail/:reservationId',
        element: <ReservationDetailPage />,
      },
      { path: 'review/write', element: <ReviewWritePage /> },
    ],
  },

  // 매니저(MANAGER) 권한이 필요한 라우트 (레이아웃 포함)
  {
    path: '/manager',
    element: <Outlet />,
    allowedRoles: ['ROLE_MANAGER'],
    children: [
      { path: 'mypage', element: <ManagerMypage /> },
      { path: 'mypage/inquiry', element: <InquiryBoard /> },
      { path: 'mypage/inquiry/create', element: <CreateInquiry /> },
      { path: 'mypage/inquiry/:id', element: <InquiryDetail /> },
      { path: 'additional-info', element: <ServiceRegistration /> },
      { path: 'matching/service-checkin', element: <ManagerServiceCheckIn /> },
      {
        path: 'matching/matching-request',
        element: <ManagerMatchingRequest />,
      },
      { path: 'payment', element: <UserPayment /> },
      { path: 'payment-complete', element: <UserPaymentComplete /> },
      { path: 'review/history', element: <MyReviewListPage /> },
      {
        path: 'review/detail/:reservationId',
        element: <ReservationDetailPage />,
      },
      { path: 'review/write', element: <ReviewWritePage /> },
    ],
  },

  // 매칭 관련 라우트
  {
    path: '/matching/list',
    element: <ManagerMatchingListPage />,
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
];
