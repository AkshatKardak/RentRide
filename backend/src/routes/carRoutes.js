const express = require('express');
const router = express.Router();
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getFeaturedCars,
  getFilterOptions
} = require('../controllers/carController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// Public routes
router.get('/', getAllCars);
router.get('/featured', getFeaturedCars);
router.get('/filters/options', getFilterOptions);
router.get('/:id', getCarById);

// Admin routes
router.post('/', protect, authorize('admin'), createCar);
router.put('/:id', protect, authorize('admin'), updateCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
