const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Feedback = require('../models/Feedback');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/feedback
// @desc    Get feedback with filtering
// @access  Public
router.get('/', [
  query('targetType').optional().isIn(['destination', 'product', 'seller', 'booking', 'platform']),
  query('targetId').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('sentiment').optional().isIn(['positive', 'negative', 'neutral'])
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

    const filter = { 
      isPublic: true, 
      'moderation.status': 'approved' 
    };

    if (req.query.targetType && req.query.targetId) {
      filter['target.type'] = req.query.targetType;
      filter['target.id'] = req.query.targetId;
    }

    if (req.query.rating) {
      filter['rating.overall'] = parseInt(req.query.rating);
    }

    if (req.query.sentiment) {
      filter['sentiment.label'] = req.query.sentiment;
    }

    const feedback = await Feedback.find(filter)
      .populate('user', 'name avatar')
      .populate('response.from', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        feedback,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching feedback'
    });
  }
});

// @route   POST /api/feedback
// @desc    Create feedback
// @access  Private
router.post('/', [
  protect,
  body('target.type').isIn(['destination', 'product', 'seller', 'booking', 'platform']).withMessage('Invalid target type'),
  body('target.id').isMongoId().withMessage('Valid target ID is required'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review.content').isLength({ min: 10, max: 1000 }).withMessage('Review content must be between 10 and 1000 characters')
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

    const feedbackData = {
      ...req.body,
      user: req.user._id
    };

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating feedback'
    });
  }
});

module.exports = router;
