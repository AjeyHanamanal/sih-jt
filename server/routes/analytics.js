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

// @route   GET /api/analytics/comprehensive
// @desc    Get comprehensive platform analytics
// @access  Private (Admin)
router.get('/comprehensive', [protect, authorize('admin')], async (req, res) => {
  try {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get comprehensive overview
    const [
      totalUsers,
      activeUsers,
      newUsers7d,
      newUsers30d,
      totalSellers,
      approvedSellers,
      pendingSellers,
      totalProducts,
      approvedProducts,
      pendingProducts,
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'seller', 'businessInfo.isApproved': true }),
      User.countDocuments({ role: 'seller', 'businessInfo.isApproved': false }),
      Product.countDocuments(),
      Product.countDocuments({ isApproved: true }),
      Product.countDocuments({ isApproved: null }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid', createdAt: { $gte: last30Days } } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ])
    ]);

    // Get user growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last90Days }
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

    // Get booking trends
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last90Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          createdAt: { $gte: last90Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          revenue: { $sum: '$pricing.totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get popular destinations
    const popularDestinations = await Destination.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'destination',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          category: 1,
          rating: 1,
          bookingCount: { $size: '$bookings' },
          revenue: { $sum: '$bookings.pricing.totalAmount' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

    // Get top products
    const topProducts = await Product.aggregate([
      { $match: { isApproved: true, isActive: true } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'product',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          price: 1,
          rating: 1,
          bookingCount: { $size: '$bookings' },
          revenue: { $sum: '$bookings.pricing.totalAmount' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

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
          email: 1,
          'businessInfo.businessName': 1,
          'businessInfo.rating': 1,
          productCount: { $size: '$products' },
          bookingCount: { $size: '$bookings' },
          revenue: { $sum: '$bookings.pricing.totalAmount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Get booking status distribution
    const bookingStatusDistribution = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user role distribution
    const userRoleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get product category distribution
    const productCategoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsers7d,
          newUsers30d,
          totalSellers,
          approvedSellers,
          pendingSellers,
          totalProducts,
          approvedProducts,
          pendingProducts,
          totalBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0
        },
        userGrowth,
        bookingTrends,
        revenueByMonth,
        popularDestinations,
        topProducts,
        topSellers,
        bookingStatusDistribution,
        userRoleDistribution,
        productCategoryDistribution
      }
    });
  } catch (error) {
    console.error('Get comprehensive analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching comprehensive analytics'
    });
  }
});

module.exports = router;
