const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get fleet overview statistics
 */
async function getFleetOverview() {
  const totalCars = await Car.countDocuments();
  const availableCars = await Car.countDocuments({
    available: true,
    status: { $ne: 'inactive' }
  });
  const bookedCars = await Car.countDocuments({
    $or: [{ available: false }, { status: 'booked' }]
  });
  const maintenanceCars = await Car.countDocuments({ status: 'maintenance' });

  const totalRevenueAgg = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'completed', 'approved', 'active'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ['$pricing.totalAmount', '$totalPrice'] } }
      }
    }
  ]);

  const activeBookings = await Booking.countDocuments({
    status: { $in: ['pending', 'approved', 'confirmed', 'active'] }
  });

  const totalUsers = await User.countDocuments();
  const totalBookings = await Booking.countDocuments();

  const totalRev = totalRevenueAgg[0]?.total || 0;
  const utilizationRate = totalCars > 0 ? Number(((bookedCars / totalCars) * 100).toFixed(2)) : 0;

  return {
    totalCars,
    availableCars,
    bookedCars,
    maintenanceCars,
    utilizationRate,
    totalRevenue: totalRev,
    activeBookings,
    totalBookings,
    totalUsers,
    generatedAt: new Date()
  };
}

/**
 * Get revenue analytics
 */
async function getRevenueAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const revenueByDay = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['confirmed', 'completed', 'approved', 'active'] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: { $ifNull: ['$pricing.totalAmount', '$totalPrice'] } },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const revenueByCarType = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['confirmed', 'completed', 'approved', 'active'] }
      }
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'carDetails'
      }
    },
    { $unwind: '$carDetails' },
    {
      $group: {
        _id: { $ifNull: ['$carDetails.bodyType', '$carDetails.category'] },
        revenue: { $sum: { $ifNull: ['$pricing.totalAmount', '$totalPrice'] } },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  const averageBookingValue = await getAverageBookingValue(startDate);

  return {
    dailyRevenue: revenueByDay,
    revenueByCarType: revenueByCarType.map(r => ({
      carType: r._id || 'Standard',
      revenue: r.revenue,
      bookings: r.bookings
    })),
    averageBookingValue: Math.round(averageBookingValue),
    periodDays: days
  };
}

/**
 * Get car utilization heatmap
 */
async function getUtilizationHeatmap() {
  const utilization = await Car.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'car',
        as: 'bookings'
      }
    },
    {
      $project: {
        brand: { $ifNull: ['$brand', '$make'] },
        model: 1,
        bodyType: { $ifNull: ['$bodyType', '$category'] },
        city: { $ifNull: ['$city', '$pickupLocation.city'] },
        totalBookings: { $size: '$bookings' },
        totalRevenue: {
          $sum: {
            $map: {
              input: '$bookings',
              as: 'b',
              in: { $ifNull: ['$$b.pricing.totalAmount', '$$b.totalPrice'] }
            }
          }
        },
        healthScore: { $ifNull: ['$maintenance.healthScore', null] },
        utilizationDays: {
          $sum: {
            $map: {
              input: '$bookings',
              as: 'booking',
              in: {
                $divide: [
                  { $abs: { $subtract: ['$$booking.endDate', '$$booking.startDate'] } },
                  86400000 // ms to days
                ]
              }
            }
          }
        }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 25 }
  ]);

  return utilization;
}

/**
 * Get popular pickup/dropoff locations
 */
async function getPopularLocations() {
  const pickupLocations = await Booking.aggregate([
    {
      $group: {
        _id: { $ifNull: ['$pickupLocation.city', 'Mumbai'] },
        count: { $sum: 1 },
        revenue: { $sum: { $ifNull: ['$pricing.totalAmount', '$totalPrice'] } }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const dropoffLocations = await Booking.aggregate([
    {
      $group: {
        _id: { $ifNull: ['$dropoffLocation.city', 'Mumbai'] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return {
    pickupLocations: pickupLocations.map(p => ({ city: p._id, bookings: p.count, revenue: p.revenue })),
    dropoffLocations: dropoffLocations.map(d => ({ city: d._id, bookings: d.count }))
  };
}

/**
 * Get customer segmentation
 */
async function getCustomerSegmentation() {
  const users = await User.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'user',
        as: 'bookings'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        totalBookings: { $size: '$bookings' },
        totalSpent: {
          $sum: {
            $map: {
              input: '$bookings',
              as: 'b',
              in: { $ifNull: ['$$b.pricing.totalAmount', '$$b.totalPrice'] }
            }
          }
        },
        avgRating: { $avg: '$bookings.rating' }
      }
    }
  ]);

  const segments = {
    vip: users.filter(u => u.totalSpent >= 50000 || u.totalBookings >= 5),
    regular: users.filter(u => (u.totalSpent > 10000 && u.totalSpent < 50000) || (u.totalBookings >= 2 && u.totalBookings < 5)),
    occasional: users.filter(u => u.totalSpent <= 10000 && u.totalBookings < 2)
  };

  return {
    counts: {
      vip: segments.vip.length,
      regular: segments.regular.length,
      occasional: segments.occasional.length,
      total: users.length
    },
    segments: {
      vip: segments.vip.slice(0, 10),
      regular: segments.regular.slice(0, 10),
      occasional: segments.occasional.slice(0, 10)
    }
  };
}

/**
 * Get maintenance alerts
 */
async function getMaintenanceAlerts() {
  const cars = await Car.find({
    $or: [
      { 'dna.maintenance.overallHealthScore': { $lt: 70 } },
      { status: 'maintenance' }
    ]
  }).populate('owner', 'name email phone');

  if (cars.length === 0) {
    // If none flagged, query cars with highest mileage
    const highMileageCars = await Car.find().sort({ mileage: -1 }).limit(3).populate('owner', 'name email phone');
    return highMileageCars.map(car => ({
      carId: car._id,
      brand: car.brand,
      model: car.model,
      healthScore: car.maintenance?.healthScore || null,
      owner: car.owner,
      recommendedActions: car.maintenance?.recommendedActions || ['Periodic general inspection advised'],
      urgency: 'MEDIUM'
    }));
  }

  return cars.map(car => ({
    carId: car._id,
    brand: car.brand,
    model: car.model,
    healthScore: car.maintenance?.healthScore || null,
    owner: car.owner,
    recommendedActions: car.maintenance?.recommendedActions || ['Immediate workshop diagnostic required'],
    urgency: (car.maintenance?.healthScore || 50) < 50 ? 'HIGH' : 'MEDIUM'
  }));
}

/**
 * Helper: Get average booking value
 */
async function getAverageBookingValue(startDate) {
  const result = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['confirmed', 'completed', 'approved', 'active'] }
      }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: { $ifNull: ['$pricing.totalAmount', '$totalPrice'] } }
      }
    }
  ]);

  return result[0]?.avg || 3500;
}

module.exports = {
  getFleetOverview,
  getRevenueAnalytics,
  getUtilizationHeatmap,
  getPopularLocations,
  getCustomerSegmentation,
  getMaintenanceAlerts,
  getAverageBookingValue
};
