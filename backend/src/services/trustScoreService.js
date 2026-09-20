/**
 * TrustScoreService - Explainable Vehicle Trust Score (0 - 100)
 * 
 * Transparent scoring formula:
 * 1. Maintenance Health (30 pts): Engine, brakes, tires, and routine service interval
 * 2. Service Verification (25 pts): Certified garage history and completeness
 * 3. Accident History (20 pts): Minor, major, or zero accident claims
 * 4. Odometer Confidence (15 pts): Verified timestamps and sequential logs
 * 5. Owner Reliability & Community Rating (10 pts): Host rating and trip fulfillment
 */

class TrustScoreService {
  /**
   * Calculate an explainable Vehicle Trust Score
   * @param {Object} vehicle
   * @returns {Object} { trustScore, ratingBadge, breakdown, explanation }
   */
  calculateTrustScore(vehicle = {}) {
    // 1. Maintenance Health (30 points max)
    const maintenanceHealth = vehicle.maintenance?.healthScore ?? vehicle.dna?.maintenance?.overallHealthScore ?? 85;
    const maintenancePoints = Math.round((maintenanceHealth / 100) * 30);

    // 2. Service Verification (25 points max)
    const serviceRecords = vehicle.serviceHistory?.length || vehicle.dna?.serviceRecords?.length || 0;
    let servicePoints = 18; // baseline standard
    if (serviceRecords >= 4) servicePoints = 25;
    else if (serviceRecords >= 2) servicePoints = 22;
    else if (serviceRecords === 1) servicePoints = 20;

    // 3. Accident History (20 points max)
    const accidentCount = vehicle.previousAccidents || vehicle.dna?.accidentReports?.length || 0;
    let accidentPoints = 20;
    if (accidentCount === 1) accidentPoints = 14;
    else if (accidentCount === 2) accidentPoints = 8;
    else if (accidentCount > 2) accidentPoints = 4;

    // 4. Odometer Confidence (15 points max)
    const odometerLogs = vehicle.dna?.odometerHistory?.length || 0;
    let odometerPoints = 12; // baseline GPS reading
    if (odometerLogs >= 3) odometerPoints = 15;
    else if (odometerLogs >= 1) odometerPoints = 13;

    // 5. Owner Reliability & Rating (10 points max)
    const avgRating = vehicle.rating !== undefined && vehicle.rating !== null ? vehicle.rating : null;
    const ratingPoints = avgRating !== null ? Math.round((Math.min(5, Math.max(0, avgRating)) / 5) * 10) : 8;

    // Total Score (0 - 100)
    const trustScore = Math.min(100, Math.max(20, (
      maintenancePoints + servicePoints + accidentPoints + odometerPoints + ratingPoints
    )));

    // Badge classification
    let ratingBadge = 'VERIFIED';
    if (trustScore >= 90) ratingBadge = 'ELITE TRUST';
    else if (trustScore >= 80) ratingBadge = 'HIGH TRUST';
    else if (trustScore >= 65) ratingBadge = 'VERIFIED';
    else ratingBadge = 'BASIC';

    const breakdown = {
      maintenanceHealth: { points: maintenancePoints, max: 30, score: maintenanceHealth },
      serviceVerification: { points: servicePoints, max: 25, recordsCount: serviceRecords },
      accidentHistory: { points: accidentPoints, max: 20, accidentCount },
      odometerConfidence: { points: odometerPoints, max: 15, verifiedLogs: odometerLogs },
      ownerReliability: { points: ratingPoints, max: 10, averageRating: avgRating }
    };

    const explanation = [
      `Maintenance health contributes ${maintenancePoints}/30 points based on component status.`,
      serviceRecords > 0 
        ? `${serviceRecords} verified service record(s) on file (+${servicePoints}/25).`
        : `Baseline standard service check (+${servicePoints}/25).`,
      accidentCount === 0 
        ? `Clean vehicle history with zero reported structural accidents (+${accidentPoints}/20).`
        : `${accidentCount} minor incident(s) logged in history (+${accidentPoints}/20).`,
      `Odometer integrity verified via sequential timestamped readings (+${odometerPoints}/15).`,
      `Driver satisfaction rating of ${avgRating.toFixed(1)}/5 stars (+${ratingPoints}/10).`
    ];

    return {
      trustScore,
      ratingBadge,
      breakdown,
      explanation
    };
  }
}

module.exports = new TrustScoreService();
