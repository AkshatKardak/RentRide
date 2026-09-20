const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('../middleware/errorHandler');
const { verifyIdToken } = require('../config/firebase');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register new user (Traditional)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return next(new ErrorResponse('Please provide all required fields', 400));
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('User already exists with this email', 400));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        next(error);
    }
};

// @desc    Login user (Traditional)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return next(new ErrorResponse('Please provide email and password', 400));
        }

        // Dedicated Demo Admin Login Support (admin@rentride.com / password123)
        if (email.toLowerCase() === 'admin@rentride.com' && password === 'password123') {
            let adminUser = await User.findOne({ email: 'admin@rentride.com' });
            if (!adminUser) {
                adminUser = await User.create({
                    name: 'Admin User (Demo)',
                    email: 'admin@rentride.com',
                    password: 'password123',
                    role: 'admin',
                    isVerified: true
                });
            }
            const token = generateToken(adminUser._id);
            return res.json({
                success: true,
                token,
                user: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: 'admin',
                    isDemo: true
                }
            });
        }

        // Find user by email (include password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if user is Firebase-only user
        if (user.password.startsWith('firebase_')) {
            return next(new ErrorResponse('This account uses Google/Firebase login. Please sign in with Google.', 401));
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

// @desc    Register with Firebase
// @route   POST /api/auth/firebase-register
// @access  Public
exports.firebaseRegister = async (req, res, next) => {
    try {
        const { firebaseUid, name, email, idToken } = req.body;

        // Validate input
        if (!firebaseUid || !name || !email || !idToken) {
            return next(new ErrorResponse('Please provide all required fields', 400));
        }

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await verifyIdToken(idToken);
            
            // Ensure token UID matches provided UID
            if (decodedToken.uid !== firebaseUid) {
                return next(new ErrorResponse('Token UID mismatch', 401));
            }

            // Ensure token email matches provided email
            if (decodedToken.email !== email) {
                return next(new ErrorResponse('Token email mismatch', 401));
            }
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            return next(new ErrorResponse('Invalid Firebase token', 401));
        }

        // Check if user already exists with this email
        let user = await User.findOne({ email });

        if (user) {
            return next(new ErrorResponse('User already exists with this email', 400));
        }

        // Check if Firebase UID already exists
        const existingFirebaseUser = await User.findOne({ firebaseUid });
        if (existingFirebaseUser) {
            return next(new ErrorResponse('Firebase account already registered', 400));
        }

        // Create new user
        user = await User.create({
            name,
            email,
            firebaseUid,
            password: `firebase_${firebaseUid}`, // Placeholder password
            isEmailVerified: decodedToken.email_verified || false,
            profilePicture: decodedToken.picture || null
        });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                firebaseUid: user.firebaseUid,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Firebase register error:', error);
        next(error);
    }
};

// @desc    Login with Firebase
// @route   POST /api/auth/firebase-login
// @access  Public
exports.firebaseLogin = async (req, res, next) => {
    try {
        const { firebaseUid, email, idToken } = req.body;

        // Validate input
        if (!idToken) {
            return next(new ErrorResponse('Firebase token required', 400));
        }

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await verifyIdToken(idToken);
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            return next(new ErrorResponse('Invalid Firebase token', 401));
        }

        // Find user by Firebase UID or email
        let user = await User.findOne({ 
            $or: [
                { firebaseUid: decodedToken.uid },
                { email: decodedToken.email }
            ]
        });

        if (!user) {
            return next(new ErrorResponse('User not found. Please register first.', 404));
        }

        // Update Firebase UID if not set
        if (!user.firebaseUid) {
            user.firebaseUid = decodedToken.uid;
            user.password = `firebase_${decodedToken.uid}`;
        }

        // Update email verification status
        if (decodedToken.email_verified && !user.isEmailVerified) {
            user.isEmailVerified = true;
        }

        // Update profile picture if available and not set
        if (decodedToken.picture && !user.profilePicture) {
            user.profilePicture = decodedToken.picture;
        }

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                firebaseUid: user.firebaseUid,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Firebase login error:', error);
        next(error);
    }
};

// @desc    Google Sign-In with Firebase
// @route   POST /api/auth/firebase-google
// @access  Public
exports.firebaseGoogleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        // Validate input
        if (!idToken) {
            return next(new ErrorResponse('Firebase token required', 400));
        }

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await verifyIdToken(idToken);
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            return next(new ErrorResponse('Invalid Firebase token', 401));
        }

        const { uid, email, name, picture } = decodedToken;

        // Validate decoded token data
        if (!uid || !email) {
            return next(new ErrorResponse('Invalid token data', 401));
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                firebaseUid: uid,
                password: `firebase_google_${uid}`,
                isEmailVerified: decodedToken.email_verified || true,
                profilePicture: picture || null
            });
        } else {
            // Update existing user with Firebase UID if not set
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                user.password = `firebase_google_${uid}`;
            }

            // Update profile picture if available and not set
            if (picture && !user.profilePicture) {
                user.profilePicture = picture;
            }

            // Update email verification
            if (decodedToken.email_verified && !user.isEmailVerified) {
                user.isEmailVerified = true;
            }

            await user.save();
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                firebaseUid: user.firebaseUid,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        next(error);
    }
};

// @desc    Verify Firebase Token
// @route   POST /api/auth/verify-firebase-token
// @access  Public
exports.verifyFirebaseToken = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return next(new ErrorResponse('Token required', 400));
        }

        const decodedToken = await verifyIdToken(idToken);

        res.json({
            success: true,
            data: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
                name: decodedToken.name,
                picture: decodedToken.picture
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return next(new ErrorResponse('Invalid token', 401));
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, profilePicture } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        next(error);
    }
};

// @desc    Update password (Traditional users only)
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new ErrorResponse('Please provide current and new password', 400));
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Check if Firebase user
        if (user.password.startsWith('firebase_')) {
            return next(new ErrorResponse('Firebase users cannot change password here. Please use Firebase password reset.', 400));
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return next(new ErrorResponse('Current password is incorrect', 401));
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        // In a token-based auth system, logout is handled client-side
        // by removing the token from localStorage
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Delete user
        await user.deleteOne();

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        next(error);
    }
};
