const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
        address: {
        type: String,
        default: null
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        },
        darkMode: {
            type: Boolean,
            default: false
        },
        language: {
            type: String,
            default: 'en'
        },
        twoFactorAuth: {
            type: Boolean,
            default: false
        }
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'inactive'],
        default: 'active'
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 5.0
    },
    loyaltyTier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    },
    referral: {
        code: {
            type: String,
            uppercase: true,
            trim: true
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        totalReferred: {
            type: Number,
            default: 0
        },
        rewardsEarned: {
            type: Number,
            default: 0
        }
    },
    wallet: {
        balance: {
            type: Number,
            default: 500 // Welcome credits
        },
        autoApply: {
            type: Boolean,
            default: true
        },
        ledger: [{
            amount: { type: Number, required: true },
            type: { type: String, enum: ['credit', 'debit'], required: true },
            category: { type: String, enum: ['referral', 'refund', 'cashback', 'promotional', 'payment', 'welcome'], default: 'promotional' },
            description: { type: String, required: true },
            referenceId: { type: String },
            expiresAt: { type: Date },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving (skip if Firebase user)
// Hash password before saving (skip if Firebase user)
UserSchema.pre('save', async function () {
    // If password is not modified, skip hashing
    if (!this.isModified('password')) {
        return;
    }

    // Skip hashing for Firebase placeholder passwords
    if (this.password.startsWith('firebase_')) {
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // Firebase users cannot use password login
    if (this.password.startsWith('firebase_')) {
        return false;
    }

    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
