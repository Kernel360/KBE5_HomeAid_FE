// Import components for public routes
import UserServiceOption from '../features/reservation/components/UserServiceOption';
import UserServiceSubOption from '../features/reservation/components/UserServiceSubOption';
import UserServiceOptionCart from '../features/reservation/components/UserServiceOptionCart';
import UserServiceRequest from '../features/reservation/components/UserServiceRequest';
import UserPayment from '../features/payment/pages/UserPayment';
import UserPaymentComplete from '../features/payment/pages/UserPaymentComplete';
import ManagerMatchingRequest from '../features/matching/pages/ManagerMatchingRequest';
import ManagerServiceCheckIn from '../features/matching/pages/ManagerServiceCheckIn';
import ManagerMatchingList from '../features/matching/pages/ManagerMatchingList';
import BoardList from '../features/board/pages/BoardList';
import BoardDetail from '../features/board/pages/BoardDetail';
import BoardWrite from '../features/board/pages/BoardWrite';

// Define routes that are accessible without authentication
export const publicRoutes = [
  // Development routes (remove these in production)
  { path: '/user/service-option', element: <UserServiceOption /> },
  { path: '/user/service-sub-option', element: <UserServiceSubOption /> },
  { path: '/user/service-option-cart', element: <UserServiceOptionCart /> },
  { path: '/user/service-request', element: <UserServiceRequest /> },
  { path: '/user/payment', element: <UserPayment /> },
  { path: '/user/payment-complete', element: <UserPaymentComplete /> },
  { path: '/matching/list', element: <ManagerMatchingList /> },
  { path: '/matching/matching-request', element: <ManagerMatchingRequest /> },
  { path: '/matching/service-checkin', element: <ManagerServiceCheckIn /> },
  { path: '/board', element: <BoardList /> },
  { path: '/board/list', element: <BoardList /> },
  { path: '/board/notice/:id', element: <BoardDetail /> },
  { path: '/board/inquiry/:id', element: <BoardDetail /> },
  { path: '/board/write', element: <BoardWrite /> },
];
