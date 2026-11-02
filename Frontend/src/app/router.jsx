import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Customer Protected Route Guard
export function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const isValid = !!(token && token !== 'undefined' && token !== 'null');
  return isValid ? <Outlet /> : <Navigate to="/signin" replace />;
}

// Admin Protected Route Guard
export function AdminRouteGuard({ children }) {
  const token = localStorage.getItem('adminToken');
  const rawAdminUser = localStorage.getItem('adminUser');
  let isAdmin = false;

  try {
    if (rawAdminUser && rawAdminUser !== 'undefined' && rawAdminUser !== 'null') {
      const parsed = JSON.parse(rawAdminUser);
      isAdmin = parsed?.role === 'admin' || parsed?.isDemo === true;
    }
  } catch (e) {
    isAdmin = false;
  }

  const isValid = !!(token && token !== 'undefined' && token !== 'null') && isAdmin;
  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
