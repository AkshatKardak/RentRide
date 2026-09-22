const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const DamageReport = require('../models/DamageReport');
const { createOrder, verifySignature } = require('../services/paymentService');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Initiate payment for Booking (Create Order)
// @route   POST /api/payments/process
// @access  Private
exports.createPayment = async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }

        if (booking.user.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 401));
        }

        if (booking.paymentStatus === 'paid') {
            return next(new ErrorResponse('Booking already paid', 400));
        }

        // Check if a pending payment already exists for this booking
        let existingPayment = await Payment.findOne({
            booking: bookingId,
            status: 'pending'
        });

        if (existingPayment && existingPayment.orderId) {
            // Return existing order instead of creating new one
            return res.status(200).json({
                success: true,
                order: {
                    id: existingPayment.orderId,
                    amount: existingPayment.amount,
                    currency: 'INR'
                }
            });
        }

        // Create Razorpay Order
        const order = await createOrder(booking.totalPrice || booking.total);

        // Create or update payment record
        if (existingPayment) {
            // Update existing payment with new orderId
            existingPayment.orderId = order.id;
            existingPayment.amount = booking.totalPrice || booking.total;
            await existingPayment.save();
        } else {
            // Create new payment record
            await Payment.create({
                booking: bookingId,
                user: req.user.id,
                amount: booking.totalPrice || booking.total,
                orderId: order.id,
                status: 'pending'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        console.error('Payment error:', err);
        next(err);
    }
};

// @desc    Verify Booking Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        const isSignatureValid = verifySignature(orderId, paymentId, signature);

        if (isSignatureValid) {
            const payment = await Payment.findOne({ orderId });

            if (!payment) {
                return next(new ErrorResponse('Payment record not found', 404));
            }

            if (payment.user.toString() !== req.user.id) {
                return next(new ErrorResponse('Unauthorized payment verification attempt', 403));
            }

            if (payment.status === 'paid') {
                return res.status(200).json({
                    success: true,
                    message: 'Payment already verified and confirmed'
                });
            }

            payment.transactionId = paymentId;
            payment.status = 'paid';
            await payment.save();

            // Update Booking
            const booking = await Booking.findById(payment.booking);
            if (booking) {
                booking.paymentStatus = 'paid';
                booking.status = 'confirmed';
                await booking.save();
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            return next(new ErrorResponse('Invalid signature', 400));
        }
    } catch (err) {
        console.error('Payment verification error:', err);
        next(err);
    }
};

// @desc    Initiate payment for Damage Report
// @route   POST /api/payments/process-damage
// @access  Private
exports.createDamagePayment = async (req, res, next) => {
    try {
        const { damageReportId } = req.body;

        const damageReport = await DamageReport.findById(damageReportId);

        if (!damageReport) {
            return next(new ErrorResponse('Damage report not found', 404));
        }

        if (damageReport.user.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 401));
        }

        if (damageReport.paymentStatus === 'paid') {
            return next(new ErrorResponse('Damage report already paid', 400));
        }

        if (damageReport.status !== 'approved') {
            return next(new ErrorResponse('Damage report not approved yet', 400));
        }

        // Create Razorpay Order for damage repair amount
        const order = await createOrder(damageReport.actualCost || damageReport.estimatedCost);

        // Update damage report with order ID
        damageReport.orderId = order.id;
        await damageReport.save();

        res.status(200).json({
            success: true,
            order
        });

    } catch (err) {
        console.error('Damage Payment error:', err);
        next(err);
    }
};

// @desc    Verify Damage Report Payment
// @route   POST /api/payments/verify-damage
// @access  Private
exports.verifyDamagePayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, signature, damageReportId } = req.body;

        const isSignatureValid = verifySignature(orderId, paymentId, signature);

        if (isSignatureValid) {
            // Update DamageReport
            const damageReport = await DamageReport.findById(damageReportId);

            if (!damageReport) {
                return next(new ErrorResponse('Damage report not found', 404));
            }

            if (damageReport.user.toString() !== req.user.id) {
                return next(new ErrorResponse('Unauthorized damage payment verification', 403));
            }

            if (damageReport.paymentStatus === 'paid') {
                return res.status(200).json({
                    success: true,
                    message: 'Damage settlement already completed'
                });
            }

            damageReport.paymentStatus = 'paid';
            damageReport.paymentId = paymentId;
            damageReport.status = 'resolved'; // Mark as resolved after payment
            await damageReport.save();

            res.status(200).json({
                success: true,
                message: 'Damage payment verified successfully'
            });
        } else {
            return next(new ErrorResponse('Invalid signature', 400));
        }
    } catch (err) {
        console.error('Damage Payment verification error:', err);
        next(err);
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
    try {
        const payments = await Payment.find({ user: req.user.id }).populate('booking');

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (err) {
        next(err);
    }
};
