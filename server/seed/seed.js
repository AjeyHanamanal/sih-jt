const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Destination = require('../models/Destination');
const Product = require('../models/Product');
const User = require('../models/User');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand_tourism';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Seeding sample data...');

  // Ensure an admin user
  const adminEmail = 'admin@demo.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'password123',
      phone: '9876543210',
      role: 'admin',
      isVerified: true
    });
    console.log('Admin user created:', adminEmail);
  } else {
    console.log('Admin user exists');
  }

  // Sample destinations
  const sampleDestinations = [
    {
      name: 'Baidyanath Temple',
      shortDescription: 'Famous Hindu temple in Deoghar with rich heritage.',
      description: 'One of the twelve Jyotirlingas, a major pilgrimage site.',
      category: 'religious',
      images: [{ url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', isPrimary: true }],
      location: { address: 'Baidyanath Temple', city: 'Deoghar', state: 'Jharkhand', coordinates: { lat: 24.486, lng: 86.695 } },
      rating: { average: 4.8, count: 1200 },
      isActive: true,
      isFeatured: true
    },
    {
      name: 'Betla National Park',
      shortDescription: 'Wildlife sanctuary with tigers and elephants.',
      description: 'A famous national park in Palamu division of Jharkhand.',
      category: 'wildlife',
      images: [{ url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', isPrimary: true }],
      location: { address: 'Betla', city: 'Palamu', state: 'Jharkhand', coordinates: { lat: 23.866, lng: 84.199 } },
      rating: { average: 4.6, count: 800 },
      isActive: true,
      isFeatured: true
    }
  ];

  const destCount = await Destination.countDocuments();
  if (destCount === 0) {
    await Destination.insertMany(sampleDestinations);
    console.log('Inserted sample destinations');
  } else {
    console.log('Destinations already present');
  }

  // Ensure a demo seller
  const sellerEmail = 'seller@demo.com';
  let seller = await User.findOne({ email: sellerEmail });
  if (!seller) {
    seller = await User.create({
      name: 'Demo Seller',
      email: sellerEmail,
      password: 'password123',
      phone: '9876543211',
      role: 'seller',
      isVerified: true,
      businessInfo: { businessName: 'Jharkhand Crafts', isApproved: true }
    });
    console.log('Seller user created:', sellerEmail);
  }

  // Create sample products mapped to destinations
  const destinations = await Destination.find().limit(2);
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0 && destinations.length) {
    const sampleProducts = [
      {
        name: 'Guided Temple Tour',
        shortDescription: '2-hour guided tour with local insights',
        description: 'Includes temple history, rituals walkthrough, and photography spots.',
        seller: seller._id,
        destination: destinations[0]._id,
        category: 'guide_service',
        price: { amount: 499, currency: 'INR', unit: 'per_person' },
        images: [{ url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', isPrimary: true }],
        isApproved: true
      },
      {
        name: 'Betla Safari Package',
        shortDescription: 'Morning safari with park entry',
        description: 'Explore Betla National Park with an experienced naturalist.',
        seller: seller._id,
        destination: destinations[1]?._id,
        category: 'tour_package',
        price: { amount: 1999, currency: 'INR', unit: 'per_person' },
        images: [{ url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', isPrimary: true }],
        isApproved: true
      }
    ];
    await Product.insertMany(sampleProducts);
    console.log('Inserted sample products');
  }

  await mongoose.disconnect();
  console.log('Seeding complete');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});


