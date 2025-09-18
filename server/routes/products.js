const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize, requireSellerApproval, checkOwnership } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['handicrafts', 'homestay', 'guide_service', 'transport', 'restaurant', 'tour_package', 'cultural_experience', 'adventure_activity', 'other']),
  query('city').optional().isString(),
  query('destinationId').optional().isMongoId(),
  query('search').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('sort').optional().isIn(['name', 'price', 'rating', 'createdAt'])
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
    const filter = { 
      isActive: true, 
      isApproved: true 
    };
    if (req.query.destinationId) {
      filter.destination = req.query.destinationId;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.city) {
      filter['location.city'] = new RegExp(req.query.city, 'i');
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter['price.amount'] = {};
      if (req.query.minPrice) {
        filter['price.amount'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter['price.amount'].$lte = parseFloat(req.query.maxPrice);
      }
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
        case 'price':
          sort = { 'price.amount': 1 };
          break;
        case 'rating':
          sort = { 'rating.average': -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    // Execute query with seller population
    const products = await Product.find({ ...filter, ...searchQuery })
      .populate('seller', 'name businessInfo.businessName businessInfo.rating avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-seo');

    const total = await Product.countDocuments({ ...filter, ...searchQuery });

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isApproved: true,
      isFeatured: true 
    })
    .populate('seller', 'name businessInfo.businessName businessInfo.rating avatar')
    .sort({ 'rating.average': -1 })
    .limit(8)
    .select('name shortDescription primaryImage price rating category seller');

    res.json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching featured products'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true, isApproved: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price.amount' },
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

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name businessInfo businessInfo.rating avatar phone email');
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Only show approved products to non-sellers
    if (req.user?.role !== 'seller' && req.user?.role !== 'admin' && !product.isApproved) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Seller only)
router.post('/', [
  protect,
  authorize('seller'),
  requireSellerApproval,
  upload.array('images', 10), // Handle up to 10 images
  // Simplified validation - only check required fields
  // No validation for FormData - handle in the route handler
], async (req, res) => {
  try {
    console.log('Product creation request body:', JSON.stringify(req.body, null, 2));
    console.log('Uploaded files:', req.files ? req.files.length : 0);
    
    // Simple validation for required fields
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and description are required'
      });
    }

    // Parse FormData fields (they come as strings)
    let price, location, availability, features, tags, contactInfo, policies;
    
    try {
      price = req.body.price ? JSON.parse(req.body.price) : {};
    } catch (e) {
      price = {};
    }
    
    try {
      location = req.body.location ? JSON.parse(req.body.location) : {};
    } catch (e) {
      location = {};
    }
    
    try {
      availability = req.body.availability ? JSON.parse(req.body.availability) : {};
    } catch (e) {
      availability = {};
    }
    
    try {
      features = req.body.features ? JSON.parse(req.body.features) : [];
    } catch (e) {
      features = [];
    }
    
    try {
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (e) {
      tags = [];
    }
    
    try {
      contactInfo = req.body.contactInfo ? JSON.parse(req.body.contactInfo) : {};
    } catch (e) {
      contactInfo = {};
    }
    
    try {
      policies = req.body.policies ? JSON.parse(req.body.policies) : {};
    } catch (e) {
      policies = {};
    }

    // Provide default values for required fields
    const productData = {
      name: req.body.name || 'Untitled Product',
      description: req.body.description || 'No description provided',
      shortDescription: req.body.shortDescription || req.body.description || 'No description provided',
      category: req.body.category || 'other',
      price: {
        amount: parseFloat(price.amount) || 0,
        currency: 'INR',
        unit: price.unit || 'per_item'
      },
      location: {
        city: location.city || 'Ranchi',
        state: location.state || 'Jharkhand',
        address: location.address || '',
        coordinates: {
          lat: parseFloat(location.coordinates?.lat) || 23.3441,
          lng: parseFloat(location.coordinates?.lng) || 85.3096
        }
      },
      availability: {
        inStock: availability.isAvailable !== false,
        quantity: parseInt(availability.maxGuests) || 10,
        maxQuantity: parseInt(availability.maxGuests) || 10
      },
      features: features ? features.map(feature => ({
        name: feature,
        description: feature,
        included: true
      })) : [],
      tags: tags || [],
      contactInfo: {
        phone: contactInfo.phone || '',
        email: contactInfo.email || req.user.email,
        whatsapp: contactInfo.whatsapp || ''
      },
      policies: {
        cancellation: {
          allowed: true,
          deadline: 24,
          refundPercentage: 100
        },
        modification: {
          allowed: true,
          deadline: 12
        },
        terms: policies.terms ? [policies.terms] : []
      },
      images: req.files ? req.files.map((file, index) => ({
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        alt: file.originalname,
        isPrimary: index === 0
      })) : [],
      seller: req.user._id,
      isApproved: true // Auto-approve for development
    };

    const product = await Product.create(productData);

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully and is now live!',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Seller/Admin)
router.put('/:id', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price.amount').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative')
], checkOwnership(Product), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // If seller is updating, reset approval status
    if (req.user.role === 'seller') {
      req.body.isApproved = false;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: req.user.role === 'seller' ? 'Product updated successfully. It will be reviewed again.' : 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Seller/Admin)
router.delete('/:id', [protect], checkOwnership(Product), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting product'
    });
  }
});

// @route   GET /api/products/seller/my-products
// @desc    Get seller's products
// @access  Private (Seller)
router.get('/seller/my-products', [
  protect,
  authorize('seller')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ seller: req.user._id });

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching seller products'
    });
  }
});

// @route   POST /api/products/:id/rate
// @desc    Rate a product
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    await product.updateRating(req.body.rating);

    res.json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: {
        averageRating: product.rating.average,
        totalRatings: product.rating.count
      }
    });
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while rating product'
    });
  }
});

// @route   POST /api/products/:id/check-availability
// @desc    Check product availability
// @access  Public
router.post('/:id/check-availability', [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const { date, quantity = 1 } = req.body;
    const isAvailable = product.isAvailable(date, quantity);

    res.json({
      status: 'success',
      data: {
        available: isAvailable,
        product: {
          id: product._id,
          name: product.name,
          price: product.price,
          availability: product.availability
        }
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while checking availability'
    });
  }
});

// @route   GET /api/products/admin/pending
// @desc    Get pending products for approval
// @access  Private (Admin only)
router.get('/admin/pending', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      isActive: true, 
      isApproved: false 
    })
    .populate('seller', 'name businessInfo.businessName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Product.countDocuments({ 
      isActive: true, 
      isApproved: false 
    });

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching pending products'
    });
  }
});

// @route   POST /api/products/:id/approve
// @desc    Approve/reject product
// @access  Private (Admin only)
router.post('/:id/approve', [
  protect,
  authorize('admin'),
  body('approved').isBoolean().withMessage('Approved status is required'),
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    product.isApproved = req.body.approved;
    if (!req.body.approved && req.body.reason) {
      // You might want to store rejection reason in a separate field
      product.rejectionReason = req.body.reason;
    }

    await product.save();

    res.json({
      status: 'success',
      message: `Product ${req.body.approved ? 'approved' : 'rejected'} successfully`,
      data: { product }
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating product approval'
    });
  }
});

module.exports = router;
