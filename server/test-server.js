const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test server is running',
    grokKey: process.env.GROK_API_KEY ? 'Present' : 'Missing',
    keyLength: process.env.GROK_API_KEY ? process.env.GROK_API_KEY.length : 0
  });
});

// Chat route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};
  
  if (!message) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Message is required' 
    });
  }

  
  

  // Simulate a response for testing
  const responses = [
    "Welcome to Jharkhand! Here are some popular destinations: Ranchi, Jamshedpur, Dhanbad, and Deoghar.",
    "The best time to visit Jharkhand is during October to March when the weather is pleasant.",
    "Jharkhand is famous for its tribal handicrafts including Dokra metal work, Sohrai paintings, and bamboo crafts.",
    "Local food recommendations include Litti Chokha, Thekua, and traditional tribal cuisine.",
    "Transportation options include trains, buses, and domestic flights to major cities.",
    "Cultural experiences include visiting tribal villages, attending local festivals, and exploring ancient temples."
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({ 
    status: 'success',
    reply: randomResponse,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`GROK_API_KEY: ${process.env.GROK_API_KEY ? 'Present' : 'Missing'}`);
});
