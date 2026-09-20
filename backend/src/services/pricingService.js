/**
 * PricingService - Transparent & Realistic Rental Pricing Engine
 * 
 * Translates used-car market valuations into realistic daily rental prices:
 * - Category Base Rates:
 *   - Hatchback: ₹1,200 - ₹1,800/day
 *   - Sedan: ₹1,800 - ₹2,800/day
 *   - SUV: ₹2,500 - ₹4,500/day
 *   - MPV: ₹2,200 - ₹3,800/day
 *   - Luxury: ₹5,000 - ₹15,000/day
 * 
 * - Valuation Ratio: ~0.25% - 0.35% of market value
 * - Luxury Tier Multiplier (Audi, BMW, Jaguar, Mercedes, etc.): 1.5x - 2.0x
 * - Fuel & Transmission Adjustments
 * - Age Depreciation / Condition Multiplier
 * - Rule-Based Dynamic Demand Multipliers (Weekend, Peak Season, Local Inventory)
 */

class PricingService {
  constructor() {
    // Luxury and Premium Brand Tiers
    this.luxuryBrands = new Set([
      'audi', 'bmw', 'mercedes-benz', 'mercedes', 'jaguar', 
      'porsche', 'land rover', 'lexus', 'volvo'
    ]);

    // Base Category Day Rates (INR)
    this.categoryBaseRates = {
      hatchback: 1300,
      sedan: 1900,
      suv: 2800,
      mpv: 2400,
      luxury: 6000,
      sports: 7500,
      compact: 1400,
      convertible: 8000
    };

    // Category Security Deposits (INR)
    this.categoryDeposits = {
      hatchback: 3000,
      compact: 3000,
      sedan: 4000,
      suv: 6000,
      mpv: 5000,
      luxury: 15000,
      sports: 20000,
      convertible: 20000
    };
  }

  /**
   * Calculate realistic base rental price per day from vehicle attributes and market valuation
   * @param {Object} vehicle 
   * @returns {Object} { pricePerDay, securityDeposit, calculationBreakdown }
   */
  calculateRentalPrice(vehicle = {}) {
    const brand = (vehicle.brand || vehicle.make || '').toLowerCase().trim();
    const category = (vehicle.category || vehicle.carType || vehicle.bodyType || 'sedan').toLowerCase().trim();
    const transmission = (vehicle.transmission || 'manual').toLowerCase().trim();
    const fuelType = (vehicle.fuelType || vehicle.fuel || 'petrol').toLowerCase().trim();
    const year = Number(vehicle.year) || 2020;
    const valuation = Number(vehicle.price || vehicle.sellingPrice || vehicle.valuation || 0);

    // 1. Category Base
    const isLuxuryBrand = this.luxuryBrands.has(brand) || category === 'luxury';
    const effectiveCategory = isLuxuryBrand ? 'luxury' : (this.categoryBaseRates[category] ? category : 'sedan');
    let baseRate = this.categoryBaseRates[effectiveCategory] || 1900;

    // 2. Valuation Factor: 0.28% of vehicle valuation, bounded
    let valuationComponent = 0;
    if (valuation > 0) {
      // Scale: 0.28% of valuation capped between ₹800 and ₹12,000
      valuationComponent = Math.round(valuation * 0.0028);
      valuationComponent = Math.max(800, Math.min(12000, valuationComponent));
      // Blend 60% category baseline with 40% valuation component
      baseRate = Math.round(baseRate * 0.6 + valuationComponent * 0.4);
    }

    // 3. Transmission Adjustment (Automatic is premium in Indian market)
    const transmissionBonus = transmission === 'automatic' ? 350 : 0;
    baseRate += transmissionBonus;

    // 4. Fuel Type Adjustment
    let fuelBonus = 0;
    if (fuelType === 'electric') {
      fuelBonus = 400; // EV tech premium, zero fuel cost for renter
    } else if (fuelType === 'diesel') {
      fuelBonus = 200; // Higher mileage diesel
    } else if (fuelType === 'hybrid') {
      fuelBonus = 250;
    }
    baseRate += fuelBonus;

    // 5. Age / Vintage Multiplier
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - year);
    let ageMultiplier = 1.0;

    if (age <= 2) {
      ageMultiplier = 1.15; // Brand new vehicle premium
    } else if (age <= 5) {
      ageMultiplier = 1.0; // Standard prime rental age
    } else if (age <= 8) {
      ageMultiplier = 0.88; // Minor depreciation
    } else {
      ageMultiplier = 0.75; // Budget tier
    }

    // 6. Luxury Brand Multiplier
    let brandMultiplier = 1.0;
    if (isLuxuryBrand) {
      brandMultiplier = 1.4;
    }

    // Final Daily Rental Calculation
    let calculatedDailyPrice = Math.round(baseRate * ageMultiplier * brandMultiplier);

    // Round to nearest ₹50 for clean display
    calculatedDailyPrice = Math.round(calculatedDailyPrice / 50) * 50;

    // Minimum safety bounds per category
    const minPrices = {
      hatchback: 1100,
      sedan: 1600,
      suv: 2300,
      mpv: 2100,
      luxury: 4800
    };
    calculatedDailyPrice = Math.max(minPrices[effectiveCategory] || 1200, calculatedDailyPrice);

    // Security Deposit
    const securityDeposit = this.categoryDeposits[effectiveCategory] || 5000;

    return {
      pricePerDay: calculatedDailyPrice,
      securityDeposit,
      currency: 'INR',
      calculationBreakdown: {
        category: effectiveCategory,
        baseRate,
        valuationComponent,
        transmissionBonus,
        fuelBonus,
        ageMultiplier,
        brandMultiplier,
        marketValuation: valuation
      }
    };
  }

  /**
   * Apply Rule-Based Dynamic Demand Multipliers
   * @param {Number} basePricePerDay 
   * @param {Object} factors { isWeekend, isPeakSeason, localInventoryCount, city }
   * @returns {Object}
   */
  applyDynamicPricing(basePricePerDay, factors = {}) {
    let multiplier = 1.0;
    const rulesApplied = [];

    // Weekend Leisure Demand (Fri-Sun)
    if (factors.isWeekend) {
      multiplier += 0.15;
      rulesApplied.push({ rule: 'Weekend Leisure Demand', adjustment: '+15%' });
    }

    // Peak Holiday / Festival Season (Summer May-Jun, Festive Oct-Dec)
    if (factors.isPeakSeason) {
      multiplier += 0.20;
      rulesApplied.push({ rule: 'Peak Travel Season', adjustment: '+20%' });
    }

    // High Demand / Low Inventory in City
    if (factors.localInventoryCount !== undefined && factors.localInventoryCount < 4) {
      multiplier += 0.10;
      rulesApplied.push({ rule: 'Limited City Fleet Availability', adjustment: '+10%' });
    }

    const dynamicPrice = Math.round((basePricePerDay * multiplier) / 50) * 50;

    return {
      basePrice: basePricePerDay,
      dynamicPrice,
      multiplier: Number(multiplier.toFixed(2)),
      demandLevel: multiplier >= 1.3 ? 'HIGH' : multiplier >= 1.15 ? 'MODERATE' : 'NORMAL',
      rulesApplied
    };
  }
}

module.exports = new PricingService();
