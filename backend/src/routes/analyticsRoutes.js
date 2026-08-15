const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// Admin / Manager protected analytics routes
router.get('/overview', protect, authorize('admin', 'manager'), analyticsController.getFleetOverview);
router.get('/revenue', protect, authorize('admin', 'manager'), analyticsController.getRevenueAnalytics);
router.get('/utilization', protect, authorize('admin', 'manager'), analyticsController.getUtilizationHeatmap);
router.get('/locations', protect, authorize('admin', 'manager'), analyticsController.getPopularLocations);
router.get('/customers', protect, authorize('admin', 'manager'), analyticsController.getCustomerSegmentation);
router.get('/maintenance-alerts', protect, authorize('admin', 'manager'), analyticsController.getMaintenanceAlerts);

module.exports = router;
