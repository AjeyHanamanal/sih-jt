const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand-tourism', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedUsers() {
  try {
    console.log('Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create some test users
    const users = [
      {
        name: 'John Tourist',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'tourist',
        isActive: true,
        isVerified: true
      },
      {
        name: 'Jane Seller',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'seller',
        isActive: true,
        isVerified: true,
        businessInfo: {
          businessName: 'Jane\'s Crafts',
          isApproved: true,
          approvedAt: new Date()
        }
      },
      {
        name: 'Bob Pending',
        email: 'bob@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'seller',
        isActive: true,
        isVerified: true,
        businessInfo: {
          businessName: 'Bob\'s Shop',
          isApproved: false
        }
      },
      {
        name: 'Alice Tourist',
        email: 'alice@example.com',
        password: 'password123',
        phone: '9876543213',
        role: 'tourist',
        isActive: false,
        isVerified: true
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    
    // Test analytics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const pendingSellers = await User.countDocuments({ 
      role: 'seller', 
      'businessInfo.isApproved': false 
    });
    const approvedSellers = await User.countDocuments({ 
      role: 'seller', 
      'businessInfo.isApproved': true 
    });
    
    console.log('Analytics:');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Total Sellers: ${totalSellers}`);
    console.log(`Pending Sellers: ${pendingSellers}`);
    console.log(`Approved Sellers: ${approvedSellers}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
