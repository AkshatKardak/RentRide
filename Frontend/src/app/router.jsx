import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ensureAdminSession } from '@/lib/api';

// Customer Protected Route Guard
export function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const isValid = !!(token && token !== 'undefined' && token !== 'null');
  return isValid ? <Outlet /> : <Navigate to="/signin" replace />;
}

// Admin Protected Route Guard with Seamless Demo Session Initialization
export function AdminRouteGuard({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await ensureAdminSession();
      } catch (e) {
        console.error('Admin session initialization error:', e);
      } finally {
        if (active) setReady(true);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl p-2 flex items-center justify-center bg-primary/10 border border-primary/25 shadow-lg shadow-primary/10 animate-pulse">
          <img src="/tab.png" alt="RentRide" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Initializing Fleet Control session...</span>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
