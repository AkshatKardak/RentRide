const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Promotion = require('../models/Promotion');
const paymentService = require('../services/paymentService');

/**
 * Create booking with smart features, instant booking, and add-ons
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      addOns = [],
      promotionCode
    } = req.body;

    const userId = req.user ? (req.user._id || req.user.id) : req.body.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const car = await Car.findById(carId);
    if (!car || !car.available) {
      return res.status(404).json({ success: false, message: 'Car is not available for rental' });
    }

    // Check for conflicting approved or active bookings for selected dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Cleanly expire past holds before checking conflicts
    const now = new Date();
    await Booking.updateMany(
      { car: carId, status: 'held', holdExpiresAt: { $lt: now } },
      { $set: { status: 'expired' } }
    );

    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['approved', 'confirmed', 'active', 'held'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Car is already booked or reserved for the selected dates'
      });
    }

    // Calculate base pricing
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const perDayRate = car.pricePerDay || car.rentalPrice?.perDay || 2500;
    const basePrice = perDayRate * days;

    // Calculate Add-ons price
    const addOnsPrice = (addOns || []).reduce((sum, addon) => sum + (Number(addon.price || 0) * Number(addon.quantity || 1)), 0);
    let totalPrice = basePrice + addOnsPrice;

    // Apply promotion if provided
    let promotion = null;
    let discount = 0;
    if (promotionCode) {
      promotion = await Promotion.findOne({ code: promotionCode.toUpperCase() });
      if (promotion && typeof promotion.isValid === 'function' ? promotion.isValid() : promotion.active) {
        if (typeof promotion.calculateDiscount === 'function') {
          discount = promotion.calculateDiscount(totalPrice);
        } else {
          discount = promotion.discountPercentage ? (totalPrice * (promotion.discountPercentage / 100)) : (promotion.discountAmount || 0);
        }
        totalPrice = Math.max(0, totalPrice - discount);
        if (promotion.usedCount !== undefined) {
          promotion.usedCount += 1;
          await promotion.save();
        }
      }
    }

    // Determine if instant booking or requires approval
    const user = await User.findById(userId);
    const userBookingsCount = user?.totalBookings || 0;
    const userRating = user?.averageRating || 5.0;
    const requiresApproval = userBookingsCount < 1 && userRating < 4.0;

    const securityDeposit = car.securityDeposit || 5000;

    const booking = new Booking({
      user: userId,
      car: carId,
      startDate: start,
      endDate: end,
      pickupLocation: pickupLocation || { city: car.location || 'Mumbai', address: `${car.location || 'City'} Hub` },
      dropoffLocation: dropoffLocation || { city: car.location || 'Mumbai', address: `${car.location || 'City'} Hub` },
      addOns,
      promotion: promotion ? promotion._id : null,
      promotionCode: promotionCode || null,
      discount,
      pricing: {
        basePrice,
        addOnsPrice,
        discount,
        securityDeposit,
        totalAmount: totalPrice
      },
      totalPrice,
      totalAmount: totalPrice,
      status: requiresApproval ? 'pending' : 'confirmed',
      paymentStatus: 'pending',
      cancellationPolicy: 'flexible',
      autoApproved: !requiresApproval
    });

    await booking.save();

    // Increment user stats
    if (user) {
      user.totalBookings = (user.totalBookings || 0) + 1;
      await user.save();
    }

    // Create payment intent for instant checkout
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: totalPrice + securityDeposit,
      currency: 'INR',
      bookingId: booking._id,
      userId
    });

    booking.paymentIntent = paymentIntent.id;
    await booking.save();

    await booking.populate('car', 'name brand make model pricePerDay images primaryImage location');

    res.status(201).json({
      success: true,
      data: booking,
      paymentIntent,
      requiresApproval,
      message: requiresApproval
        ? 'Booking requested! Awaiting host verification.'
        : 'Instant booking confirmed! Proceed with payment.'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

/**
 * Flexible cancellation with AI-based fee calculation & automated refund
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Change of plans' } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const booking = await Booking.findById(id).populate('car');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check
    if (userId && booking.user.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed trip' });
    }

    // Calculate cancellation fee based on timing and emergency reason
    const hoursUntilPickup = (new Date(booking.startDate) - new Date()) / (1000 * 60 * 60);
    const totalAmount = booking.pricing?.totalAmount || booking.totalPrice || 0;
    const cancellationFee = calculateCancellationFee(totalAmount, hoursUntilPickup, reason);
    const refundAmount = Math.max(0, totalAmount - cancellationFee);

    // Process refund if payment was made
    let refundResult = null;
    if (booking.paymentStatus === 'paid' && refundAmount > 0) {
      refundResult = await paymentService.processRefund(booking.paymentIntent, refundAmount);
    }

    booking.status = 'cancelled';
    booking.paymentStatus = refundAmount > 0 ? 'refunded' : 'failed';
    booking.cancellationDetails = {
      reason,
      cancelledAt: new Date(),
      cancellationFee,
      refundAmount
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking._id,
        cancellationFee,
        refundAmount,
        refundStatus: refundResult?.status || 'processed',
        cancellationDetails: booking.cancellationDetails
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
};

/**
 * Helper: AI flexible cancellation fee calculation
 */
function calculateCancellationFee(totalAmount, hoursUntilPickup, reason = '') {
  let feePercentage = 0;

  if (hoursUntilPickup > 72) {
    feePercentage = 0; // 100% Free cancellation > 72 hrs
  } else if (hoursUntilPickup > 48) {
    feePercentage = 0.10; // 10% fee (48-72h)
  } else if (hoursUntilPickup > 24) {
    feePercentage = 0.25; // 25% fee (24-48h)
  } else if (hoursUntilPickup > 12) {
    feePercentage = 0.50; // 50% fee (12-24h)
  } else {
    feePercentage = 0.90; // 90% fee (<12h)
  }

  // Emergency & verified reason mitigation (-20% fee reduction)
  const emergencyReasons = ['medical', 'hospital', 'family_emergency', 'flight_cancelled', 'bad_weather'];
  const reasonLower = reason.toLowerCase();
  if (emergencyReasons.some(r => reasonLower.includes(r))) {
    feePercentage = Math.max(0, feePercentage - 0.20);
  }

  return Math.round(totalAmount * feePercentage);
}

/**
 * 15-Minute Reservation Hold
 */
exports.holdCar = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const car = await Car.findById(carId);
    if (!car || !car.available) {
      return res.status(404).json({ success: false, message: 'Car not available for holding' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Create 15-minute temporary hold
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const hold = new Booking({
      user: userId,
      car: carId,
      startDate: start,
      endDate: end,
      totalPrice: car.pricePerDay || 2500,
      status: 'held',
      holdExpiresAt
    });

    await hold.save();

    // Auto-release hold after 15 minutes
    setTimeout(async () => {
      try {
        const freshHold = await Booking.findById(hold._id);
        if (freshHold && freshHold.status === 'held') {
          freshHold.status = 'expired';
          await freshHold.save();
        }
      } catch (err) {
        console.error('Error expiring hold:', err.message);
      }
    }, 15 * 60 * 1000);

    res.json({
      success: true,
      data: {
        holdId: hold._id,
        carId,
        expiresAt: holdExpiresAt,
        message: 'Car reserved for 15 minutes. Complete your booking before expiry.'
      }
    });
  } catch (error) {
    console.error('Error holding car:', error);
    res.status(500).json({ success: false, message: 'Failed to hold car', error: error.message });
  }
};

/**
 * Get all bookings (Admin only)
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('car', 'name brand make model pricePerDay images location')
      .populate('promotion', 'code name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count: bookings.length,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};

/**
 * Get single booking
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('car', 'name brand make model pricePerDay images location dna')
      .populate('promotion', 'code name type value');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (booking.user?._id?.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
  }
};

/**
 * Get user's own bookings
 */
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate('car', 'name brand make model pricePerDay images location dna')
      .populate('promotion', 'code name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your bookings', error: error.message });
  }
};

/**
 * Update booking (Admin only)
 */
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('car', 'name brand make model');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking updated successfully', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating booking', error: error.message });
  }
};

/**
 * Delete booking (Admin only)
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting booking', error: error.message });
  }
};
