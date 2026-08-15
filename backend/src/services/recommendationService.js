const axios = require('axios');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Get personalized car recommendations for a user
 */
async function getPersonalizedRecommendations(userId, limit = 10) {
  try {
    let user = null;
    let userBookings = [];

    if (userId) {
      user = await User.findById(userId);
      userBookings = await Booking.find({ user: userId }).populate('car');
    }

    // Extract user preferences from booking history
    const preferences = extractUserPreferences(userBookings);

    // Booked car IDs to avoid showing already booked cars if active
    const bookedCarIds = userBookings
      .filter(b => b.car && ['active', 'approved', 'confirmed'].includes(b.status))
      .map(b => b.car._id.toString());

    // Get candidate cars
    const candidateCars = await Car.find({
      _id: { $nin: bookedCarIds },
      available: true
    }).limit(40);

    // Score each car based on collaborative & content-based metrics
    const scoredCars = candidateCars.map(car => ({
      car,
      score: calculateRelevanceScore(car, preferences, user)
    }));

    // Sort by descending score
    scoredCars.sort((a, b) => b.score - a.score);

    return scoredCars.slice(0, limit).map(item => {
      const carObj = item.car.toObject();
      return {
        ...carObj,
        relevanceScore: item.score,
        matchReasons: getMatchReasons(item.car, preferences)
      };
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Graceful fallback to featured cars
    const fallbackCars = await Car.find({ available: true }).sort({ rating: -1 }).limit(limit);
    return fallbackCars.map(c => ({
      ...c.toObject(),
      relevanceScore: 85,
      matchReasons: ['Popular choice among RentRide drivers', 'High user satisfaction rating']
    }));
  }
}

/**
 * Extract user preferences from booking history
 */
function extractUserPreferences(bookings = []) {
  const preferences = {
    preferredMakes: {},
    preferredBodyTypes: {},
    preferredFuelTypes: {},
    priceRange: { min: Infinity, max: 0 },
    totalRentals: bookings.length
  };

  if (!bookings || bookings.length === 0) {
    preferences.priceRange = { min: 2000, max: 8000 };
    return preferences;
  }

  bookings.forEach(booking => {
    const car = booking.car;
    if (car) {
      const make = car.make || car.brand;
      if (make) preferences.preferredMakes[make] = (preferences.preferredMakes[make] || 0) + 1;

      const bodyType = car.bodyType || car.category;
      if (bodyType) preferences.preferredBodyTypes[bodyType.toLowerCase()] = (preferences.preferredBodyTypes[bodyType.toLowerCase()] || 0) + 1;

      const fuel = car.fuelType;
      if (fuel) preferences.preferredFuelTypes[fuel.toLowerCase()] = (preferences.preferredFuelTypes[fuel.toLowerCase()] || 0) + 1;

      const price = car.pricePerDay || car.rentalPrice?.perDay || booking.totalPrice || 3000;
      preferences.priceRange.min = Math.min(preferences.priceRange.min, price);
      preferences.priceRange.max = Math.max(preferences.priceRange.max, price);
    }
  });

  if (preferences.priceRange.min === Infinity) {
    preferences.priceRange = { min: 1500, max: 10000 };
  }

  return preferences;
}

/**
 * Calculate relevance score for a car
 */
function calculateRelevanceScore(car, preferences, user) {
  let score = 50; // Base score

  const make = car.make || car.brand;
  const bodyType = (car.bodyType || car.category || '').toLowerCase();
  const fuelType = (car.fuelType || '').toLowerCase();
  const price = car.pricePerDay || car.rentalPrice?.perDay || 0;

  // Make preference (0-20 points)
  if (make && preferences.preferredMakes[make]) {
    score += Math.min(20, preferences.preferredMakes[make] * 10);
  }

  // Body type preference (0-15 points)
  if (bodyType && preferences.preferredBodyTypes[bodyType]) {
    score += Math.min(15, preferences.preferredBodyTypes[bodyType] * 8);
  }

  // Fuel type preference (0-10 points)
  if (fuelType && preferences.preferredFuelTypes[fuelType]) {
    score += Math.min(10, preferences.preferredFuelTypes[fuelType] * 5);
  }

  // Price range match (0-15 points)
  if (price >= preferences.priceRange.min && price <= preferences.priceRange.max) {
    score += 15;
  } else if (Math.abs(price - preferences.priceRange.max) < 1000) {
    score += 8;
  }

  // Rating bonus (0-10 points)
  const rating = car.averageRating || car.rating || 0;
  if (rating >= 4.7) {
    score += 10;
  } else if (rating >= 4.2) {
    score += 6;
  }

  // AI Maintenance Health score bonus (0-10 points)
  const health = car.dna?.maintenance?.overallHealthScore;
  if (health && health >= 85) {
    score += 10;
  } else if (health && health >= 70) {
    score += 5;
  }

  return Math.min(99, Math.max(30, score));
}

/**
 * Get reasons why this car matches user preferences
 */
function getMatchReasons(car, preferences) {
  const reasons = [];
  const make = car.make || car.brand;
  const bodyType = car.bodyType || car.category;

  if (make && preferences.preferredMakes[make]) {
    reasons.push(`You've had great trips with ${make} vehicles`);
  }

  if (bodyType && preferences.preferredBodyTypes[bodyType.toLowerCase()]) {
    reasons.push(`Matches your favorite ${bodyType} driving profile`);
  }

  const rating = car.averageRating || car.rating || 0;
  if (rating >= 4.5) {
    reasons.push('Highly rated by the RentRide community (4.5+ ★)');
  }

  const health = car.dna?.maintenance?.overallHealthScore;
  if (health && health >= 80) {
    reasons.push('Certified high AI Predictive Maintenance score');
  }

  if (car.fuelType?.toLowerCase() === 'electric') {
    reasons.push('Zero emissions eco-friendly mobility');
  }

  if (reasons.length === 0) {
    reasons.push('Trending high demand in your area', 'Verified vehicle passport on Polygon');
  }

  return reasons;
}

/**
 * Dynamic pricing optimization using demand forecasting
 */
async function optimizePricing(carId, basePriceInput) {
  try {
    const mongoose = require('mongoose');
    let car = null;
    if (carId && mongoose.Types.ObjectId.isValid(carId)) {
      car = await Car.findById(carId);
    }
    const basePrice = basePriceInput || car?.pricePerDay || car?.rentalPrice?.perDay || 2500;

    // Get demand factors
    const demandFactors = await getDemandFactors(carId);

    // Calculate optimal dynamic price
    const optimalPrice = Math.round(basePrice * (1 + demandFactors.demandMultiplier));

    return {
      success: true,
      carId,
      basePrice,
      optimalPrice,
      demandLevel: demandFactors.level,
      demandMultiplier: demandFactors.demandMultiplier,
      factors: demandFactors.factors,
      recommendation: demandFactors.demandMultiplier > 0.15 
        ? 'High market demand detected. Premium surge pricing applied.'
        : 'Normal seasonal rate.'
    };
  } catch (error) {
    console.error('Error optimizing pricing:', error);
    const price = basePriceInput || 2500;
    return { success: true, basePrice: price, optimalPrice: price, demandLevel: 'MEDIUM', factors: ['Standard baseline'] };
  }
}

/**
 * Get demand factors for pricing
 */
async function getDemandFactors(carId) {
  const mongoose = require('mongoose');
  let car = null;
  if (carId && mongoose.Types.ObjectId.isValid(carId)) {
    car = await Car.findById(carId);
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

  // Indian peak travel seasons: May-June (Summer), October-December (Festive/Winter)
  const currentMonth = today.getMonth() + 1;
  const isPeakSeason = [5, 6, 10, 11, 12].includes(currentMonth);

  let multiplier = 0;
  const factors = [];

  if (isWeekend) {
    multiplier += 0.15;
    factors.push('Weekend leisure travel demand (+15%)');
  }

  if (isPeakSeason) {
    multiplier += 0.20;
    factors.push('Peak holiday travel season (+20%)');
  }

  // Check city inventory availability
  if (car) {
    const city = car.pickupLocation?.city || car.location || 'Mumbai';
    const similarAvailable = await Car.countDocuments({
      location: new RegExp(city, 'i'),
      available: true
    });

    if (similarAvailable < 5) {
      multiplier += 0.12;
      factors.push(`Tight local inventory in ${city} (+12%)`);
    }
  }

  return {
    demandMultiplier: Number(multiplier.toFixed(2)),
    level: multiplier >= 0.30 ? 'HIGH' : multiplier >= 0.15 ? 'MEDIUM' : 'LOW',
    factors: factors.length > 0 ? factors : ['Standard weekday rate']
  };
}

module.exports = {
  getPersonalizedRecommendations,
  extractUserPreferences,
  calculateRelevanceScore,
  getMatchReasons,
  optimizePricing,
  getDemandFactors
};
