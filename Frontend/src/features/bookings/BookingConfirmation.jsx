import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  ArrowRight,
  CheckCircle,
  Loader,
  ArrowLeft
} from 'lucide-react';

import { getCarImageUrl, heroCarImg } from '@/features/cars/carImageMap';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);

  const { car, bookingDetails } = location.state || {};

  if (!car || !bookingDetails) {
    navigate('/browsecars');
    return null;
  }

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      const baseFare = bookingDetails.totalPrice;
      const taxesFees = Math.round(baseFare * 0.12);
      const deposit = 500;

      navigate('/payment', {
        state: {
          bookingId: null,
          carId: car._id,
          carName: `${car.brand} ${car.model}`,
          carImage: car.images?.[0],
          startDate: bookingDetails.startDate,
          endDate: bookingDetails.endDate,
          days: bookingDetails.days,
          pricePerDay: car.pricePerDay,
          baseFare: baseFare,
          taxesFees: taxesFees,
          deposit: deposit,
          pickupLocation: bookingDetails.pickupLocation,
          dropoffLocation: bookingDetails.dropoffLocation,
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const baseFare = bookingDetails.totalPrice;
  const taxesFees = Math.round(baseFare * 0.12);
  const deposit = 500;
  const totalAmount = baseFare + taxesFees + deposit;

  const carImageSrc = getCarImageUrl(car);

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-12 transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 transition font-medium text-muted hover:text-primary"
        >
          <ArrowLeft size={18} /> <span>Back</span>
        </button>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-text mb-2">
            Confirm Your Reservation
          </h1>
          <p className="text-muted text-sm">
            Review your itinerary, dates, and vehicle verification before escrow settlement
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Details */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Vehicle Details
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <div className="w-full sm:w-40 h-28 rounded-2xl bg-surface-sunken border border-border p-2 flex items-center justify-center shrink-0">
                  <img 
                    src={carImageSrc}
                    alt={car.name || `${car.brand} ${car.model}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = heroCarImg;
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-xl text-text">
                    {car.name || `${car.brand} ${car.model}`}
                  </h3>
                  <p className="text-xs text-muted mt-1 font-mono uppercase">
                    {car.brand} • {car.year} • {car.variant || 'Base'}
                  </p>
                  <p className="text-xs text-muted mt-1 font-mono uppercase">
                    {car.fuelType} • {car.transmission} • {car.seats || 5} Seats
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Verified Available
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Booking Information */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h2 className="text-lg font-display font-bold text-text mb-4">
                Booking Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                      Pickup Date
                    </p>
                    <p className="font-semibold text-text text-sm">
                      {new Date(bookingDetails.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                      Return Date
                    </p>
                    <p className="font-semibold text-text text-sm">
                      {new Date(bookingDetails.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                      Duration
                    </p>
                    <p className="font-mono font-bold text-text text-sm">
                      {bookingDetails.days} {bookingDetails.days === 1 ? 'Day' : 'Days'}
                    </p>
                  </div>
                </div>

                {bookingDetails.pickupLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                        Pickup Location
                      </p>
                      <p className="font-semibold text-text text-sm">
                        {bookingDetails.pickupLocation}
                      </p>
                    </div>
                  </div>
                )}

                {bookingDetails.dropoffLocation && bookingDetails.dropoffLocation !== bookingDetails.pickupLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                        Dropoff Location
                      </p>
                      <p className="font-semibold text-text text-sm">
                        {bookingDetails.dropoffLocation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Price Summary */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-border bg-surface p-6 sticky top-24 shadow-xs"
            >
              <h2 className="text-lg font-display font-bold text-text mb-4">
                Price Summary
              </h2>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">
                    ₹{car.pricePerDay?.toLocaleString()} × {bookingDetails.days} {bookingDetails.days === 1 ? 'day' : 'days'}
                  </span>
                  <span className="font-bold text-text">
                    ₹{baseFare.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-muted">Taxes & Fees (12%)</span>
                  <span className="font-bold text-text">
                    ₹{taxesFees.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-muted">
                    Security Deposit <span className="opacity-70">(Refundable)</span>
                  </span>
                  <span className="font-bold text-text">
                    ₹{deposit}
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Total Amount
                    </p>
                    <p className="text-[10px] text-muted opacity-80">
                      Incl. all taxes
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary font-mono">
                    ₹{totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 text-sm"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center mt-3 text-muted">
                You can apply promo coupons on the payment page
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;