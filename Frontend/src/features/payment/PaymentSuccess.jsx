import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();

  const paymentId = searchParams.get('razorpay_payment_id');
  const paymentLinkId = searchParams.get('razorpay_payment_link_id');
  const referenceId = searchParams.get('razorpay_payment_link_reference_id');
  const status = searchParams.get('razorpay_payment_link_status');

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 font-sans">
      <DashboardNavbar />
      
      <div className="flex items-center justify-center px-4 pt-32 pb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full rounded-3xl border border-border bg-surface p-8 text-center shadow-xl"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
            className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary/10"
          >
            <CheckCircle className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-text mb-2">
            Payment Confirmed!
          </h1>
          
          <p className="text-xs text-muted mb-6">
            Your rental booking is secured on the tamper-proof ledger. Have a safe journey!
          </p>

          {paymentId && (
            <div className="rounded-2xl border border-border bg-surface-sunken p-4 mb-6 text-left">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-2">
                Transaction Details
              </p>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Payment ID:</span>
                  <span className="font-bold text-text truncate max-w-[180px]">
                    {paymentId}
                  </span>
                </div>
                {referenceId && (
                  <div className="flex justify-between">
                    <span className="text-muted">Reference:</span>
                    <span className="font-bold text-text">
                      {referenceId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Status:</span>
                  <span className="font-bold text-primary">
                    {status === 'paid' ? 'Paid & Settled' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/mybookings')}
            className="w-full py-3.5 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-sm"
          >
            <span>View My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 py-3 px-6 rounded-2xl border border-border hover:bg-surface-sunken text-muted hover:text-text font-bold transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
