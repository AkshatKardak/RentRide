const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// Public / User read history
router.get('/:carId/history', blockchainController.getVehicleHistory);

// Protected update endpoints
router.post('/mint', protect, authorize('admin'), blockchainController.mintPassport);
router.post('/:carId/service-record', protect, blockchainController.addServiceRecord);
router.post('/:carId/accident-report', protect, blockchainController.addAccidentReport);
router.post('/:carId/odometer', protect, blockchainController.addOdometerReading);

module.exports = router;
