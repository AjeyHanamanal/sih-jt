const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number')
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

    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/users/admin/all
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/admin/all', [protect, authorize('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;

    // Build filter
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/admin/:id
// @desc    Get user by ID (admin only)
// @access  Private (Admin)
router.get('/admin/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/users/admin/:id/status
// @desc    Update user status (admin only)
// @access  Private (Admin)
router.put('/admin/:id/status', [protect, authorize('admin')], async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user status'
    });
  }
});

// @route   PUT /api/users/admin/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin)
router.put('/admin/:id/role', [protect, authorize('admin')], async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user role'
    });
  }
});

// @route   PUT /api/users/admin/:id/approve-seller
// @desc    Approve seller application (admin only)
// @access  Private (Admin)
router.put('/admin/:id/approve-seller', [protect, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a seller'
      });
    }

    // Update business info approval status
    user.businessInfo.isApproved = true;
    user.businessInfo.approvedAt = new Date();
    user.businessInfo.approvedBy = req.user._id;
    await user.save();

    res.json({
      status: 'success',
      message: 'Seller application approved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Approve seller error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while approving seller'
    });
  }
});

// @route   DELETE /api/users/admin/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/admin/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/users/admin/analytics
// @desc    Get user analytics (admin only)
// @access  Private (Admin)
router.get('/admin/analytics', [protect, authorize('admin')], async (req, res) => {
  try {
    console.log('Analytics request received');
    
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsers = await User.countDocuments({ createdAt: { $gte: last30Days } });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const pendingSellers = await User.countDocuments({ 
      role: 'seller', 
      'businessInfo.isApproved': false 
    });
    const approvedSellers = await User.countDocuments({ 
      role: 'seller', 
      'businessInfo.isApproved': true 
    });

    console.log('Analytics data:', {
      totalUsers,
      activeUsers,
      newUsers,
      totalSellers,
      pendingSellers,
      approvedSellers
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsers,
          totalSellers,
          pendingSellers,
          approvedSellers
        },
        userGrowth: [],
        roleDistribution: []
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user analytics'
    });
  }
});

module.exports = router;
