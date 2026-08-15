const express = require('express');
const router = express.Router();
const vehicleApiController = require('../controllers/vehicleApiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');

// Public endpoints
router.get('/makes', vehicleApiController.getMakes);
router.get('/makes/:make/models', vehicleApiController.getModelsByMake);
router.get('/specs', vehicleApiController.getVehicleSpecs);
router.get('/images', vehicleApiController.getVehicleImages);
router.get('/profile', vehicleApiController.getCompleteProfile);
router.get('/vin/:vin', vehicleApiController.decodeVIN);

// Admin sync endpoint
router.post('/sync', protect, authorize('admin'), vehicleApiController.syncVehicles);

module.exports = router;
