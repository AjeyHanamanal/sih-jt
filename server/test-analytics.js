const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand-tourism', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAnalytics() {
  try {
    console.log('Testing analytics logic...');
    
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

    console.log('Analytics results:', {
      totalUsers,
      activeUsers,
      newUsers,
      totalSellers,
      pendingSellers,
      approvedSellers
    });

    const result = {
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
    };

    console.log('Final result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Analytics test error:', error);
    process.exit(1);
  }
}

testAnalytics();
