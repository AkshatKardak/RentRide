const mongoose = require('mongoose');

const damageDetectionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  confidence: { type: Number, default: 0 },
  boundingBox: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  imageUrl: { type: String },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' }
}, { _id: false });

const damageReportSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  description: {
    type: String,
    default: 'Damage inspection report'
  },
  images: [{
    type: mongoose.Schema.Types.Mixed
  }],
  detections: [damageDetectionSchema],
  overallSeverity: {
    type: String,
    enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  estimatedRepairCost: {
    type: Number,
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number
  },
  aiAnalysis: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resolved'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  adminNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Sync estimatedRepairCost and estimatedCost
damageReportSchema.pre('validate', function(next) {
  if (this.estimatedRepairCost && !this.estimatedCost) {
    this.estimatedCost = this.estimatedRepairCost;
  } else if (this.estimatedCost && !this.estimatedRepairCost) {
    this.estimatedRepairCost = this.estimatedCost;
  }
  next();
});

module.exports = mongoose.model('DamageReport', damageReportSchema);
