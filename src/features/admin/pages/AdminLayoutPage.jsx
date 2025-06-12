import React from 'react';
import {  Outlet } from 'react-router-dom';
import './AdminLayoutPage.css';

function AdminLayoutPage() {

  return (
    <div className="admin-dashboard-content">
      <Outlet />
    </div>
  );
}

export default AdminLayoutPage;
