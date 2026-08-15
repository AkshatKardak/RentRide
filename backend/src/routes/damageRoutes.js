const express = require('express');
const router = express.Router();
const {
  getAllDamageReports,
  getDamageReportById,
  createDamageReport,
  updateDamageReport,
  deleteDamageReport,
  analyzeDamageWithAI,
  getCarDamageStats,
  // Admin functions
  getPendingDamageReports,
  approveDamageReport,
  rejectDamageReport,
  setUnderReview,
  getUserDamageReports,
  getAdminDamageStats,
  analyzeCVDamage,
  compareReports
} = require('../controllers/damageReportController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public/User routes
router.post('/analyze-ai', protect, upload.array('images', 5), analyzeDamageWithAI);
router.post('/cv-detect', protect, upload.array('images', 5), analyzeCVDamage);
router.post('/compare', protect, compareReports);
router.post('/', protect, upload.array('images', 5), createDamageReport);
router.get('/user/my-reports', protect, getUserDamageReports);

// Admin routes
router.get('/admin/pending', protect, authorize('admin'), getPendingDamageReports);
router.get('/admin/stats', protect, authorize('admin'), getAdminDamageStats);
router.put('/:id/approve', protect, authorize('admin'), approveDamageReport);
router.put('/:id/reject', protect, authorize('admin'), rejectDamageReport);
router.put('/:id/review', protect, authorize('admin'), setUnderReview);

// General routes
router.get('/', protect, getAllDamageReports);
router.get('/:id', protect, getDamageReportById);
router.put('/:id', protect, authorize('admin'), updateDamageReport);
router.delete('/:id', protect, authorize('admin'), deleteDamageReport);
router.get('/car/:carId/stats', protect, getCarDamageStats);

module.exports = router;
