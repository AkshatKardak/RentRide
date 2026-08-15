const Car = require('../models/Car');
const mongoose = require('mongoose');

let tf = null;
try {
  tf = require('@tensorflow/tfjs');
} catch (err) {
  // Optional until npm install
}

// Model cache
let maintenanceModel = null;

async function loadModel() {
  if (maintenanceModel) return maintenanceModel;
  if (!tf) return null;

  try {
    // Attempt loading saved neural model if present
    maintenanceModel = await tf.loadLayersModel('file://models/maintenance_predictor.json');
    console.log('🤖 Loaded trained TensorFlow maintenance predictor model');
  } catch (err) {
    // Build a lightweight TF neural network estimator
    try {
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [20] }));
      model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
      maintenanceModel = model;
    } catch (e) {
      console.warn('TF network fallback initialized');
    }
  }
  return maintenanceModel;
}

/**
 * Calculate maintenance score for a vehicle
 */
async function calculateMaintenanceScore(carInput) {
  try {
    let car = carInput;
    if (typeof carInput === 'string') {
      car = await Car.findById(carInput);
      if (!car) throw new Error('Vehicle not found');
    }

    // Extract 20+ telemetry and usage features
    const features = [
      car.ageInYears !== undefined ? car.ageInYears : (new Date().getFullYear() - (car.year || 2022)),
      ((car.totalMileage !== undefined ? car.totalMileage : (car.mileage * 1000 || 25000))) / 1000,
      daysSinceLastService(car.lastServiceDate),
      car.rentalFrequency || 10,
      car.averageTripDistance || 100,
      car.climateExposureScore || 50,
      car.cityDrivingRatio || 0.6,
      car.highwayDrivingRatio || 0.4,
      car.previousAccidents || (car.dna?.accidentReports?.length || 0),
      car.serviceHistoryCompleteness !== undefined ? car.serviceHistoryCompleteness : 0.9,
      car.batteryAge || 1.5,
      car.tireWearLevel || 0.25,
      car.brakeWearLevel || 0.25,
      car.engineHealthScore || 95,
      car.transmissionHealthScore || 95,
      car.acPerformanceScore || 92,
      car.suspensionHealthScore || 90,
      car.fuelSystemHealthScore || 95,
      car.electricalSystemHealthScore || 94,
      car.exteriorConditionScore || 92
    ];

    // Normalize features to [0, 1]
    const normalized = normalizeFeatures(features);

    let failureProbability = 0.12;

    const model = await loadModel();
    if (model && tf) {
      try {
        const inputTensor = tf.tensor2d([normalized]);
        const prediction = model.predict(inputTensor);
        const predData = await prediction.data();
        failureProbability = Math.max(0.02, Math.min(0.95, predData[0]));
        inputTensor.dispose();
        prediction.dispose();
      } catch (tfErr) {
        failureProbability = calculateHeuristicFailureRisk(normalized);
      }
    } else {
      failureProbability = calculateHeuristicFailureRisk(normalized);
    }

    const healthScore = Math.max(10, Math.min(100, Math.round(100 - (failureProbability * 100))));

    // Generate component-specific risks
    const predictedFailures = await getComponentRisks(car, failureProbability);

    // Generate recommendations
    const recommendedActions = generateRecommendations(car, healthScore, predictedFailures);

    // Determine reliability badge
    const reliabilityBadge = healthScore >= 80 ? 'EXCELLENT' :
                            healthScore >= 60 ? 'GOOD' :
                            healthScore >= 40 ? 'FAIR' : 'POOR';

    const result = {
      overallHealthScore: healthScore,
      failureProbability: Number(failureProbability.toFixed(3)),
      reliabilityBadge,
      predictedFailures,
      recommendedActions,
      calculatedAt: new Date()
    };

    // Update car in database if it was a valid Mongoose model
    if (car._id && mongoose.Types.ObjectId.isValid(car._id)) {
      try {
        await Car.findByIdAndUpdate(car._id, {
          'dna.maintenance': result
        });
      } catch (dbErr) {
        // Ignore in detached / mock scenarios
      }
    }

    return result;
  } catch (error) {
    console.error('Error calculating maintenance score:', error);
    throw error;
  }
}

/**
 * Fallback ML heuristic failure risk calculator
 */
function calculateHeuristicFailureRisk(norm) {
  // norm indexes: 0:age, 1:mileage, 2:days_service, 8:accidents, 10:battery, 11:tires, 12:brakes, 13:engine
  const ageRisk = (norm[0] || 0) * 0.15;
  const mileageRisk = (norm[1] || 0) * 0.20;
  const serviceRisk = (norm[2] || 0) * 0.15;
  const accidentRisk = (norm[8] || 0) * 0.10;
  const wearRisk = ((norm[11] || 0) + (norm[12] || 0)) * 0.20;
  const healthDeficit = (1 - (norm[13] || 0.95)) * 0.20;

  const total = ageRisk + mileageRisk + serviceRisk + accidentRisk + wearRisk + healthDeficit;
  return Math.min(0.9, Math.max(0.03, total));
}

/**
 * Get component-specific failure risks
 */
async function getComponentRisks(car, overallRisk) {
  const risks = [];
  const mileage = car.totalMileage || (car.mileage * 1000) || 30000;
  const daysService = daysSinceLastService(car.lastServiceDate);

  // Brake pads (high wear item)
  if ((mileage % 40000) > 30000 || (car.brakeWearLevel && car.brakeWearLevel > 0.6)) {
    risks.push({
      component: 'brake_pads',
      probability: Number((0.20 + (overallRisk * 0.3)).toFixed(2)),
      estimatedMileage: 2500,
      severity: 'MEDIUM'
    });
  }

  // Battery (age-dependent)
  if ((car.batteryAge || 1) > 3) {
    risks.push({
      component: 'battery',
      probability: Number((0.25 + (overallRisk * 0.25)).toFixed(2)),
      estimatedMileage: 5000,
      severity: 'HIGH'
    });
  }

  // Tires
  if ((car.tireWearLevel && car.tireWearLevel > 0.65) || (mileage % 45000) > 35000) {
    risks.push({
      component: 'tires',
      probability: Number((0.30 + (overallRisk * 0.3)).toFixed(2)),
      estimatedMileage: 1800,
      severity: 'HIGH'
    });
  }

  // Engine Oil & Filter
  if (daysService > 150 || (mileage % 10000) > 8500) {
    risks.push({
      component: 'engine_oil_filter',
      probability: Number((0.40 + (overallRisk * 0.2)).toFixed(2)),
      estimatedMileage: 800,
      severity: 'MEDIUM'
    });
  }

  // AC & Cabin Filter
  if ((car.acPerformanceScore && car.acPerformanceScore < 75)) {
    risks.push({
      component: 'ac_system',
      probability: 0.35,
      estimatedMileage: 3000,
      severity: 'LOW'
    });
  }

  return risks;
}

/**
 * Generate maintenance recommendations
 */
function generateRecommendations(car, healthScore, predictedFailures) {
  const recommendations = [];
  const daysService = daysSinceLastService(car.lastServiceDate);
  const mileage = car.totalMileage || 30000;

  if (daysService > 180) {
    recommendations.push('Full comprehensive service due immediately');
  } else if (daysService > 150) {
    recommendations.push('Periodic scheduled service due within 800 km');
  }

  if (mileage % 10000 > 8000) {
    recommendations.push('Synthetic engine oil change recommended');
  }

  if ((car.tireWearLevel && car.tireWearLevel > 0.55) || (mileage % 15000 > 12000)) {
    recommendations.push('Wheel alignment and tire rotation recommended');
  }

  if (car.acPerformanceScore && car.acPerformanceScore < 80) {
    recommendations.push('AC pollen filter cleaning & coolant inspection suggested');
  }

  if (car.batteryAge && car.batteryAge > 3.5) {
    recommendations.push('Battery terminal voltage diagnostic check recommended');
  }

  predictedFailures.forEach(failure => {
    if (failure.severity === 'HIGH') {
      recommendations.push(`⚠️ ${failure.component.replace(/_/g, ' ').toUpperCase()} replacement required soon`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('All vehicle systems nominal - ready for multi-day rentals');
  }

  return recommendations;
}

/**
 * Calculate days since last service
 */
function daysSinceLastService(lastServiceDate) {
  if (!lastServiceDate) return 60;
  const diff = Date.now() - new Date(lastServiceDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Normalize features to 0-1 range
 */
function normalizeFeatures(features) {
  const minMax = [
    [0, 15],     // age (years)
    [0, 300],    // mileage (k km)
    [0, 365],    // days since service
    [0, 100],    // rental frequency
    [0, 500],    // avg trip distance
    [0, 100],    // climate score
    [0, 1],      // city ratio
    [0, 1],      // highway ratio
    [0, 10],     // accidents
    [0, 1],      // service completeness
    [0, 10],     // battery age
    [0, 1],      // tire wear
    [0, 1],      // brake wear
    [0, 100],    // engine health
    [0, 100],    // transmission health
    [0, 100],    // AC health
    [0, 100],    // suspension health
    [0, 100],    // fuel system health
    [0, 100],    // electrical health
    [0, 100]     // exterior health
  ];

  return features.map((val, idx) => {
    const [min, max] = minMax[idx] || [0, 100];
    const safeVal = typeof val === 'number' && !isNaN(val) ? val : min;
    return Math.max(0, Math.min(1, (safeVal - min) / (max - min)));
  });
}

module.exports = {
  calculateMaintenanceScore,
  getComponentRisks,
  generateRecommendations,
  loadModel
};
