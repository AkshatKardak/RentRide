const vehicleApiService = require('../services/vehicleApiService');

exports.getMakes = async (req, res) => {
  try {
    const makes = await vehicleApiService.getMakes();
    res.json({ success: true, data: makes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getModelsByMake = async (req, res) => {
  try {
    const { make } = req.params;
    const models = await vehicleApiService.getModelsByMake(make);
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVehicleSpecs = async (req, res) => {
  try {
    const { make, model, year } = req.query;
    const specs = await vehicleApiService.getVehicleSpecs({ make, model, year: Number(year) || 2024 });
    res.json({ success: true, data: specs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVehicleImages = async (req, res) => {
  try {
    const { make, model, year, trim, color, angle } = req.query;
    const images = await vehicleApiService.getVehicleImages({ make, model, year, trim, color, angle });
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.decodeVIN = async (req, res) => {
  try {
    const { vin } = req.params;
    const data = await vehicleApiService.decodeVIN(vin);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompleteProfile = async (req, res) => {
  try {
    const { make, model, year, trim } = req.query;
    const profile = await vehicleApiService.getCompleteVehicleProfile({ make, model, year: Number(year) || 2024, trim });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncVehicles = async (req, res) => {
  try {
    const result = await vehicleApiService.syncVehiclesFromAPI();
    res.json({ success: true, message: 'CarsXE sync completed', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
