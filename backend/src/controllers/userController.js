const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, profilePicture } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                profilePicture: updatedUser.profilePicture,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
    try {
        const { notifications, darkMode, language, twoFactorAuth } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update preferences
        if (!user.preferences) {
            user.preferences = {};
        }

        if (notifications !== undefined) user.preferences.notifications = notifications;
        if (darkMode !== undefined) user.preferences.darkMode = darkMode;
        if (language !== undefined) user.preferences.language = language;
        if (twoFactorAuth !== undefined) user.preferences.twoFactorAuth = twoFactorAuth;

        await user.save();

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: user.preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user wallet details and ledger
// @route   GET /api/users/wallet
// @access  Private
exports.getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize wallet if empty
        if (!user.wallet) {
            user.wallet = {
                balance: 500,
                autoApply: true,
                ledger: [{
                    amount: 500,
                    type: 'credit',
                    category: 'welcome',
                    description: 'RentRide Welcome Gift Credits',
                    createdAt: new Date()
                }]
            };
            await user.save();
        }

        res.json({
            success: true,
            data: {
                balance: user.wallet.balance || 0,
                autoApply: user.wallet.autoApply ?? true,
                ledger: (user.wallet.ledger || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update wallet auto-apply preference
// @route   PUT /api/users/wallet
// @access  Private
exports.updateWalletSettings = async (req, res) => {
    try {
        const { autoApply } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.wallet) user.wallet = { balance: 500, autoApply: true, ledger: [] };
        if (autoApply !== undefined) user.wallet.autoApply = Boolean(autoApply);
        await user.save();

        res.json({
            success: true,
            data: {
                balance: user.wallet.balance,
                autoApply: user.wallet.autoApply
            }
        });
    } catch (error) {
        console.error('Update wallet settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user referral code and tracker funnel
// @route   GET /api/users/referral
// @access  Private
exports.getReferral = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const cleanName = (user.name || 'RIDER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
        const codeSuffix = user._id.toString().slice(-4).toUpperCase();
        const code = user.referral?.code || `RIDE-${cleanName}-${codeSuffix}`;

        if (!user.referral?.code) {
            if (!user.referral) user.referral = {};
            user.referral.code = code;
            await user.save();
        }

        res.json({
            success: true,
            data: {
                code: user.referral.code,
                shareUrl: `https://rentride.com/signup?ref=${user.referral.code}`,
                totalReferred: user.referral.totalReferred || 0,
                rewardsEarned: user.referral.rewardsEarned || 0,
                funnel: {
                    invited: (user.referral.totalReferred || 0) + 3,
                    signedUp: (user.referral.totalReferred || 0) + 1,
                    firstRideCompleted: user.referral.totalReferred || 0
                }
            }
        });
    } catch (error) {
        console.error('Get referral error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user loyalty tier and progress
// @route   GET /api/users/loyalty
// @access  Private
exports.getLoyalty = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const bookings = user.totalBookings || 0;
        const spent = user.totalSpent || 0;

        let currentTier = 'bronze';
        let nextTier = 'silver';
        let targetBookings = 3;
        let targetSpend = 10000;

        if (bookings >= 10 || spent >= 50000) {
            currentTier = 'platinum';
            nextTier = null;
            targetBookings = 10;
            targetSpend = 50000;
        } else if (bookings >= 5 || spent >= 25000) {
            currentTier = 'gold';
            nextTier = 'platinum';
            targetBookings = 10;
            targetSpend = 50000;
        } else if (bookings >= 2 || spent >= 10000) {
            currentTier = 'silver';
            nextTier = 'gold';
            targetBookings = 5;
            targetSpend = 25000;
        }

        res.json({
            success: true,
            data: {
                tier: currentTier,
                nextTier,
                totalBookings: bookings,
                totalSpent: spent,
                targetBookings,
                targetSpend,
                rentalsRemaining: nextTier ? Math.max(0, targetBookings - bookings) : 0,
                spendRemaining: nextTier ? Math.max(0, targetSpend - spent) : 0
            }
        });
    } catch (error) {
        console.error('Get loyalty error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
