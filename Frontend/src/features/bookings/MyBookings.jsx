import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import {
  CalendarDays,
  Clock,
  MapPin,
  Car,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowRight
} from "lucide-react";
import { bookingService } from '@/features/bookings/bookingService';
import { paymentService } from '@/features/payment/paymentService';
import damageService from '@/features/damage/damageService';
import { loadRazorpayScript, initRazorpayPayment } from '@/features/payment/razorpay';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { StaggerContainer, StaggerItem, Reveal } from '@/components/fx';

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetchData();

    if (location.state?.paymentSuccess) {
      setSuccessData(location.state);
      setShowSuccessModal(true);
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
          carName: b.car ? `${b.car.brand} ${b.car.model}` : 'Vehicle',
          status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
          paymentStatus: b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1),
          pickup: b.car?.city || b.pickupLocation?.city || 'Central Hub',
          dropoff: 'Central Hub',
          start: new Date(b.startDate).toLocaleDateString() + ' ' + new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: new Date(b.endDate).toLocaleDateString() + ' ' + new Date(b.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          total: b.totalPrice
        }));

      setBookings(mappedBookings);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your connection.');
        setLoading(false);
        return;
      }

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
      await initRazorpayPayment(
        order,
        {
          name: carName,
          description: `Car Rental Payment`,
        },
        async (response) => {
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
              fetchData();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        (error) => {
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
      fetchData();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return 'px-2.5 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-bold border border-success/20';
      case 'Pending': return 'px-2.5 py-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-bold border border-warning/20';
      case 'Cancelled': return 'px-2.5 py-0.5 rounded-full bg-danger-soft text-danger text-[10px] font-bold border border-danger/20';
      default: return 'px-2.5 py-0.5 rounded-full bg-surface-sunken text-text-subtle text-[10px] font-bold border border-border';
    }
  };

  const paymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'Paid': return 'px-2.5 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-bold border border-success/20';
      case 'Pending': return 'px-2.5 py-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-bold border border-warning/20';
      case 'Failed': return 'px-2.5 py-0.5 rounded-full bg-danger-soft text-danger text-[10px] font-bold border border-danger/20';
      default: return 'px-2.5 py-0.5 rounded-full bg-surface-sunken text-text-subtle text-[10px] font-bold border border-border';
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-2 font-mono">
                <CalendarDays size={13} /> Reservation Portfolio
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-text font-display">
                My Bookings
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Manage upcoming itineraries, live dispatched rentals, and trip payments.
              </p>
            </div>

            <button
              onClick={() => navigate("/browsecars")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Car size={15} />
              <span>Browse Catalog</span>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-xs">
              <Clock className="w-12 h-12 text-text-subtle mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-text font-display">No Active Reservations</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                You have not booked any vehicles yet. Explore our verified fleet across India to reserve your ride.
              </p>
              <button
                onClick={() => navigate("/browsecars")}
                className="mt-5 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-sm transition"
              >
                Browse Fleet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {bookings.map((b, idx) => {
                const damageReport = damageReports.find(d => d.booking?._id === b.id || d.booking === b.id);
                const hasUnpaidDamage = damageReport && damageReport.status === 'approved' && damageReport.paymentStatus !== 'paid';
                const hasPaidDamage = damageReport && damageReport.paymentStatus === 'paid';

                return (
                  <motion.div
                    key={b.id || idx}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="rounded-2xl border border-border bg-surface p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono">
                            ID: {b.id ? b.id.slice(-8) : idx}
                          </p>
                          <h3 className="font-bold text-base text-text font-display mt-0.5">
                            {b.carName}
                          </h3>
                        </div>
                        <div className="flex flex-col gap-1.5 items-end">
                          <span className={statusBadge(b.status)}>{b.status}</span>
                          <span className={paymentBadge(b.paymentStatus)}>{b.paymentStatus}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                        <div className="rounded-xl border border-border/70 p-3 bg-surface-sunken">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
                            <MapPin size={12} className="text-primary" />
                            <span>Pick-up</span>
                          </div>
                          <p className="mt-1 font-bold text-xs text-text">{b.pickup}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{b.start}</p>
                        </div>

                        <div className="rounded-xl border border-border/70 p-3 bg-surface-sunken">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
                            <MapPin size={12} className="text-primary" />
                            <span>Return</span>
                          </div>
                          <p className="mt-1 font-bold text-xs text-text">{b.dropoff}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{b.end}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={15} className="text-primary" />
                        <span className="text-xs text-text-muted">Total:</span>
                        <span className="font-black text-sm text-text font-mono tabular-nums">
                          ₹{b.total?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex gap-2 items-center flex-wrap">
                        <button
                          onClick={() => navigate(`/car/${b.carId || "all"}`)}
                          className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-sunken text-xs font-semibold text-text transition"
                        >
                          Vehicle Details
                        </button>

                        {b.paymentStatus === 'Pending' && b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handlePayBooking(b.id, b.total, b.carName)}
                            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition"
                            disabled={loading}
                          >
                            Pay Now
                          </button>
                        )}

                        {b.paymentStatus !== 'Paid' && b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(b.id, b.paymentStatus)}
                            className="px-3 py-1.5 rounded-xl border border-danger/30 text-danger hover:bg-danger-soft font-semibold text-xs transition"
                          >
                            Cancel
                          </button>
                        )}

                        {b.paymentStatus === 'Paid' && !damageReport && (
                          <button
                            onClick={() => navigate(`/report-damage/${b.id}`)}
                            className="px-3 py-1.5 rounded-xl border border-warning/40 text-warning hover:bg-warning-soft font-semibold text-xs transition flex items-center gap-1"
                          >
                            <AlertTriangle size={12} />
                            Report Damage
                          </button>
                        )}

                        {hasUnpaidDamage && (
                          <button
                            onClick={() => handlePayDamage(damageReport._id, damageReport.actualCost, b.carName)}
                            className="px-3.5 py-1.5 rounded-xl bg-danger text-white font-bold text-xs shadow-sm flex items-center gap-1 animate-pulse"
                          >
                            <AlertTriangle size={12} />
                            Pay Damage (₹{damageReport.actualCost.toLocaleString('en-IN')})
                          </button>
                        )}

                        {hasPaidDamage && (
                          <span className="px-2.5 py-1 rounded-full bg-success-soft text-success text-[10px] font-bold border border-success/20 flex items-center gap-1">
                            <CheckCircle size={12} /> Damage Settled
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* Payment Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay backdrop-blur-xs flex items-center justify-center z-50 p-4"
              onClick={() => setShowSuccessModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="rounded-3xl border border-border bg-surface p-7 max-w-sm w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl text-text-subtle hover:text-text hover:bg-surface-sunken transition"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center mb-4 text-success border border-success/20">
                    <CheckCircle size={32} />
                  </div>

                  <h3 className="text-xl font-black text-text font-display">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-text-muted mt-1 mb-5">
                    Your digital transaction has been verified on the ledger.
                  </p>

                  <div className="w-full rounded-2xl border border-border bg-surface-sunken p-4 mb-5 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Vehicle</span>
                      <span className="font-bold text-text">{successData?.carName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Booking Reference</span>
                      <span className="font-bold font-mono text-text">{successData?.bookingId?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-text-muted">Total Paid</span>
                      <span className="font-black text-sm text-primary font-mono tabular-nums">
                        ₹{successData?.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-sm transition"
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
