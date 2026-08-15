const express = require('express');
const router = express.Router();
const controller = require('../controllers/predictiveMaintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// Vehicle specific score
router.get('/vehicle/:carId', controller.calculateCarMaintenance);

// Fleet maintenance report (Admin only)
router.get('/fleet-report', protect, authorize('admin', 'manager'), controller.getFleetMaintenanceReport);

// Simulate / evaluate on payload
router.post('/evaluate', controller.calculateCustomScore);

module.exports = router;
