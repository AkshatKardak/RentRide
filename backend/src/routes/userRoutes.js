const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getProfile, 
    updateProfile, 
    updatePreferences,
    getWallet,
    updateWalletSettings,
    getReferral,
    getLoyalty
} = require('../controllers/userController');

// GET /api/users/test
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'User routes working!' });
});

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

// Wallet & Rewards
router.get('/wallet', protect, getWallet);
router.put('/wallet', protect, updateWalletSettings);
router.get('/referral', protect, getReferral);
router.get('/loyalty', protect, getLoyalty);

module.exports = router;
