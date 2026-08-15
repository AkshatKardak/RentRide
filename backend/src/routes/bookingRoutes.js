const express = require('express');
const router = express.Router();
const { 
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
  cancelBooking,
  holdCar
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// User routes (must be authenticated)
router.post('/', protect, createBooking);
router.post('/hold', protect, holdCar);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);
router.post('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/', protect, authorize('admin', 'manager'), getAllBookings);
router.put('/:id', protect, authorize('admin', 'manager'), updateBooking);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

module.exports = router;
