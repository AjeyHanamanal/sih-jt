const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Simple in-memory storage for demo
const users = [
  {
    id: '1',
    name: 'Demo Tourist',
    email: 'tourist@demo.com',
    password: 'password123',
    role: 'tourist',
    isVerified: true
  },
  {
    id: '2',
    name: 'Demo Seller',
    email: 'seller@demo.com',
    password: 'password123',
    role: 'seller',
    isVerified: true
  },
  {
    id: '3',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    isVerified: true
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Jharkhand Tourism Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'demo_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret_key');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// Register endpoint (demo)
app.post('/api/auth/register', (req, res) => {
  res.json({
    status: 'success',
    message: 'Registration successful (demo mode)',
    data: {
      user: {
        id: 'new_user',
        name: req.body.name,
        email: req.body.email,
        role: req.body.role || 'tourist',
        isVerified: true
      },
      token: jwt.sign(
        { id: 'new_user', role: req.body.role || 'tourist', email: req.body.email },
        process.env.JWT_SECRET || 'demo_secret_key',
        { expiresIn: '7d' }
      )
    }
  });
});

// Demo destinations
app.get('/api/destinations', (req, res) => {
  const destinations = [
    {
      _id: '1',
      name: 'Baidyanath Temple',
      shortDescription: 'Famous Hindu temple in Deoghar',
      primaryImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500',
      location: { city: 'Deoghar', state: 'Jharkhand' },
      category: 'religious',
      rating: { average: 4.8, count: 1240 }
    },
    {
      _id: '2',
      name: 'Betla National Park',
      shortDescription: 'Wildlife sanctuary with tigers and elephants',
      primaryImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
      location: { city: 'Palamu', state: 'Jharkhand' },
      category: 'wildlife',
      rating: { average: 4.6, count: 890 }
    }
  ];

  res.json({
    status: 'success',
    data: {
      destinations,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: destinations.length,
        itemsPerPage: 10
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple demo server running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n📋 Demo Accounts:`);
  console.log(`   Tourist: tourist@demo.com / password123`);
  console.log(`   Seller:  seller@demo.com / password123`);
  console.log(`   Admin:   admin@demo.com / password123`);
});

module.exports = app;
