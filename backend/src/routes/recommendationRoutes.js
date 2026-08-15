const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth for recommendations (personalized if logged in, top recommendations if guest)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer') 
    ? req.headers.authorization.split(' ')[1] 
    : null;
  if (!token) return next();
  return protect(req, res, next);
};

router.get('/personalized', optionalAuth, controller.getRecommendations);
router.get('/pricing/:carId', controller.getDynamicPrice);

module.exports = router;
