const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Identity
  brand: {
    type: String,
    required: [true, 'Please provide vehicle brand'],
    trim: true,
    index: true
  },
  model: {
    type: String,
    required: [true, 'Please provide vehicle model'],
    trim: true,
    index: true
  },
  variant: {
    type: String,
    trim: true,
    default: 'Base'
  },
  year: {
    type: Number,
    required: [true, 'Please provide manufacturing year'],
    min: 2000,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    default: 'White'
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  vin: {
    type: String,
    trim: true,
    sparse: true
  },

  // Specifications
  category: {
    type: String,
    enum: ['hatchback', 'sedan', 'suv', 'mpv', 'luxury', 'sports', 'compact', 'convertible'],
    default: 'sedan',
    index: true
  },
  bodyType: {
    type: String,
    default: 'Sedan'
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
    default: 'petrol',
    index: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual',
    index: true
  },
  seats: {
    type: Number,
    default: 5,
    min: 2,
    max: 12
  },
  mileage: {
    type: Number,
    default: 25000 // Odometer km or fuel efficiency
  },
  engine: {
    type: String
  },
  drivetrain: {
    type: String,
    default: 'FWD'
  },
  features: [{
    type: String
  }],

  // Pricing
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: 0,
    index: true
  },
  securityDeposit: {
    type: Number,
    default: 5000
  },
  currency: {
    type: String,
    default: 'INR'
  },
  valuation: {
    type: Number,
    default: 0
  },

  // Media
  images: [{
    type: String
  }],
  primaryImage: {
    type: String
  },

  // Location
  city: {
    type: String,
    required: true,
    default: 'Mumbai',
    index: true
  },
  state: {
    type: String,
    default: 'Maharashtra'
  },
  address: {
    type: String,
    default: 'Central Hub'
  },
  coordinates: {
    lat: { type: Number, default: 19.0760 },
    lng: { type: Number, default: 72.8777 }
  },

  // Availability & Status
  available: {
    type: Boolean,
    default: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'booked', 'maintenance', 'inactive'],
    default: 'active',
    index: true
  },

  // Ratings
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // Vehicle Trust & Verification
  trustScore: {
    type: Number,
    default: 88,
    min: 0,
    max: 100
  },
  trustBreakdown: {
    type: mongoose.Schema.Types.Mixed
  },

  // Telemetry & Maintenance Health
  maintenance: {
    healthScore: { type: Number, default: 90 },
    reliabilityBadge: { type: String, default: 'EXCELLENT' },
    predictedFailures: { type: Array, default: [] },
    recommendedActions: { type: Array, default: [] },
    lastServiceDate: { type: Date }
  },

  // Damage & Inspection History
  damageHistory: [{
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'DamageReport' },
    severity: String,
    date: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],

  // Blockchain Vehicle Passport (Polygon)
  vehiclePassport: {
    isConfigured: { type: Boolean, default: false },
    network: { type: String, default: 'Polygon' },
    tokenId: { type: Number },
    txHash: { type: String },
    mintedAt: { type: Date },
    verificationStatus: { type: String, default: 'Local Verified' }
  },

  // Metadata
  source: {
    type: String,
    enum: ['dataset', 'carsxe', 'manual'],
    default: 'dataset'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Computed Full Vehicle Name Virtual
carSchema.virtual('name').get(function() {
  return `${this.brand} ${this.model} ${this.variant || ''}`.trim();
});

// Backward-compatibility Aliases
carSchema.virtual('make').get(function() { return this.brand; });
carSchema.virtual('make').set(function(v) { this.brand = v; });

carSchema.virtual('isAvailable').get(function() { return this.available; });
carSchema.virtual('isAvailable').set(function(v) { this.available = v; });

carSchema.virtual('averageRating').get(function() { return this.rating; });
carSchema.virtual('averageRating').set(function(v) { this.rating = v; });

carSchema.virtual('location').get(function() { return this.city; });
carSchema.virtual('location').set(function(v) { this.city = v; });

carSchema.virtual('rentalPrice').get(function() {
  return { perDay: this.pricePerDay, currency: this.currency };
});

carSchema.virtual('pickupLocation').get(function() {
  return {
    city: this.city,
    state: this.state,
    address: this.address,
    coordinates: this.coordinates
  };
});

carSchema.virtual('dna').get(function() {
  return {
    passport: this.vehiclePassport,
    maintenance: this.maintenance
  };
});

// Normalize fields before save
carSchema.pre('save', function(next) {
  if (this.category) this.category = this.category.toLowerCase();
  if (this.fuelType) this.fuelType = this.fuelType.toLowerCase();
  if (this.transmission) this.transmission = this.transmission.toLowerCase();
  if (!this.bodyType && this.category) this.bodyType = this.category.toUpperCase();

  if (this.images && this.images.length > 0 && !this.primaryImage) {
    this.primaryImage = this.images[0];
  }
  next();
});

// Compound Search & Filter Indexes
carSchema.index({ brand: 'text', model: 'text', city: 'text' });
carSchema.index({ available: 1, category: 1, pricePerDay: 1 });
carSchema.index({ city: 1, available: 1 });

module.exports = mongoose.model('Car', carSchema);
