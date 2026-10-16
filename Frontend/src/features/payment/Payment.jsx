import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "@/hooks/useTheme";
import {
  CreditCard,
  Wallet,
  Building2,
  Lock,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Tag,
  Loader,
  CheckCircle,
  AlertCircle,
  Car,
  Info,
  Sparkles,
  X
} from "lucide-react";
import { paymentService } from '@/features/payment/paymentService';
import { bookingService } from '@/features/bookings/bookingService';
import { loadRazorpayScript, initRazorpayPayment } from "@/features/payment/razorpay";
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const PaymentSuccessModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-surface border border-border"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center mb-4 text-success border border-success/20">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black mb-1.5 text-text font-display">
            {data.isDamage ? 'Damage Settle Confirmed' : 'Payment Verified!'}
          </h2>

          <p className="text-xs mb-5 text-text-muted">
            {data.isDamage
              ? `The maintenance repair bill for ${data.carName} has been cleared.`
              : <>Your trip booking for <span className="font-bold text-primary">{data.carName}</span> is confirmed.</>
            }
          </p>

          <div className="w-full rounded-2xl p-4 mb-5 border border-border bg-surface-sunken">
            <p className="text-[10px] uppercase font-bold tracking-wider mb-0.5 text-text-subtle font-mono">
              Amount Paid
            </p>
            <p className="text-2xl font-black text-primary font-mono tabular-nums">
              ₹{data.amount?.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] mt-1 font-mono text-text-subtle truncate">
              Ref: {data.paymentId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-primary/25 flex items-center justify-center gap-2"
          >
            <span>View Itinerary</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  const incoming = location.state || {};

  const isDamagePayment = !!incoming.damageReportId;
  const isExistingBooking = !!incoming.bookingId && !isDamagePayment;
  const isNewBooking = !isExistingBooking && !isDamagePayment && incoming.carId && incoming.carName && incoming.startDate && incoming.endDate;

  const summary = useMemo(() => {
    if (isDamagePayment) {
      return {
        type: 'damage',
        damageReportId: incoming.damageReportId,
        carName: incoming.carName,
        total: incoming.actualCost,
        bookingId: incoming.bookingId
      };
    }

    if (isExistingBooking) {
      return {
        type: 'existing_booking',
        bookingId: incoming.bookingId,
        carName: incoming.carName,
        total: incoming.totalPrice,
        startDate: incoming.startDate,
        endDate: incoming.endDate,
        days: incoming.days
      };
    }

    const carName = incoming.carName || "Selected Vehicle";
    const carId = incoming.carId;
    const days = incoming.days || 2;

    const baseFare = incoming.baseFare ?? (incoming.pricePerDay ? incoming.pricePerDay * days : 0);
    const taxesFees = incoming.taxesFees ?? 0;
    const deposit = incoming.deposit ?? 0;
    const promoCode = incoming.promoCode ?? "";
    const promoDiscount = incoming.promoDiscount ?? 0;

    const total = Math.max(0, baseFare + taxesFees + deposit - promoDiscount);

    return {
      type: 'new_booking',
      carName,
      carId,
      days,
      baseFare,
      taxesFees,
      deposit,
      promoCode,
      promoDiscount,
      total,
      startDate: incoming.startDate,
      endDate: incoming.endDate,
    };
  }, [incoming, isDamagePayment, isExistingBooking, isNewBooking]);

  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [upiId, setUpiId] = useState('');

  // Check incoming promo or localStorage rentride_active_promo
  const initialPromo = useMemo(() => {
    if (incoming.promoCode) return { code: incoming.promoCode };
    try {
      return JSON.parse(localStorage.getItem('rentride_active_promo')) || 
             JSON.parse(localStorage.getItem('appliedPromoCode')) || null;
    } catch {
      return null;
    }
  }, [incoming.promoCode]);

  const [promoCode, setPromoCode] = useState(initialPromo?.code || '');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  const [currentDiscount, setCurrentDiscount] = useState(summary?.promoDiscount || 0);
  const [currentPromoCode, setCurrentPromoCode] = useState(summary?.promoCode || initialPromo?.code || '');

  // Auto-apply promo from Hub if available on mount
  useEffect(() => {
    if (initialPromo?.code && summary?.baseFare && !appliedCoupon) {
      paymentService.validateCoupon(initialPromo.code.trim(), summary.baseFare)
        .then(res => {
          if (res.success && res.data) {
            setCurrentDiscount(res.data.discountAmount);
            setCurrentPromoCode(res.data.code);
            setAppliedCoupon(true);
            toast.success(`Active Voucher "${res.data.code}" applied! You save ₹${res.data.discountAmount}`);
          }
        })
        .catch(() => {});
    }
  }, [initialPromo, summary?.baseFare]);

  const calculateFinalTotal = () => {
    if (!summary) return 0;
    if (summary.type !== 'new_booking') return summary.total;
    const baseAmount = summary.baseFare + summary.taxesFees + summary.deposit;
    return Math.max(0, baseAmount - currentDiscount);
  };

  const validateUpiId = (upi) => {
    if (!upi) return false;
    return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/.test(upi);
  };

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setLoadingCoupon(true);
      setCouponError('');

      const res = await paymentService.validateCoupon(promoCode.trim(), summary.baseFare);
      if (res.success && res.data) {
        setCurrentDiscount(res.data.discountAmount);
        setCurrentPromoCode(res.data.code);
        setAppliedCoupon(true);
        toast.success(`Coupon applied! You saved ₹${res.data.discountAmount}`);
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load secure Razorpay gateway.');
        setLoading(false);
        return;
      }

      let orderResponse;
      let bookingId = summary.bookingId;

      if (summary.type === 'damage') {
        orderResponse = await paymentService.createDamageOrder(summary.damageReportId);
      } else if (summary.type === 'existing_booking') {
        orderResponse = await paymentService.createOrder({ bookingId: summary.bookingId });
      } else {
        // Create new booking first
        const bookingData = {
          car: summary.carId,
          startDate: summary.startDate,
          endDate: summary.endDate,
          promotionCode: currentPromoCode || null,
          totalPrice: calculateFinalTotal(),
          pickupLocation: { city: 'Mumbai', address: 'BKC Hub' },
          dropoffLocation: { city: 'Mumbai', address: 'BKC Hub' }
        };

        const createBookingRes = await bookingService.createBooking(bookingData);
        if (!createBookingRes.success) {
          throw new Error(createBookingRes.message || 'Failed to create booking');
        }

        bookingId = createBookingRes.data._id;
        orderResponse = await paymentService.createOrder({ bookingId });
      }

      if (!orderResponse.success) {
        if (orderResponse.requiresApproval) {
          toast('Your reservation is awaiting fleet manager confirmation.', { icon: 'ℹ️' });
          navigate('/mybookings');
          return;
        }
        throw new Error(orderResponse.message || 'Payment initiation failed');
      }

      const order = orderResponse.order;

      await initRazorpayPayment(
        order,
        {
          name: summary.carName,
          description: summary.type === 'damage' ? 'Damage Settlement' : 'Self-Drive Vehicle Rental',
        },
        async (response) => {
          try {
            let verifyResponse;
            if (summary.type === 'damage') {
              verifyResponse = await paymentService.verifyDamagePayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                damageReportId: summary.damageReportId
              });
            } else {
              verifyResponse = await paymentService.verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });
            }

            if (verifyResponse.success) {
              localStorage.removeItem('rentride_active_promo');
              localStorage.removeItem('appliedPromoCode');
              setPaymentSuccessData({
                paymentId: response.razorpay_payment_id,
                amount: calculateFinalTotal(),
                carName: summary.carName,
                bookingId: bookingId,
                isDamage: summary.type === 'damage'
              });
              setShowSuccessModal(true);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Support has been notified.');
          }
        },
        (error) => {
          console.error('Payment failed:', error);
          toast.error('Payment was not completed.');
        }
      );

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-6">
            <h1 className="text-3xl font-black text-text font-display">
              Checkout & Payment
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Complete your reservation with 256-bit encrypted transaction processing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left: Payment Form & Methods */}
            <motion.section variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2 space-y-5">
              
              {/* Coupon Drawer */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text font-mono">
                    Promotional Coupon
                  </h3>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.G. RENT500"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    disabled={appliedCoupon}
                    className="flex-1 rounded-xl border border-border bg-surface-sunken px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase disabled:opacity-60 text-text placeholder-text-subtle font-mono"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loadingCoupon || appliedCoupon || !promoCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs disabled:opacity-50 transition flex items-center gap-1.5"
                  >
                    {loadingCoupon ? (
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                    ) : appliedCoupon ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs text-danger mt-2 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={13} /> {couponError}
                  </p>
                )}

                {appliedCoupon && currentDiscount > 0 && !couponError && (
                  <p className="text-xs text-success mt-2 font-semibold flex items-center gap-1.5">
                    <CheckCircle size={13} /> Saved ₹{currentDiscount} with code "{currentPromoCode}"
                  </p>
                )}
              </div>

              {/* Payment Methods Tabs */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-5">
                
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-sunken border border-border">
                  {[
                    { id: 'card', label: 'Card Payment', icon: CreditCard },
                    { id: 'upi', label: 'UPI / QR', icon: Wallet },
                    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                  ].map((m) => {
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          active
                            ? 'bg-surface text-primary shadow-xs border border-border font-bold'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        <m.icon size={15} />
                        <span className="hidden sm:inline">{m.label}</span>
                        <span className="sm:hidden">{m.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Card Tab */}
                {method === "card" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-text font-display">Credit or Debit Card</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Payments are routed via Razorpay PCI-DSS Level 1 certified gateway.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-mono"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          maxLength={5}
                          className="rounded-xl border border-border bg-surface-sunken px-3.5 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-mono"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                          className="rounded-xl border border-border bg-surface-sunken px-3.5 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-mono"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
                      />
                    </div>
                  </div>
                )}

                {/* UPI Tab */}
                {method === "upi" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-text font-display">Instant UPI / VPA</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Approve in Google Pay, PhonePe, Paytm, or enter custom Virtual Payment Address.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-text-subtle font-mono">
                        Virtual Payment Address (VPA)
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-mono"
                      />
                      {upiId && validateUpiId(upiId) && (
                        <p className="text-xs text-success mt-1.5 flex items-center gap-1 font-semibold">
                          <CheckCircle size={12} /> Valid VPA syntax
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <div
                          key={app}
                          className="p-2.5 rounded-xl border border-border bg-surface-sunken text-center hover:border-primary transition cursor-pointer"
                        >
                          <span className="text-xs font-bold text-text">{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Netbanking Tab */}
                {method === "netbanking" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-text font-display">Indian Net Banking</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Direct authorization across 50+ RBI regulated banks.
                      </p>
                    </div>
                    <select className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-3 text-xs focus:outline-none focus:border-primary text-text outline-none">
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Encryption Banner */}
              <div className="rounded-2xl border border-border bg-surface p-4 flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-primary" />
                  <span className="font-semibold text-text">256-Bit SSL Encrypted Ledger</span>
                </div>
                <div className="flex gap-1.5 font-mono text-[10px] uppercase font-bold text-text-subtle">
                  <span className="px-1.5 py-0.5 bg-surface-sunken border border-border rounded">VISA</span>
                  <span className="px-1.5 py-0.5 bg-surface-sunken border border-border rounded">MC</span>
                  <span className="px-1.5 py-0.5 bg-surface-sunken border border-border rounded">UPI</span>
                </div>
              </div>
            </motion.section>

            {/* Right: Order Summary */}
            <motion.aside variants={fadeUp} initial="hidden" animate="show" className="space-y-5">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs sticky top-24 space-y-4">
                <h3 className="font-bold text-sm text-text font-display border-b border-border pb-3">
                  Trip Fare Breakdown
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Vehicle Selected</span>
                    <span className="font-bold text-text text-right truncate max-w-[150px]">{summary.carName}</span>
                  </div>

                  {summary.type === 'new_booking' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Duration</span>
                        <span className="font-mono text-text">{summary.days || 2} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Base Daily Tariff</span>
                        <span className="font-mono text-text">₹{(summary.baseFare || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Taxes & GST (18%)</span>
                        <span className="font-mono text-text">₹{(summary.taxesFees || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Refundable Deposit</span>
                        <span className="font-mono text-text">₹{(summary.deposit || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-text-muted">{summary.type === 'damage' ? 'Damage Repair Assessment' : 'Remaining Balance'}</span>
                      <span className="font-mono text-text">₹{(summary.total || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {currentDiscount > 0 && (
                    <div className="flex justify-between text-success font-semibold">
                      <span>Promo Discount ({currentPromoCode})</span>
                      <span className="font-mono">-₹{currentDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block font-mono">Net Payable</span>
                    <span className="text-[10px] text-text-muted">All taxes included</span>
                  </div>
                  <span className="text-2xl font-black text-primary font-mono tabular-nums">
                    ₹{(calculateFinalTotal() || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{(calculateFinalTotal() || 0).toLocaleString('en-IN')}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </motion.aside>
          </div>
        </main>

        <PaymentSuccessModal
          isOpen={showSuccessModal}
          data={paymentSuccessData}
          onClose={() => navigate('/mybookings')}
        />
      </div>
    </>
  );
};

export default Payment;
