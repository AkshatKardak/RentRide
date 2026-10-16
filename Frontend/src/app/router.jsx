import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Customer Protected Route Guard
export function ProtectedRoute() {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/signin" replace />;
}

// Admin Protected Route Guard
export function AdminRouteGuard({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
