import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUserManagement from '../pages/AdminUserManagement';
import MatchingSystemPage from '../pages/MatchingSystemPage';
import MatchingSystemActionPage from '../pages/MatchingSystemActionPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboardPage />} />
      <Route path="/users" element={<AdminUserManagement />} />
      <Route path="/manager-approval" element={<AdminManagerApproval />} />
      <Route path="/matching" element={<MatchingSystemPage />} />
      <Route path="/matching/:id" element={<MatchingSystemActionPage />} />
    </Routes>
  );
};

export default AdminRoutes;
