const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Destination = require('../models/Destination');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/destinations
// @desc    Get all destinations with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['historical', 'religious', 'natural', 'adventure', 'cultural', 'wildlife', 'archaeological', 'eco-tourism']),
  query('city').optional().isString(),
  query('search').optional().isString(),
  query('featured').optional().isBoolean(),
  query('sort').optional().isIn(['name', 'rating', 'createdAt', 'popularity'])
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
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.city) {
      filter['location.city'] = new RegExp(req.query.city, 'i');
    }
    
    if (req.query.featured) {
      filter.isFeatured = req.query.featured === 'true';
    }

    // Build search query
    let searchQuery = {};
    if (req.query.search) {
      searchQuery = {
        $text: { $search: req.query.search }
      };
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'name':
          sort = { name: 1 };
          break;
        case 'rating':
          sort = { 'rating.average': -1 };
          break;
        case 'popularity':
          sort = { 'rating.count': -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    // Execute query
    const destinations = await Destination.find({ ...filter, ...searchQuery })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-seo');

    const total = await Destination.countDocuments({ ...filter, ...searchQuery });

    res.json({
      status: 'success',
      data: {
        destinations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching destinations'
    });
  }
});

// @route   GET /api/destinations/featured
// @desc    Get featured destinations
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const destinations = await Destination.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ 'rating.average': -1 })
    .limit(6)
    .select('name shortDescription primaryImage rating location category');

    res.json({
      status: 'success',
      data: { destinations }
    });
  } catch (error) {
    console.error('Get featured destinations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching featured destinations'
    });
  }
});

// @route   GET /api/destinations/categories
// @desc    Get destination categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Destination.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating.average' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/destinations/:id
// @desc    Get single destination by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination || !destination.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Destination not found'
      });
    }

    // Increment view count (you might want to track this separately)
    // For now, we'll just return the destination

    res.json({
      status: 'success',
      data: { destination }
    });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching destination'
    });
  }
});

// @route   POST /api/destinations
// @desc    Create new destination
// @access  Private (Admin only)
router.post('/', [
  protect,
  authorize('admin'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('shortDescription').isLength({ min: 10, max: 300 }).withMessage('Short description must be between 10 and 300 characters'),
  body('category').isIn(['historical', 'religious', 'natural', 'adventure', 'cultural', 'wildlife', 'archaeological', 'eco-tourism']).withMessage('Invalid category'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.coordinates.lat').isFloat().withMessage('Valid latitude is required'),
  body('location.coordinates.lng').isFloat().withMessage('Valid longitude is required')
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

    const destination = await Destination.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Destination created successfully',
      data: { destination }
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating destination'
    });
  }
});

// @route   PUT /api/destinations/:id
// @desc    Update destination
// @access  Private (Admin only)
router.put('/:id', [
  protect,
  authorize('admin'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').optional().isIn(['historical', 'religious', 'natural', 'adventure', 'cultural', 'wildlife', 'archaeological', 'eco-tourism']).withMessage('Invalid category')
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

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({
        status: 'error',
        message: 'Destination not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Destination updated successfully',
      data: { destination }
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating destination'
    });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete destination
// @access  Private (Admin only)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({
        status: 'error',
        message: 'Destination not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting destination'
    });
  }
});

// @route   POST /api/destinations/:id/rate
// @desc    Rate a destination
// @access  Private
router.post('/:id/rate', [
  protect,
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
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

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({
        status: 'error',
        message: 'Destination not found'
      });
    }

    await destination.updateRating(req.body.rating);

    res.json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: {
        averageRating: destination.rating.average,
        totalRatings: destination.rating.count
      }
    });
  } catch (error) {
    console.error('Rate destination error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while rating destination'
    });
  }
});

// @route   GET /api/destinations/nearby/:lat/:lng
// @desc    Get nearby destinations
// @access  Public
router.get('/nearby/:lat/:lng', [
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
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

    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const radius = parseFloat(req.query.radius) || 50; // Default 50km radius
    const limit = parseInt(req.query.limit) || 10;

    // Calculate distance using MongoDB's geospatial query
    const destinations = await Destination.find({
      isActive: true,
      'location.coordinates.lat': {
        $gte: lat - (radius / 111), // Rough conversion: 1 degree ≈ 111 km
        $lte: lat + (radius / 111)
      },
      'location.coordinates.lng': {
        $gte: lng - (radius / 111),
        $lte: lng + (radius / 111)
      }
    })
    .limit(limit)
    .select('name shortDescription primaryImage location rating category');

    // Calculate actual distances (simplified)
    const destinationsWithDistance = destinations.map(dest => {
      const destLat = dest.location.coordinates.lat;
      const destLng = dest.location.coordinates.lng;
      const distance = Math.sqrt(
        Math.pow(destLat - lat, 2) + Math.pow(destLng - lng, 2)
      ) * 111; // Convert to km

      return {
        ...dest.toObject(),
        distance: Math.round(distance * 100) / 100
      };
    });

    // Sort by distance
    destinationsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      status: 'success',
      data: { destinations: destinationsWithDistance }
    });
  } catch (error) {
    console.error('Get nearby destinations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching nearby destinations'
    });
  }
});

module.exports = router;
