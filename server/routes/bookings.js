const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', [
  protect,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  query('type').optional().isIn(['product', 'service', 'accommodation', 'guide', 'transport', 'package'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = {};
    if (req.user.role === 'tourist') {
      filter.tourist = req.user._id;
    } else if (req.user.role === 'seller') {
      filter.seller = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all bookings
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.bookingType = req.query.type;
    }

    const bookings = await Booking.find(filter)
      .populate('tourist', 'name email phone')
      .populate('seller', 'name email phone businessInfo.businessName')
      .populate('product', 'name category price images')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tourist', 'name email phone')
      .populate('seller', 'name email phone businessInfo.businessName')
      .populate('product', 'name category price images policies')
      .populate('destination', 'name location');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const hasAccess = req.user.role === 'admin' || 
                     booking.tourist._id.toString() === req.user._id.toString() ||
                     booking.seller._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching booking'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private (Tourist)
router.post('/', [
  protect,
  authorize('tourist'),
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('details.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('details.startDate').isISO8601().withMessage('Valid start date is required'),
  body('details.participants.adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
  body('details.participants.children').optional().isInt({ min: 0 }).withMessage('Children count must be non-negative'),
  body('payment.method').isIn(['card', 'upi', 'netbanking', 'wallet', 'cash']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { product: productId, details, payment } = req.body;

    // Get product details
    const product = await Product.findById(productId).populate('seller');
    if (!product || !product.isActive || !product.isApproved) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not available for booking'
      });
    }

    // Check availability
    const isAvailable = product.isAvailable(details.startDate, details.quantity);
    if (!isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Product is not available for the selected date and quantity'
      });
    }

    // Calculate pricing
    const basePrice = product.price.amount * details.quantity;
    const taxes = basePrice * 0.18; // 18% GST
    const fees = basePrice * 0.05; // 5% platform fee
    const totalAmount = basePrice + taxes + fees;

    // Create booking
    const bookingData = {
      tourist: req.user._id,
      seller: product.seller._id,
      product: productId,
      bookingType: product.category,
      details: {
        ...details,
        startDate: new Date(details.startDate)
      },
      pricing: {
        basePrice,
        taxes,
        fees,
        totalAmount,
        currency: product.price.currency
      },
      payment: {
        method: payment.method,
        status: 'pending'
      }
    };

    const booking = await Booking.create(bookingData);

    // Populate the booking for response
    await booking.populate([
      { path: 'product', select: 'name category price images' },
      { path: 'seller', select: 'name businessInfo.businessName' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating booking'
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Seller/Admin)
router.put('/:id/status', [
  protect,
  authorize('seller', 'admin'),
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  body('note').optional().isString().withMessage('Note must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user has permission to update this booking
    const canUpdate = req.user.role === 'admin' || 
                     booking.seller.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this booking'
      });
    }

    await booking.updateStatus(req.body.status, req.body.note, req.user._id);

    res.json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating booking status'
    });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.post('/:id/cancel', [
  protect,
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    const canCancel = req.user.role === 'admin' || 
                     booking.tourist.toString() === req.user._id.toString() ||
                     booking.seller.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking cannot be cancelled'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      requestedBy: req.user._id,
      reason: req.body.reason,
      requestedAt: new Date(),
      refundAmount
    };

    await booking.save();

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while cancelling booking'
    });
  }
});

// @route   POST /api/bookings/:id/message
// @desc    Add message to booking communication
// @access  Private
router.post('/:id/message', [
  protect,
  body('message').isString().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is part of this booking
    const isParticipant = booking.tourist.toString() === req.user._id.toString() ||
                         booking.seller.toString() === req.user._id.toString() ||
                         req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to send messages for this booking'
      });
    }

    await booking.addMessage(req.user._id, req.body.message);

    res.json({
      status: 'success',
      message: 'Message sent successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending message'
    });
  }
});

// @route   POST /api/bookings/:id/review
// @desc    Add review to completed booking
// @access  Private (Tourist)
router.post('/:id/review', [
  protect,
  authorize('tourist'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    if (booking.review.rating) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking already reviewed'
      });
    }

    // Add review
    booking.review = {
      rating: req.body.rating,
      comment: req.body.comment,
      submittedAt: new Date()
    };

    await booking.save();

    // Update product rating
    const product = await Product.findById(booking.product);
    if (product) {
      await product.updateRating(req.body.rating);
    }

    res.json({
      status: 'success',
      message: 'Review submitted successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while submitting review'
    });
  }
});

// @route   GET /api/bookings/analytics/seller
// @desc    Get booking analytics for seller
// @access  Private (Seller)
router.get('/analytics/seller', [
  protect,
  authorize('seller'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const period = req.query.period || '30d';
    const days = parseInt(period.replace('d', '')) || (period === '1y' ? 365 : 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Booking.aggregate([
      {
        $match: {
          seller: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          averageBookingValue: { $avg: '$pricing.totalAmount' },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = analytics[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };

    res.json({
      status: 'success',
      data: { analytics: result }
    });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
