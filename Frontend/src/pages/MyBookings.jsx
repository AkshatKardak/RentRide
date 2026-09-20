import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  CalendarDays,
  Clock,
  MapPin,
  Car,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import damageService from '../services/damageService';
import { loadRazorpayScript, initRazorpayPayment } from '../utils/razorpay';
import DashboardNavbar from '../components/layout/DashboardNavbar';


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
  };

  useEffect(() => {
    fetchData();

    // Check if redirected from payment success
    if (location.state?.paymentSuccess) {
      setSuccessData(location.state);
      setShowSuccessModal(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, damagesRes] = await Promise.all([
        bookingService.getUserBookings(),
        damageService.getUserDamageReports()
      ]);

      setDamageReports(damagesRes.data || []);

      const mappedBookings = (bookingsRes.data || [])
        .filter(b => b.status !== 'cancelled')
        .map(b => ({
          id: b._id,
          carId: b.car?._id || b.car,
          carName: b.car ? `${b.car.brand} ${b.car.model}` : 'Unknown Car',
          status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
          paymentStatus: b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1),
          pickup: b.car?.city || b.pickupLocation?.city || 'Store Location',
          dropoff: 'Store Location',
          start: new Date(b.startDate).toLocaleDateString() + ' ' + new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: new Date(b.endDate).toLocaleDateString() + ' ' + new Date(b.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          total: b.totalPrice
        }));

      setBookings(mappedBookings);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayDamage = async (damageReportId, amount, carName) => {
    try {
      setLoading(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK');
        setLoading(false);
        return;
      }

      const orderResponse = await paymentService.createDamageOrder(damageReportId);

      await initRazorpayPayment(
        orderResponse.order,
        {
          name: carName,
          description: `Damage Repair Payment`,
        },
        async (response) => {
          try {
            const verifyResponse = await paymentService.verifyDamagePayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              damageReportId
            });

            if (verifyResponse.success) {
              setSuccessData({
                bookingId: `DMG-${damageReportId.slice(-6)}`,
                amount: amount,
                paymentId: response.razorpay_payment_id,
                carName: `${carName} (Damage)`
              });
              setShowSuccessModal(true);
              fetchData();
            }
          } catch (error) {
            console.error('Verification failed', error);
            alert('Payment verification failed');
          }
        },
        (error) => {
          console.error('Payment failed', error);
          alert('Payment failed');
        }
      );
    } catch (error) {
      console.error('Damage payment error:', error);
      alert(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBooking = async (bookingId, total, carName) => {
    try {
      setLoading(true);

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await paymentService.createOrder({ bookingId });

      if (!orderResponse.success) {
        if (orderResponse.requiresApproval) {
          alert('Your booking is awaiting admin approval. You will be able to pay once approved.');
          setLoading(false);
          return;
        }
        throw new Error('Failed to create payment order');
      }

      const order = orderResponse.order;

      // Initialize Razorpay payment
      await initRazorpayPayment(
        order,
        {
          name: carName,
          description: `Car Rental Payment`,
        },
        async (response) => {
          // Payment successful callback
          try {
            const verifyResponse = await paymentService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              setSuccessData({
                bookingId: bookingId,
                amount: total,
                paymentId: response.razorpay_payment_id,
                carName: carName
              });
              setShowSuccessModal(true);
              setShowSuccessModal(true);
              fetchData(); // Refresh bookings
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        (error) => {
          // Payment failed callback
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
        }
      );

    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, paymentStatus) => {
    if (paymentStatus === 'Paid') {
      alert('Cannot cancel a paid booking. Please contact support for refund.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      alert('Booking cancelled successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return 'px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200';
      case 'Pending': return 'px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200';
      case 'Cancelled': return 'px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200';
      case 'Completed': return 'px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200';
      default: return 'px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200';
    }
  };

  const paymentBadge = (status) => {
    switch (status) {
      case 'Paid': return 'px-2 py-1 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold';
      case 'Pending': return 'px-2 py-1 rounded-lg bg-orange-500/10 text-orange-600 text-xs font-bold';
      case 'Failed': return 'px-2 py-1 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold';
      default: return 'px-2 py-1 rounded-lg bg-gray-500/10 text-gray-600 text-xs font-bold';
    }
  };

  return (
    <>
    <DashboardNavbar/>
    <div
      className="min-h-screen pt-20 transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-end justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'
              }}
            >
              <CalendarDays className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-black tracking-tight"
                style={{ color: theme.text }}
              >
                My Bookings
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                Manage your reservations
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/browsecars")}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white font-black hover:bg-green-600 transition border-2 border-transparent"
          >
            <Car className="w-4 h-4" />
            Browse Cars
          </button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div variants={fadeUp} className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border p-8 shadow-sm"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}
          >
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="w-16 h-16 opacity-30 mb-4" style={{ color: theme.textSecondary }} />
              <p className="font-black text-xl" style={{ color: theme.text }}>
                No bookings yet
              </p>
              <p className="text-sm mt-2" style={{ color: theme.textSecondary }}>
                Book your first car and it will appear here.
              </p>

              <button
                onClick={() => navigate("/browsecars")}
                className="mt-6 px-6 py-3 rounded-xl bg-green-500 text-white font-black hover:bg-green-600 transition"
              >
                Browse Cars
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((b, idx) => {
              const damageReport = damageReports.find(d => d.booking?._id === b.id || d.booking === b.id);
              const hasUnpaidDamage = damageReport && damageReport.status === 'approved' && damageReport.paymentStatus !== 'paid';
              const hasPaidDamage = damageReport && damageReport.paymentStatus === 'paid';

              return (
                <motion.div
                  key={b.id || idx}
                  whileHover={{
                    y: -6,
                    scale: 1.01,
                    boxShadow: isDarkMode
                      ? "0 10px 30px -10px rgba(16, 185, 129, 0.3)"
                      : "0 10px 30px -10px rgba(0,0,0,0.1)",
                  }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="rounded-2xl border p-6 shadow-sm hover:border-green-500/30 transition-colors"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                        Booking ID
                      </p>
                      <p className="font-black text-lg" style={{ color: theme.text }}>
                        {b.id}
                      </p>
                      <p className="text-green-500 text-sm mt-1 font-semibold">
                        {b.carName}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={statusBadge(b.status)}>{b.status}</span>
                      <span className={paymentBadge(b.paymentStatus)}>{b.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className="rounded-xl border p-4"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border
                      }}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: theme.textSecondary }}>
                        <MapPin className="w-4 h-4 text-green-500" />
                        Pickup
                      </div>
                      <p className="mt-1 font-bold text-sm" style={{ color: theme.text }}>
                        {b.pickup}
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                        {b.start}
                      </p>
                    </div>

                    <div
                      className="rounded-xl border p-4"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border
                      }}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: theme.textSecondary }}>
                        <MapPin className="w-4 h-4 text-green-500" />
                        Drop-off
                      </div>
                      <p className="mt-1 font-bold text-sm" style={{ color: theme.text }}>
                        {b.dropoff}
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                        {b.end}
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-5 flex items-center justify-between gap-3 pt-4 border-t"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-500" />
                      <p className="text-sm" style={{ color: theme.textSecondary }}>
                        Total:{" "}
                        <span className="font-black" style={{ color: theme.text }}>
                          ₹{b.total?.toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/car/${b.carId || "porsche"}`)}
                        className="px-4 py-2 rounded-xl border font-bold hover:bg-opacity-50 transition text-sm"
                        style={{
                          backgroundColor: theme.cardBg,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                      >
                        View
                      </button>

                      {/* Show Pay button only if payment is pending */}
                      {b.paymentStatus === 'Pending' && b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handlePayBooking(b.id, b.total, b.carName)}
                          className="px-4 py-2 rounded-xl bg-green-500 text-white font-black hover:bg-green-600 transition text-sm"
                          disabled={loading}
                        >
                          Pay
                        </button>
                      )}

                      {/* Show Cancel button if not paid and not cancelled */}
                      {b.paymentStatus !== 'Paid' && b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(b.id, b.paymentStatus)}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition text-sm border border-red-200"
                        >
                          Cancel
                        </button>
                      )}



                      {/* Show Report Damage button if Paid and no existing report */}
                      {b.paymentStatus === 'Paid' && !damageReport && (
                        <button
                          onClick={() => navigate(`/report-damage/${b.id}`)}
                          className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition text-sm border border-orange-200 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Report Damage
                        </button>
                      )}

                      {/* Show Pay Damage button if needed */}
                      {hasUnpaidDamage && (
                        <button
                          onClick={() => handlePayDamage(damageReport._id, damageReport.actualCost, b.carName)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition text-sm flex items-center gap-1 animate-pulse shadow-lg shadow-red-200"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Pay Damage (₹{damageReport.actualCost.toLocaleString()})
                        </button>
                      )}

                      {hasPaidDamage && (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Damage Paid
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.main>

      {/* Payment Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl border p-8 max-w-md w-full shadow-2xl"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>

                <h2 className="text-3xl font-black mb-2" style={{ color: theme.text }}>
                  Payment Successful!
                </h2>

                <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
                  Your payment has been processed successfully
                </p>

                <div
                  className="w-full rounded-2xl border p-6 mb-6"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.textSecondary }}>Car</span>
                      <span className="font-bold" style={{ color: theme.text }}>
                        {successData?.carName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.textSecondary }}>Booking ID</span>
                      <span className="font-bold" style={{ color: theme.text }}>
                        {successData?.bookingId?.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.textSecondary }}>Payment ID</span>
                      <span className="font-bold" style={{ color: theme.text }}>
                        {successData?.paymentId?.slice(-8)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-sm pt-3 border-t"
                      style={{ borderColor: theme.border }}
                    >
                      <span style={{ color: theme.textSecondary }}>Amount Paid</span>
                      <span className="font-black text-lg text-green-500">
                        ₹{successData?.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-4 rounded-2xl bg-green-500 text-white font-black hover:bg-green-600 transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default MyBookings;
