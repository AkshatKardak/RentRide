const express = require('express');
const router = express.Router();
const {
  getAllPromotions,
  getPromotionById,
  validatePromotionCode,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../controllers/promotionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// DEPRECATED: /api/offers is forwarded to canonical Promotion controller
router.get('/', getAllPromotions);
router.post('/validate', validatePromotionCode);
router.get('/:id', getPromotionById);

// Admin operations forwarded
router.post('/', protect, authorize('admin'), createPromotion);
router.put('/:id', protect, authorize('admin'), updatePromotion);
router.delete('/:id', protect, authorize('admin'), deletePromotion);

module.exports = router;
