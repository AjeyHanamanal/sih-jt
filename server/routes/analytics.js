const express = require('express');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/dashboard', [protect, authorize('admin')], async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalUsers,
      totalProducts,
      totalBookings,
      totalDestinations,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, isApproved: true }),
      Booking.countDocuments(),
      Destination.countDocuments({ isActive: true }),
      User.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: last30Days } 
      }),
      Booking.countDocuments({ 
        createdAt: { $gte: last30Days } 
      })
    ]);

    // Get revenue data
    const revenueData = await Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalAmount' },
          averageBookingValue: { $avg: '$pricing.totalAmount' }
        }
      }
    ]);

    // Get user growth data
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get booking status distribution
    const bookingStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get popular destinations
    const popularDestinations = await Destination.find({ isActive: true })
      .sort({ 'rating.count': -1 })
      .limit(5)
      .select('name rating location category');

    // Get top sellers
    const topSellers = await User.aggregate([
      {
        $match: {
          role: 'seller',
          isActive: true,
          'businessInfo.isApproved': true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'seller',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'seller',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          'businessInfo.businessName': 1,
          'businessInfo.rating': 1,
          productCount: { $size: '$products' },
          bookingCount: { $size: '$bookings' },
          totalRevenue: {
            $sum: '$bookings.pricing.totalAmount'
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalBookings,
          totalDestinations,
          recentUsers,
          recentBookings,
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          averageBookingValue: revenueData[0]?.averageBookingValue || 0
        },
        userGrowth,
        bookingStatus,
        popularDestinations,
        topSellers
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
