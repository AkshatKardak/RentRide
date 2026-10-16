const Promotion = require('../models/Promotion');
const Booking = require('../models/Booking');

// Get all promotions (with optional category, city, tier, active filters)
exports.getAllPromotions = async (req, res) => {
  try {
    const { active, category, city, tier, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.active = active === 'true';
    }
    if (category && category !== 'All') {
      filter.category = category.toLowerCase();
    }
    if (tier && tier !== 'all') {
      filter.tier = { $in: [tier.toLowerCase(), 'all'] };
    }
    if (city) {
      filter.$or = [
        { cities: { $size: 0 } },
        { cities: { $exists: false } },
        { cities: new RegExp(`^${city}$`, 'i') }
      ];
    }
    
    const promotions = await Promotion.find(filter)
      .populate('applicableVehicles', 'name brand model')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });
    
    res.json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching promotions', 
      error: error.message 
    });
  }
};

// Get single promotion
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('applicableVehicles', 'name brand model');
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        message: 'Promotion not found' 
      });
    }
    
    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching promotion', 
      error: error.message 
    });
  }
};

// Compute all eligible promotions and recommend the best offer
exports.getEligiblePromotions = async (req, res) => {
  try {
    const { bookingAmount = 3000, vehicleId, city, rentalDays = 2 } = req.body || {};
    const amount = Number(bookingAmount) || 3000;
    
    const now = new Date();
    const promotions = await Promotion.find({
      active: true,
      validFrom: { $lte: now },
      validTo: { $gte: now }
    }).populate('applicableVehicles', 'name brand model');
    
    const eligible = [];
    for (const promo of promotions) {
      if (promo.usedCount >= promo.usageLimit) continue;
      if (vehicleId && !promo.isApplicableToVehicle(vehicleId)) continue;
      if (city && !promo.isApplicableToCity(city)) continue;
      if (amount < promo.minBookingAmount) continue;

      // Check firstBookingOnly if authenticated user present
      if (promo.firstBookingOnly && req.user) {
        const bookingsCount = await Booking.countDocuments({ user: req.user._id });
        if (bookingsCount > 0) continue;
      }

      const discount = promo.calculateDiscount(amount);
      if (discount > 0) {
        eligible.push({
          ...promo.toObject(),
          calculatedDiscount: discount,
          finalAmount: Math.max(0, amount - discount)
        });
      }
    }

    // Sort by largest discount first
    eligible.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    res.json({
      success: true,
      count: eligible.length,
      data: eligible,
      bestOffer: eligible[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error computing eligible promotions',
      error: error.message
    });
  }
};

// Validate promotion code
exports.validatePromotionCode = async (req, res) => {
  try {
    const { code, vehicleId, city, bookingAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please provide a coupon code'
      });
    }

    const promotion = await Promotion.findOne({ 
      code: code.trim().toUpperCase() 
    }).populate('applicableVehicles');
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        valid: false,
        message: 'Invalid promotion code' 
      });
    }
    
    if (!promotion.isValid()) {
      return res.status(400).json({ 
        success: false,
        valid: false,
        message: 'Promotion code has expired or usage limit reached' 
      });
    }
    
    if (vehicleId && !promotion.isApplicableToVehicle(vehicleId)) {
      return res.status(400).json({ 
        success: false,
        valid: false,
        message: 'Promotion code is not applicable to this vehicle' 
      });
    }

    if (city && !promotion.isApplicableToCity(city)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Promotion code is only valid in: ${promotion.cities.join(', ')}`
      });
    }
    
    if (bookingAmount < promotion.minBookingAmount) {
      return res.status(400).json({ 
        success: false,
        valid: false,
        message: `Minimum booking amount of ₹${promotion.minBookingAmount.toLocaleString('en-IN')} required` 
      });
    }

    if (promotion.firstBookingOnly && req.user) {
      const userBookings = await Booking.countDocuments({ user: req.user._id });
      if (userBookings > 0) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'This offer is only valid for your first rental booking'
        });
      }
    }
    
    const discount = promotion.calculateDiscount(bookingAmount);
    
    res.json({
      success: true,
      valid: true,
      data: {
        promotion: {
          id: promotion._id,
          code: promotion.code,
          name: promotion.name,
          category: promotion.category,
          type: promotion.type,
          value: promotion.value
        },
        discount,
        finalAmount: Math.max(0, bookingAmount - discount)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      valid: false,
      message: 'Error validating promotion code', 
      error: error.message 
    });
  }
};

// Create promotion (Admin only)
exports.createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error creating promotion', 
      error: error.message 
    });
  }
};

// Update promotion (Admin only)
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        message: 'Promotion not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating promotion', 
      error: error.message 
    });
  }
};

// Delete promotion (Admin only)
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        message: 'Promotion not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting promotion', 
      error: error.message 
    });
  }
};

// Get promotion usage statistics (Admin only)
exports.getPromotionStats = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        message: 'Promotion not found' 
      });
    }
    
    const bookings = await Booking.find({ promotion: promotion._id })
      .populate('user', 'name email')
      .populate('car', 'name brand model')
      .select('totalPrice discount createdAt');
    
    const stats = {
      promotion: {
        code: promotion.code,
        name: promotion.name,
        category: promotion.category,
        usedCount: promotion.usedCount,
        usageLimit: promotion.usageLimit,
        remainingUses: Math.max(0, promotion.usageLimit - promotion.usedCount)
      },
      bookings: bookings.length,
      totalDiscountGiven: bookings.reduce((sum, b) => sum + (b.discount || 0), 0),
      totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
      recentUsage: bookings.slice(0, 10)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching promotion statistics', 
      error: error.message 
    });
  }
};
