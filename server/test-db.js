const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand-tourism', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic count
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    // Test active users
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log('Active users:', activeUsers);
    
    // Test sellers
    const totalSellers = await User.countDocuments({ role: 'seller' });
    console.log('Total sellers:', totalSellers);
    
    // Test pending sellers
    const pendingSellers = await User.countDocuments({ 
      role: 'seller', 
      'businessInfo.isApproved': false 
    });
    console.log('Pending sellers:', pendingSellers);
    
    // Test approved sellers
    const approvedSellers = await User.countDocuments({ 
      role: 'seller', 
      'businessInfo.isApproved': true 
    });
    console.log('Approved sellers:', approvedSellers);
    
    console.log('Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database test error:', error);
    process.exit(1);
  }
}

testDatabase();
