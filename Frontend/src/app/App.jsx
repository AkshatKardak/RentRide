import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import Home from "@/features/home/Home";
import BrowseCars from "@/features/cars/BrowseCars";
import CarDetails from "@/features/cars/CarDetails";
import MyBookings from "@/features/bookings/MyBookings";
import Payment from "@/features/payment/Payment";
import Offers from "@/features/offers/OffersCode";
import AIAssistant from "@/features/ai/AIAssistant";
import Dashboard from "@/features/home/AppDashboard";
import Aboutx from "@/features/home/Aboutx";
import SignIn from "@/features/auth/SignIn";
import SignUp from "@/features/auth/SignUp";
import { ProtectedRoute, AdminRouteGuard } from "@/app/router";
import BookingConfirmation from "@/features/bookings/BookingConfirmation";
import PaymentSuccess from "@/features/payment/PaymentSuccess";
import ReportDamage from "@/features/damage/ReportDamage";
import MyDamageReports from "@/features/damage/MyDamageReports";
import DamageReportDetail from "@/features/damage/DamageReportDetail";
import UserProfile from "@/features/profile/UserProfile";
import Settings from "@/features/profile/Settings";
import Notifications from "@/features/profile/Notifications";
import HelpSupport from "@/features/profile/HelpSupport";

// Admin Consolidated Modules
import AdminLayout from "@/features/admin/AdminLayout";
import AdminLogin from "@/features/admin/AdminLogin";
import AdminDashboard from "@/features/admin/AdminDashboard";
import VehicleManagement from "@/features/admin/VehicleManagement";
import BookingManagement from "@/features/admin/BookingManagement";
import UserManagement from "@/features/admin/UserManagement";
import PaymentRevenue from "@/features/admin/PaymentRevenue";
import DamageManagement from "@/features/admin/DamageManagement";
import PricingPromotions from "@/features/admin/PricingPromotions";
import Analytics from "@/features/admin/Analytics";

export default function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const landingRoutes = ["/", "/signin", "/signup"];
  const isLandingPage = landingRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { background: '#10b981' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { background: '#ef4444' },
          },
        }}
      />

      {/* Show user navbar only on non-admin pages */}
      {!isAdminRoute && isLandingPage && !isLoggedIn && <Navbar />}

      <main>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Home />}
          />
          <Route
            path="/signin"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignIn />}
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUp />}
          />

          {/* Semi-Public Routes */}
          <Route path="/browsecars" element={<BrowseCars />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/aiassistant" element={<AIAssistant />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mybookings" element={<MyBookings />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/payment" element={<Payment />} />

            {/* Damage Report Routes */}
            <Route path="/report-damage/:bookingId" element={<ReportDamage />} />
            <Route path="/my-damage-reports" element={<MyDamageReports />} />
            <Route path="/damage-report/:id" element={<DamageReportDetail />} />
            <Route path="/admin-damage-reports" element={<Navigate to="/admin/damage" replace />} />

            {/* User Profile Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/help-support" element={<HelpSupport />} />
          </Route>

          {/* =================================================== */}
          {/* CONSOLIDATED ADMIN PORTAL ROUTES */}
          {/* =================================================== */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route
            path="/admin/*"
            element={
              <AdminRouteGuard>
                <AdminLayout />
              </AdminRouteGuard>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="payments" element={<PaymentRevenue />} />
            <Route path="damage" element={<DamageManagement />} />
            <Route path="promotions" element={<PricingPromotions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />} />
        </Routes>
      </main>

      {!isAdminRoute && isLandingPage && !isLoggedIn && <Footer />}
    </div>
  );
}
