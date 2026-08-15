const analyticsService = require('../services/analyticsService');

exports.getFleetOverview = async (req, res) => {
  try {
    const data = await analyticsService.getFleetOverview();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getRevenueAnalytics(days);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUtilizationHeatmap = async (req, res) => {
  try {
    const data = await analyticsService.getUtilizationHeatmap();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPopularLocations = async (req, res) => {
  try {
    const data = await analyticsService.getPopularLocations();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerSegmentation = async (req, res) => {
  try {
    const data = await analyticsService.getCustomerSegmentation();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMaintenanceAlerts = async (req, res) => {
  try {
    const data = await analyticsService.getMaintenanceAlerts();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
