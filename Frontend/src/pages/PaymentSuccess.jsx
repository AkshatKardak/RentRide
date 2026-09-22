import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import DashboardNavbar from '../components/layout/DashboardNavbar';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
  };

  const paymentId = searchParams.get('razorpay_payment_id');
  const paymentLinkId = searchParams.get('razorpay_payment_link_id');
  const referenceId = searchParams.get('razorpay_payment_link_reference_id');
  const status = searchParams.get('razorpay_payment_link_status');


  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.bg }}
    >
      <DashboardNavbar />
      
      <div className="flex items-center justify-center px-4 pt-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full rounded-2xl border p-8 text-center shadow-xl"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border
          }}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: theme.text }}>
            Payment Successful!
          </h1>
          
          <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
            Your booking has been confirmed. Thank you for choosing RentRide!
          </p>

          {paymentId && (
            <div 
              className="rounded-xl border p-4 mb-6 text-left"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.textSecondary }}>
                Transaction Details
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.textSecondary }}>Payment ID:</span>
                  <span className="font-mono text-xs" style={{ color: theme.text }}>
                    {paymentId.substring(0, 20)}...
                  </span>
                </div>
                {referenceId && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: theme.textSecondary }}>Reference:</span>
                    <span className="font-mono text-xs" style={{ color: theme.text }}>
                      {referenceId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.textSecondary }}>Status:</span>
                  <span className="font-bold text-green-500">
                    {status === 'paid' ? 'Paid' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/mybookings')}
            className="w-full py-3 px-6 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            View My Bookings
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 py-3 px-6 rounded-xl border font-bold transition-colors flex items-center justify-center gap-2"
            style={{
              borderColor: theme.border,
              color: theme.textSecondary
            }}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
