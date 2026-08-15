const blockchainService = require('../services/blockchainService');

exports.mintPassport = async (req, res) => {
  try {
    const { carId, vin, metadata } = req.body;
    const result = await blockchainService.mintVehiclePassport(carId, vin, metadata);
    res.status(201).json({ success: true, message: 'Vehicle passport minted on Polygon blockchain', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addServiceRecord = async (req, res) => {
  try {
    const { carId } = req.params;
    const { serviceData, garageAddress } = req.body;
    const result = await blockchainService.addServiceRecord(carId, serviceData, garageAddress);
    res.status(201).json({ success: true, message: 'Service record written to blockchain', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addAccidentReport = async (req, res) => {
  try {
    const { carId } = req.params;
    const { reportData, insuranceAddress } = req.body;
    const result = await blockchainService.addAccidentReport(carId, reportData, insuranceAddress);
    res.status(201).json({ success: true, message: 'Accident report written to blockchain', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addOdometerReading = async (req, res) => {
  try {
    const { carId } = req.params;
    const { reading, gpsHash } = req.body;
    const result = await blockchainService.addOdometerReading(carId, reading, gpsHash);
    res.status(201).json({ success: true, message: 'Odometer reading recorded on blockchain', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVehicleHistory = async (req, res) => {
  try {
    const { carId } = req.params;
    const result = await blockchainService.getVehicleHistory(carId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
