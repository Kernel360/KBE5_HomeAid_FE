import ManagerMatchingRequest from '../features/matching/pages/ManagerMatchingRequest';
import ManagerServiceCheckIn from '../features/matching/pages/ManagerServiceCheckIn';
import ManagerMatchingList from '../features/matching/pages/ManagerMatchingList';
import BoardList from '../features/board/pages/BoardList';
import BoardDetail from '../features/board/pages/BoardDetail';
import BoardWrite from '../features/board/pages/BoardWrite';
import EventList from '../features/main/EventList';

// Define routes that are accessible without authentication
export const publicRoutes = [
  // Development routes (remove these in production)
  { path: '/matching/list', element: <ManagerMatchingList /> },
  { path: '/matching/matching-request', element: <ManagerMatchingRequest /> },
  { path: '/matching/service-checkin', element: <ManagerServiceCheckIn /> },
  { path: '/board', element: <BoardList /> },
  { path: '/board/list', element: <BoardList /> },
  { path: '/board/notice/:id', element: <BoardDetail /> },
  { path: '/board/inquiry/:id', element: <BoardDetail /> },
  { path: '/board/write', element: <BoardWrite /> },
  { path: '/event', element: <EventList /> },
  // { path: '/user/reservation-list', element: <UserReservationList /> },
  // { path: '/user/reservation-detail/:id', element: <UserReservationDetail /> },
];
