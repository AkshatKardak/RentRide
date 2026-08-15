const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Basic & Identity
  name: {
    type: String,
    trim: true
  },
  make: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide manufacturing year']
  },
  variant: {
    type: String,
    default: 'Base'
  },
  vin: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: 'White'
  },

  // API Integration (CarsXE)
  apiVehicleId: {
    type: String,
    sparse: true
  },
  source: {
    type: String,
    enum: ['manual', 'carsxe', 'seed', 'api'],
    default: 'manual'
  },
  lastSyncedAt: {
    type: Date
  },

  // Pricing
  pricePerDay: {
    type: Number,
    min: 0,
    default: 0
  },
  rentalPrice: {
    perDay: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  securityDeposit: {
    type: Number,
    default: 5000
  },

  // Specifications
  category: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'luxury', 'sports', 'electric', 'muv', 'compact', 'coupe', 'convertible'],
    default: 'sedan'
  },
  bodyType: {
    type: String,
    default: 'Sedan'
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
    default: 'petrol'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'Manual', 'Automatic'],
    default: 'manual'
  },
  engine: {
    type: String
  },
  drivetrain: {
    type: String
  },
  seats: {
    type: Number,
    default: 5,
    min: 2,
    max: 15
  },
  seatingCapacity: {
    type: Number,
    default: 5
  },
  mileage: {
    type: Number,
    default: 15
  },
  features: [{
    type: String
  }],
  specs: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Media
  images: [{
    type: mongoose.Schema.Types.Mixed
  }],
  primaryImage: {
    type: String
  },

  // Location & Availability
  location: {
    type: String,
    default: 'Mumbai'
  },
  pickupLocation: {
    city: { type: String, default: 'Mumbai' },
    address: { type: String, default: 'City Center' },
    state: { type: String, default: 'Maharashtra' },
    coordinates: {
      lat: { type: Number, default: 19.0760 },
      lng: { type: Number, default: 72.8777 }
    }
  },
  city: {
    type: String
  },
  available: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'booked', 'maintenance', 'inactive'],
    default: 'active'
  },

  // Ratings & Ownership
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  averageRating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  lastServiced: {
    type: Date
  },
  insuranceExpiry: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Blockchain DNA & History (Polygon)
  dna: {
    passport: {
      tokenId: { type: Number },
      txHash: { type: String },
      blockNumber: { type: Number },
      mintedAt: { type: Date },
      vin: { type: String },
      metadata: { type: String }
    },
    odometerHistory: [{
      reading: { type: Number },
      timestamp: { type: Number },
      gpsHash: { type: String },
      txHash: { type: String }
    }],
    serviceRecords: [{
      serviceData: { type: String },
      garageAddress: { type: String },
      txHash: { type: String },
      timestamp: { type: Date, default: Date.now }
    }],
    accidentReports: [{
      reportData: { type: String },
      insuranceAddress: { type: String },
      txHash: { type: String },
      timestamp: { type: Date, default: Date.now }
    }],
    maintenance: {
      overallHealthScore: { type: Number, default: 90 },
      reliabilityBadge: { type: String, default: 'EXCELLENT' },
      predictedFailures: { type: Array, default: [] },
      recommendedActions: { type: Array, default: [] },
      calculatedAt: { type: Date }
    }
  },

  // AI Predictive Maintenance Telemetry
  ageInYears: { type: Number, default: 2 },
  totalMileage: { type: Number, default: 25000 },
  lastServiceDate: { type: Date, default: () => new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
  rentalFrequency: { type: Number, default: 12 },
  averageTripDistance: { type: Number, default: 120 },
  climateExposureScore: { type: Number, default: 50 },
  cityDrivingRatio: { type: Number, default: 0.6 },
  highwayDrivingRatio: { type: Number, default: 0.4 },
  previousAccidents: { type: Number, default: 0 },
  serviceHistoryCompleteness: { type: Number, default: 1.0 },
  batteryAge: { type: Number, default: 1.5 },
  tireWearLevel: { type: Number, default: 0.2 },
  brakeWearLevel: { type: Number, default: 0.25 },
  engineHealthScore: { type: Number, default: 95 },
  transmissionHealthScore: { type: Number, default: 95 },
  acPerformanceScore: { type: Number, default: 92 },
  suspensionHealthScore: { type: Number, default: 90 },
  fuelSystemHealthScore: { type: Number, default: 95 },
  electricalSystemHealthScore: { type: Number, default: 94 },
  exteriorConditionScore: { type: Number, default: 92 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-sync alias fields before validation & save
carSchema.pre('validate', function (next) {
  if (!this.brand && this.make) this.brand = this.make;
  if (!this.make && this.brand) this.make = this.brand;
  if (!this.name) this.name = `${this.brand || this.make || ''} ${this.model}`.trim();
  
  if (this.pricePerDay && (!this.rentalPrice || !this.rentalPrice.perDay)) {
    this.rentalPrice = { perDay: this.pricePerDay, currency: 'INR' };
  } else if (this.rentalPrice?.perDay && !this.pricePerDay) {
    this.pricePerDay = this.rentalPrice.perDay;
  }

  if (this.available !== undefined) {
    this.isAvailable = this.available;
  } else if (this.isAvailable !== undefined) {
    this.available = this.isAvailable;
  }

  if (this.seats) this.seatingCapacity = this.seats;
  if (this.seatingCapacity) this.seats = this.seatingCapacity;

  if (this.category && !this.bodyType) this.bodyType = this.category.toUpperCase();
  if (this.bodyType && !this.category) this.category = this.bodyType.toLowerCase();

  if (this.rating) this.averageRating = this.rating;
  if (this.averageRating) this.rating = this.averageRating;

  if (this.location && (!this.pickupLocation || !this.pickupLocation.city)) {
    this.pickupLocation = {
      city: this.location,
      address: `${this.location} Hub`,
      state: 'State',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    };
  }

  if (this.images && this.images.length > 0 && !this.primaryImage) {
    const first = this.images[0];
    this.primaryImage = typeof first === 'string' ? first : first?.url;
  }

  next();
});

// Search Indexes
carSchema.index({ name: 'text', brand: 'text', make: 'text', model: 'text', location: 'text' });
carSchema.index({ isAvailable: 1, status: 1 });
carSchema.index({ 'pickupLocation.city': 1 });

module.exports = mongoose.model('Car', carSchema);
