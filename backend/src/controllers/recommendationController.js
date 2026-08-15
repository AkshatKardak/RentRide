const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.id : null;
    const limit = parseInt(req.query.limit) || 8;
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDynamicPrice = async (req, res) => {
  try {
    const { carId } = req.params;
    const { basePrice } = req.query;
    const result = await recommendationService.optimizePricing(carId, basePrice ? Number(basePrice) : undefined);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
