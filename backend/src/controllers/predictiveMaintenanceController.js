const predictiveMaintenance = require('../services/predictiveMaintenance');
const Car = require('../models/Car');

exports.calculateCarMaintenance = async (req, res) => {
  try {
    const { carId } = req.params;
    const result = await predictiveMaintenance.calculateMaintenanceScore(carId);
    res.json({ success: true, carId, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.calculateCustomScore = async (req, res) => {
  try {
    const carData = req.body;
    const result = await predictiveMaintenance.calculateMaintenanceScore(carData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFleetMaintenanceReport = async (req, res) => {
  try {
    const cars = await Car.find({ status: { $ne: 'inactive' } }).limit(20);
    const reports = await Promise.all(
      cars.map(async (car) => {
        const score = await predictiveMaintenance.calculateMaintenanceScore(car);
        return {
          carId: car._id,
          name: car.name || `${car.make || car.brand} ${car.model}`,
          brand: car.brand || car.make,
          model: car.model,
          year: car.year,
          mileage: car.totalMileage || car.mileage,
          healthScore: score.overallHealthScore,
          reliabilityBadge: score.reliabilityBadge,
          urgentFailures: score.predictedFailures.filter(f => f.severity === 'HIGH'),
          recommendations: score.recommendedActions
        };
      })
    );

    res.json({
      success: true,
      totalVehicles: reports.length,
      averageHealthScore: Math.round(reports.reduce((sum, r) => sum + r.healthScore, 0) / (reports.length || 1)),
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
