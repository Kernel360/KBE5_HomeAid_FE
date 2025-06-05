import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';

// Define routes that require authentication
export const protectedRoutes = [
  {
    path: '/admin',
    element: <AdminDashboardPage />,
  },
  // Example protected route:
  // { path: '/dashboard', element: <DashboardPage /> },
];
