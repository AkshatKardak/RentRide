const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  // Locations
  pickupLocation: {
    city: { type: String, default: 'Mumbai' },
    address: { type: String, default: 'City Center' }
  },
  dropoffLocation: {
    city: { type: String, default: 'Mumbai' },
    address: { type: String, default: 'City Center' }
  },

  // Add-ons
  addOns: [{
    name: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 }
  }],

  // Promotion Fields
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    default: null
  },
  promotionCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },

  // Financials & Pricing Structure
  pricing: {
    basePrice: { type: Number, default: 0 },
    addOnsPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number
  },

  // Status & Smart Booking
  status: {
    type: String,
    enum: ['pending', 'approved', 'confirmed', 'active', 'completed', 'cancelled', 'held', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  cancellationPolicy: {
    type: String,
    default: 'flexible'
  },
  autoApproved: {
    type: Boolean,
    default: false
  },
  paymentIntent: {
    type: String
  },
  cancellationDetails: {
    reason: { type: String },
    cancelledAt: { type: Date },
    cancellationFee: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 }
  },
  holdExpiresAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Sync totalPrice, pricing, and totalAmount
bookingSchema.pre('validate', function(next) {
  if (this.totalAmount && !this.totalPrice) {
    this.totalPrice = this.totalAmount;
  } else if (this.totalPrice && !this.totalAmount) {
    this.totalAmount = this.totalPrice;
  }

  if (this.totalPrice && (!this.pricing || !this.pricing.totalAmount)) {
    this.pricing = {
      basePrice: this.pricing?.basePrice || this.totalPrice,
      addOnsPrice: this.pricing?.addOnsPrice || 0,
      discount: this.pricing?.discount || this.discount || 0,
      securityDeposit: this.pricing?.securityDeposit || 0,
      totalAmount: this.totalPrice
    };
  }

  next();
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
