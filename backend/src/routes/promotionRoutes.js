const express = require('express');
const router = express.Router();
const { 
  getAllPromotions,
  getPromotionById,
  getEligiblePromotions,
  validatePromotionCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionStats
} = require('../controllers/promotionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// Public routes - no authentication needed
router.get('/', getAllPromotions);
router.post('/eligible', getEligiblePromotions);
router.post('/validate', validatePromotionCode);
router.get('/:id', getPromotionById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createPromotion);

// Admin OR Manager can update
router.put('/:id', protect, authorize('admin', 'manager'), updatePromotion);

// Only admin can delete
router.delete('/:id', protect, authorize('admin'), deletePromotion);

// Admin, Manager, OR Staff can view stats
router.get('/:id/stats', protect, authorize('admin', 'manager', 'staff'), getPromotionStats);

module.exports = router;
