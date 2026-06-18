const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide car name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide car brand'],
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
  color: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: 0
  },
  category: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'luxury', 'sports', 'electric'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 12
  },
  mileage: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  images: [{
    type: String
  }],
  location: {
    type: String,
    required: true
  },
  city: {
    type: String
  },
  available: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
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
  }
}, {
  timestamps: true
});

// Index for search
carSchema.index({ name: 'text', brand: 'text', model: 'text' });

module.exports = mongoose.model('Car', carSchema);
