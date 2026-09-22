import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
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
  Sparkles
} from "lucide-react";
import { paymentService } from "../services/paymentService";
import { bookingService } from "../services/bookingService";
import { loadRazorpayScript, initRazorpayPayment } from "../utils/razorpay";
import DashboardNavbar from '../components/layout/DashboardNavbar';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ... existing imports

const PaymentSuccessModal = ({ isOpen, onClose, data, theme }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-black mb-2" style={{ color: theme.text }}>
            {data.isDamage ? 'Damage Settlement Successful!' : 'Payment Successful!'}
          </h2>

          <p className="text-sm mb-8" style={{ color: theme.textSecondary }}>
            {data.isDamage
              ? `The repair bill for ${data.carName} has been cleared.`
              : <>Your booking for <span className="font-bold text-green-500">{data.carName}</span> has been confirmed.</>
            }
          </p>

          <div
            className="w-full rounded-2xl p-4 mb-8"
            style={{ backgroundColor: theme.bg }}
          >
            <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: theme.textSecondary }}>
              Amount Paid
            </p>
            <p className="text-3xl font-black text-green-500">
              ₹{data.amount?.toLocaleString()}
            </p>
            <p className="text-xs mt-2 font-mono opacity-60" style={{ color: theme.text }}>
              ID: {data.paymentId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
          >
            Continue to Bookings
            <ArrowRight className="w-5 h-5" />
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
  // ... rest of the component ...

  // Check if payment data exists
  // It could be a new booking (carId + carName + dates) or an existing booking/damage (bookingId or damageReportId)
  const isDamagePayment = !!incoming.damageReportId;
  const isExistingBooking = !!incoming.bookingId && !isDamagePayment;
  const isNewBooking = !isExistingBooking && !isDamagePayment && incoming.carId && incoming.carName && incoming.startDate && incoming.endDate;

  const hasPaymentData = isDamagePayment || isExistingBooking || isNewBooking;

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

    const carName = incoming.carName || "Selected Car";
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
  }, [incoming, hasPaymentData, isDamagePayment, isExistingBooking, isNewBooking]);

  const [method, setMethod] = useState("card");
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holder, setHolder] = useState("");
  const [upiId, setUpiId] = useState('');

  const [promoCode, setPromoCode] = useState(incoming.promoCode || '');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(incoming.promoCode ? true : false);

  // Dynamic pricing states
  const [currentDiscount, setCurrentDiscount] = useState(summary?.promoDiscount || 0);
  const [currentPromoCode, setCurrentPromoCode] = useState(summary?.promoCode || '');

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
  };

  // Calculate final total with current discount
  const calculateFinalTotal = () => {
    if (!summary) return 0;
    if (summary.type !== 'new_booking') return summary.total;
    const baseAmount = summary.baseFare + summary.taxesFees + summary.deposit;
    return Math.max(0, baseAmount - currentDiscount);
  };

  // UPI ID validation function
  const validateUpiId = (upi) => {
    if (!upi) return false;
    // UPI format: username@provider
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
    return upiRegex.test(upi);
  };

  // Show empty state if no payment data
  if (!hasPaymentData) {
    return (
      <>
        <DashboardNavbar />
        <div
          className="min-h-screen transition-colors duration-300 pt-20"
          style={{ backgroundColor: theme.bg }}
        >
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border p-12 text-center shadow-xl"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <div
                className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>

              <h1 className="text-3xl font-black mb-3" style={{ color: theme.text }}>
                No Payment Details Found
              </h1>

              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                You need to select a car and complete the booking form before proceeding to payment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/browsecars')}
                  className="px-8 py-4 rounded-2xl bg-green-500 text-white font-black hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  <Car className="w-5 h-5" />
                  Browse Cars
                </button>

                <button
                  onClick={() => navigate('/mybookings')}
                  className="px-8 py-4 rounded-2xl border font-black hover:bg-opacity-50 transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    color: theme.text
                  }}
                >
                  My Bookings
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </>
    );
  }

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setLoadingCoupon(true);
    setCouponError('');

    try {
      // Call your promotion validation API
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5005/api/promotions/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode,
          vehicleId: summary.carId,  // Changed from carId to vehicleId
          bookingAmount: summary.baseFare + summary.taxesFees + summary.deposit
        })
      });

      const result = await response.json();

      // Fixed response structure - result.data.discount
      if (result.success && result.data && result.data.discount > 0) {
        setCurrentDiscount(result.data.discount);
        setCurrentPromoCode(promoCode);
        setAppliedCoupon(true);
        setCouponError('');

        // Show success message
        const savedAmount = result.data.discount;
        const finalAmount = result.data.finalAmount;
        toast.success(`Coupon "${promoCode}" applied! Saved ₹${savedAmount.toLocaleString()}`);
      } else {
        const errorMsg = result.message || 'Invalid or expired coupon code';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        setAppliedCoupon(false);
        setCurrentDiscount(0);
        setCurrentPromoCode('');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Failed to apply coupon. Please try again.');
      toast.error('Failed to apply coupon. Please try again.');
      setAppliedCoupon(false);
      setCurrentDiscount(0);
      setCurrentPromoCode('');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      let bookingId = summary.bookingId;
      let order;

      if (summary.type === 'new_booking') {
        // Create booking first
        const bookingData = {
          carId: summary.carId,
          startDate: summary.startDate,
          endDate: summary.endDate,
          totalPrice: calculateFinalTotal(),
          discount: currentDiscount,
          promotionCode: currentPromoCode || null
        };

        const bookingResponse = await bookingService.createBooking(bookingData);
        if (!bookingResponse.success) throw new Error(bookingResponse.message || 'Failed to create booking');
        bookingId = bookingResponse.data._id;

        // Create Order
        const orderResponse = await paymentService.createOrder({ bookingId });
        if (!orderResponse.success) throw new Error('Failed to create payment order');
        order = orderResponse.order;
      } else if (summary.type === 'existing_booking') {
        // Just create order for existing booking
        const orderResponse = await paymentService.createOrder({ bookingId });
        if (!orderResponse.success) throw new Error('Failed to create payment order');
        order = orderResponse.order;
      } else if (summary.type === 'damage') {
        // Create damage order
        const orderResponse = await paymentService.createDamageOrder(summary.damageReportId);
        if (!orderResponse.success) throw new Error('Failed to create damage payment order');
        order = orderResponse.order;
      }

      // Initialize Razorpay payment
      const paymentResult = await initRazorpayPayment(
        order,
        {
          name: summary.carName,
          description: summary.type === 'damage' ? 'Damage Repair Bill' : `${summary.days} days rental`,
        },
        async (response) => {
          // Payment successful callback
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
              setPaymentSuccessData({
                amount: calculateFinalTotal(),
                paymentId: response.razorpay_payment_id,
                carName: summary.carName,
                bookingId: bookingId,
                isDamage: summary.type === 'damage'
              });
              setShowSuccessModal(true);
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

  const tabClass = (active) => `
    flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm 
    transition-all flex items-center justify-center gap-2 shadow-sm
    ${active ? 'shadow-md' : 'hover:shadow-md'}
  `;

  return (
    <>
      <DashboardNavbar />
      <div
        className="min-h-screen transition-colors duration-300 pt-20"
        style={{ backgroundColor: theme.bg }}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.h1
            className="text-3xl sm:text-4xl font-black mb-2"
            style={{ color: theme.text }}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            Select Payment Method
          </motion.h1>

          <motion.p
            className="mb-8 text-sm sm:text-base"
            style={{ color: theme.textSecondary }}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            Choose how you want to pay for your ride.
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Payment form */}
            <motion.section
              className="lg:col-span-2 space-y-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              {/* Coupon */}
              <div
                className="rounded-3xl border p-4 sm:p-6 shadow-lg"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-green-500" />
                  <p className="font-bold text-base sm:text-lg" style={{ color: theme.text }}>
                    Have a Coupon Code?
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setCouponError(''); // Clear error on change
                    }}
                    disabled={appliedCoupon}
                    className="flex-1 rounded-xl border px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: appliedCoupon ? theme.border : theme.inputBg,
                      borderColor: couponError ? '#ef4444' : (appliedCoupon ? '#10b981' : theme.border),
                      color: theme.text
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loadingCoupon || appliedCoupon || !promoCode.trim()}
                    className="px-6 py-3 rounded-xl bg-green-500 text-white font-black text-sm hover:bg-green-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingCoupon ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Applying...</span>
                      </>
                    ) : appliedCoupon ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Applied</span>
                      </>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {/* Error message */}
                {couponError && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {couponError}
                    </p>
                  </div>
                )}

                {/* Success message */}
                {appliedCoupon && currentDiscount > 0 && !couponError && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs text-green-700 font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Woohoo! You saved ₹{currentDiscount} with code "{currentPromoCode}"
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div
                className="rounded-3xl border p-4 sm:p-6 space-y-6 shadow-lg"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                {/* Tabs */}
                <div
                  className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl mb-6"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={tabClass(method === "card")}
                    onClick={() => setMethod("card")}
                    style={{
                      backgroundColor: method === "card" ? '#10b981' : 'transparent',
                      color: method === "card" ? '#ffffff' : theme.textSecondary
                    }}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:inline">Credit/Debit Card</span>
                    <span className="sm:hidden">Card</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={tabClass(method === "upi")}
                    onClick={() => setMethod("upi")}
                    style={{
                      backgroundColor: method === "upi" ? '#10b981' : 'transparent',
                      color: method === "upi" ? '#ffffff' : theme.textSecondary
                    }}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">UPI / Wallets</span>
                    <span className="sm:hidden">UPI</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={tabClass(method === "netbanking")}
                    onClick={() => setMethod("netbanking")}
                    style={{
                      backgroundColor: method === "netbanking" ? '#10b981' : 'transparent',
                      color: method === "netbanking" ? '#ffffff' : theme.textSecondary
                    }}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Net Banking</span>
                    <span className="sm:hidden">Bank</span>
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Card Form */}
                  {method === "card" && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <p className="font-bold text-base sm:text-lg" style={{ color: theme.text }}>
                        Credit or Debit Card
                      </p>

                      <p className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
                        Razorpay securely processes all card payments. Click the Pay button below to proceed.
                      </p>

                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          maxLength={19}
                          className="w-full rounded-xl border px-4 py-4 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
                          style={{
                            backgroundColor: theme.inputBg,
                            borderColor: theme.border,
                            color: theme.text
                          }}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            maxLength={5}
                            className="rounded-xl border px-4 py-4 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
                            style={{
                              backgroundColor: theme.inputBg,
                              borderColor: theme.border,
                              color: theme.text
                            }}
                          />

                          <input
                            type="password"
                            placeholder="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            maxLength={4}
                            className="rounded-xl border px-4 py-4 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
                            style={{
                              backgroundColor: theme.inputBg,
                              borderColor: theme.border,
                              color: theme.text
                            }}
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full rounded-xl border px-4 py-4 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
                          style={{
                            backgroundColor: theme.inputBg,
                            borderColor: theme.border,
                            color: theme.text
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* UPI */}
                  {method === "upi" && (
                    <motion.div
                      key="upi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <p className="font-bold text-base sm:text-lg mb-1" style={{ color: theme.text }}>
                          UPI / VPA Payment
                        </p>
                        <p className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
                          Enter your UPI ID or choose from supported UPI applications below.
                        </p>
                      </div>

                      {/* UPI Input */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.textSecondary }}>
                          Enter UPI ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="example@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full rounded-xl border px-4 py-4 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
                            style={{
                              backgroundColor: theme.inputBg,
                              borderColor: theme.border,
                              color: theme.text
                            }}
                          />
                        </div>

                        {upiId && validateUpiId(upiId) && (
                          <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Valid UPI ID
                          </p>
                        )}
                      </div>

                      {/* Popular UPI Apps */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.textSecondary }}>
                          Supported UPI Apps
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          {['GooglePay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                            <motion.div
                              key={app}
                              whileHover={{ y: -2, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              className="p-3 rounded-xl border text-center transition-all hover:border-green-500 hover:shadow-md cursor-pointer"
                              style={{
                                backgroundColor: theme.inputBg,
                                borderColor: theme.border
                              }}
                            >
                              <p className="text-xs font-bold" style={{ color: theme.text }}>
                                {app}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Information Box */}
                      <div
                        className="p-4 rounded-xl border-l-4 border-l-green-500"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#D1FAE5',
                          borderRight: `1px solid ${theme.border}`,
                          borderTop: `1px solid ${theme.border}`,
                          borderBottom: `1px solid ${theme.border}`
                        }}
                      >
                        <p className="text-sm font-bold mb-1 flex items-center gap-1.5" style={{ color: theme.text }}>
                          <Info className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          Quick Tip
                        </p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>
                          After clicking Pay, you will be redirected to Razorpay where you can complete the payment using your UPI app.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Netbanking */}
                  {method === "netbanking" && (
                    <motion.div
                      key="netbanking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <p className="font-bold text-base sm:text-lg" style={{ color: theme.text }}>
                        Net Banking
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
                        Razorpay supports all major banks. Click the Pay button to proceed and select your bank.
                      </p>
                      <select
                        className="w-full rounded-xl border px-4 py-4 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 appearance-none transition-colors"
                        style={{
                          backgroundColor: theme.inputBg,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                      >
                        <option>Select Your Bank</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                        <option>Punjab National Bank</option>
                        <option>Bank of Baroda</option>
                        <option>Other Banks</option>
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust row */}
              <div
                className="rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: theme.textSecondary }}>
                  <Lock className="w-4 h-4 text-green-500" />
                  256-bit SSL Encrypted
                </div>
                <div className="flex gap-2">
                  <BadgeMini theme={theme}>VISA</BadgeMini>
                  <BadgeMini theme={theme}>MC</BadgeMini>
                  <BadgeMini theme={theme}>AMEX</BadgeMini>
                  <BadgeMini theme={theme}>UPI</BadgeMini>
                </div>
              </div>
            </motion.section>

            {/* Right: Summary */}
            <motion.aside
              className="space-y-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div
                className="rounded-3xl border p-6 shadow-lg sticky top-24"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                <h2 className="text-xl font-black mb-4" style={{ color: theme.text }}>
                  Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <SummaryRow
                    label={summary.type === 'damage' ? summary.carName : `${summary.carName} • ${summary.days || 1} days`}
                    value=""
                    theme={theme}
                    bold
                  />
                  <div className="h-px" style={{ backgroundColor: theme.border }} />

                  {summary.type === 'new_booking' ? (
                    <>
                      <SummaryRow label="Base Fare" value={`₹${(summary.baseFare || 0).toLocaleString()}`} theme={theme} />
                      <SummaryRow label="Taxes & Fees" value={`₹${(summary.taxesFees || 0).toLocaleString()}`} theme={theme} />
                      <SummaryRow
                        label="Security Deposit"
                        value={`₹${(summary.deposit || 0).toLocaleString()}`}
                        subtext="(Refundable)"
                        theme={theme}
                      />
                    </>
                  ) : (
                    <SummaryRow
                      label={summary.type === 'damage' ? "Repair Charges" : "Remaining Balance"}
                      value={`₹${(summary.total || 0).toLocaleString()}`}
                      theme={theme}
                    />
                  )}

                  {currentDiscount > 0 && (
                    <SummaryRow
                      label={`Discount (${currentPromoCode})`}
                      value={`-₹${currentDiscount.toLocaleString()}`}
                      theme={theme}
                      valueClass="text-green-600 font-black text-base"
                    />
                  )}
                </div>

                <div className="h-px mb-4" style={{ backgroundColor: theme.border }} />

                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold" style={{ color: theme.textSecondary }}>
                      Total Payable
                    </p>
                    <p className="text-xs" style={{ color: theme.textSecondary }}>
                      Incl. all taxes
                    </p>
                  </div>
                  <div className="text-right">
                    {currentDiscount > 0 && summary.type === 'new_booking' && (
                      <p className="text-sm line-through opacity-60" style={{ color: theme.textSecondary }}>
                        ₹{((summary.baseFare || 0) + (summary.taxesFees || 0) + (summary.deposit || 0)).toLocaleString()}
                      </p>
                    )}
                    <p className="text-3xl font-black text-green-500">
                      ₹{(calculateFinalTotal() || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-2xl bg-green-500 text-white font-black text-base hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{(calculateFinalTotal() || 0).toLocaleString()}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center mt-4" style={{ color: theme.textSecondary }}>
                  By clicking pay, you agree to our{' '}
                  <a href="#" className="text-green-500 hover:underline">Terms & Conditions</a>
                </p>
              </div>

              {/* Trust badges */}
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: theme.text }}>Secure payments</p>
                    <p className="text-xs" style={{ color: theme.textSecondary }}>
                      Powered by Razorpay
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: theme.text }}>Need help?</p>
                    <p className="text-xs" style={{ color: theme.textSecondary }}>
                      Support available 24/7
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </main>

        <PaymentSuccessModal
          isOpen={showSuccessModal}
          data={paymentSuccessData}
          theme={theme}
          onClose={() => navigate('/mybookings')}
        />
      </div>
    </>
  );
};

// Helper components
const SummaryRow = ({ label, value, subtext, theme, bold, valueClass }) => (
  <div className="flex items-center justify-between text-sm">
    <div>
      <span style={{ color: bold ? theme.text : theme.textSecondary }} className={bold ? "font-bold" : ""}>
        {label}
      </span>
      {subtext && (
        <span className="text-xs ml-1" style={{ color: theme.textSecondary }}>
          {subtext}
        </span>
      )}
    </div>
    {value && (
      <span
        className={valueClass || (bold ? "font-bold" : "")}
        style={!valueClass ? { color: bold ? theme.text : theme.textSecondary } : {}}
      >
        {value}
      </span>
    )}
  </div>
);

const BadgeMini = ({ children, theme }) => (
  <div
    className="px-2 py-1 rounded text-xs font-bold border"
    style={{
      backgroundColor: theme.inputBg,
      borderColor: theme.border,
      color: theme.textSecondary
    }}
  >
    {children}
  </div>
);

export default Payment;
