const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['weekend', 'long_rental', 'first_ride', 'luxury', 'festive', 'flash', 'general'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  minBookingAmount: {
    type: Number,
    required: true,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    required: true,
    default: 1000
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  firstBookingOnly: {
    type: Boolean,
    default: false
  },
  tier: {
    type: String,
    enum: ['all', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'all'
  },
  stackable: {
    type: Boolean,
    default: false
  },
  cities: [{
    type: String,
    trim: true
  }],
  applicableVehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  }],
  usedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to check if promotion is valid in general
promotionSchema.methods.isValid = function() {
  const now = new Date();
  return this.active && 
         now >= this.validFrom && 
         now <= this.validTo && 
         this.usedCount < this.usageLimit;
};

// Method to check if applicable to a vehicle
promotionSchema.methods.isApplicableToVehicle = function(vehicleId) {
  if (!this.applicableVehicles || this.applicableVehicles.length === 0) return true;
  if (!vehicleId) return true;
  return this.applicableVehicles.some(id => id.toString() === vehicleId.toString());
};

// Method to check if applicable to a city
promotionSchema.methods.isApplicableToCity = function(city) {
  if (!this.cities || this.cities.length === 0) return true;
  if (!city) return true;
  return this.cities.some(c => c.toLowerCase() === city.toLowerCase());
};

// Method to calculate discount
promotionSchema.methods.calculateDiscount = function(amount) {
  if (amount < this.minBookingAmount) return 0;
  
  let discount = 0;
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
  } else {
    discount = this.value;
  }
  
  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }
  
  return Math.min(discount, amount);
};

module.exports = mongoose.model('Promotion', promotionSchema);
