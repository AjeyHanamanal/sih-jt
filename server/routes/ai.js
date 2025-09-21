const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Ensure env is loaded even if this router is required before index initializes it
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });



const router = express.Router();

// Development-only status endpoint to verify key presence (no secrets leaked)
if (process.env.NODE_ENV !== 'production') {
  router.get('/status', (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    res.json({
      envLoaded: true,
      hasKey: Boolean(geminiKey),
      keyLength: geminiKey.length,
      provider: 'gemini',
      cwd: process.cwd(),
      dirname: __dirname
    });
  });
}

// @route   POST /api/ai/itinerary
// @desc    Generate AI-powered itinerary
// @access  Private
router.post('/itinerary', [
  protect,
  body('destination').isString().isLength({ min: 2 }).withMessage('Destination is required'),
  body('duration').isInt({ min: 1, max: 30 }).withMessage('Duration must be between 1 and 30 days'),
  body('interests').isArray().withMessage('Interests must be an array'),
  body('budget').optional().isInt({ min: 0 }).withMessage('Budget must be non-negative'),
  body('travelStyle').optional().isIn(['budget', 'luxury', 'adventure', 'cultural', 'eco-friendly']).withMessage('Invalid travel style')
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

    const { destination, duration, interests, budget, travelStyle } = req.body;

    // Create prompt for AI
    const prompt = `Create a detailed ${duration}-day itinerary for ${destination} in Jharkhand, India. 
    Interests: ${interests.join(', ')}
    Travel style: ${travelStyle || 'cultural'}
    Budget: ${budget ? `₹${budget}` : 'flexible'}
    
    Please format the response as a human-readable travel guide with the following structure:
    
    **${duration}-Day Itinerary for ${destination}, Jharkhand**
    
    **Day 1: [Theme/Title]**
    - Morning (8:00 AM): [Activity] at [Location]
    - Afternoon (1:00 PM): [Activity] at [Location]
    - Evening (6:00 PM): [Activity] at [Location]
    
    **Day 2: [Theme/Title]**
    [Similar format for each day]
    
    **Local Food Recommendations:**
    - [Food item 1]: [Description]
    - [Food item 2]: [Description]
    
    **Transportation:**
    - [Transport option 1]: [Description]
    - [Transport option 2]: [Description]
    
    **Budget Breakdown:**
    - Accommodation: ₹[amount] per night
    - Food: ₹[amount] per day
    - Transportation: ₹[amount] per day
    
    **Travel Tips:**
    - [Tip 1]
    - [Tip 2]
    - [Tip 3]
    
    Make it engaging, informative, and easy to read. Use markdown formatting for better readability.`;

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // No API key available, use fallback
      console.log('No API key configured, using fallback response');
      
      // Generate dynamic itinerary based on duration
      let itineraryContent = `**${duration}-Day Itinerary for ${destination}, Jharkhand**\n\n`;
      
      // Generate day-by-day content based on actual duration
      for (let day = 1; day <= duration; day++) {
        let dayTitle = '';
        let dayActivities = '';
        
        if (day === 1) {
          dayTitle = '**Day 1: Arrival & Local Exploration**';
          dayActivities = `- Morning: Arrive and check into accommodation
- Afternoon: Visit local markets and cultural sites
- Evening: Try local cuisine and explore the area`;
        } else if (day === 2) {
          dayTitle = '**Day 2: Nature & Adventure**';
          dayActivities = `- Morning: Visit nearby waterfalls or national parks
- Afternoon: Nature walk and photography
- Evening: Relax and enjoy local entertainment`;
        } else if (day === 3) {
          dayTitle = '**Day 3: Cultural Heritage**';
          dayActivities = `- Morning: Visit historical temples and monuments
- Afternoon: Learn about local tribal culture
- Evening: Attend cultural performances`;
        } else {
          dayTitle = `**Day ${day}: Extended Exploration**`;
          dayActivities = `- Morning: Visit additional local attractions
- Afternoon: Explore more cultural sites or nature spots
- Evening: Enjoy local entertainment and dining`;
        }
        
        itineraryContent += `${dayTitle}\n${dayActivities}\n\n`;
      }
      
      // Add common sections
      itineraryContent += `**Travel Tips:**
- Carry valid ID and keep emergency contacts handy
- Respect local customs and traditions
- Try local Jharkhand cuisine
- Book accommodations in advance
- Carry cash as digital payments may not be available everywhere

**Budget Estimate:**
- Accommodation: ₹800-2000 per night
- Food: ₹300-800 per day
- Transportation: ₹500-1500 per day
- Activities: ₹200-1000 per day

**Must-Visit Places:**
- Local temples and cultural sites
- Natural attractions and waterfalls
- Traditional markets
- Local restaurants and food stalls

**Interests Covered:** ${interests.join(', ')}
**Travel Style:** ${travelStyle}
**Duration:** ${duration} days`;

      const fallbackItinerary = {
        destination,
        duration,
        content: itineraryContent,
        generatedAt: new Date().toISOString()
      };

      return res.json({
        status: 'success',
        data: {
          itinerary: fallbackItinerary
        }
      });
    }

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create the full prompt with system context
      const fullPrompt = `You are a travel expert specializing in Jharkhand tourism. Provide detailed, practical itineraries with local insights.

${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const itinerary = result.response.text();

      res.json({
        status: 'success',
        data: {
          itinerary: {
            destination,
            duration,
            content: itinerary,
            generatedAt: new Date().toISOString()
          }
        }
      });
    } catch (aiError) {
      console.error('AI API error:', aiError);
      
      // Return error response for API failures
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate itinerary with AI service'
      });
    }
  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating itinerary'
    });
  }
});

// @route   POST /api/ai/chatbot
// @desc    AI chatbot for tourism queries
// @access  Public
router.post('/chatbot', [
  body('message').isString().isLength({ min: 1, max: 500 }).withMessage('Message is required'),
  body('context').optional().isString().withMessage('Context must be a string')
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

    const { message, context } = req.body;

    const systemPrompt = `You are a helpful tourism assistant for Jharkhand, India. 
    You help tourists with information about:
    - Tourist destinations and attractions
    - Local culture and traditions
    - Transportation and accommodation
    - Food and dining recommendations
    - Travel tips and safety information
    - Booking assistance
    
    Keep responses concise, helpful, and focused on Jharkhand tourism.
    If you don't know something specific, suggest contacting local tourism authorities.`;

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // No API key available, use fallback
      console.log('No API key configured for chatbot, using fallback response');
      
      res.json({
        status: 'success',
        data: {
          response: 'I\'m a tourism assistant for Jharkhand! I can help you with information about destinations, culture, food, and travel tips. However, I\'m currently in offline mode. Please try asking about popular places like Ranchi, Deoghar, or Netarhat, or contact our support team for detailed assistance.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create the full prompt with system context
      const fullPrompt = `${systemPrompt}

User Question: ${message}`;

      const result = await model.generateContent(fullPrompt);
      const botResponse = result.response.text();

      res.json({
        status: 'success',
        data: {
          response: botResponse,
          timestamp: new Date().toISOString()
        }
      });
    } catch (aiError) {
      console.error('AI API error:', aiError);
      
      // Fallback response
      res.json({
        status: 'success',
        data: {
          response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact our support team for assistance with your Jharkhand tourism queries.',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while processing chatbot request'
    });
  }
});

// @route   POST /api/ai/sentiment
// @desc    Analyze sentiment of text
// @access  Private
router.post('/sentiment', [
  protect,
  body('text').isString().isLength({ min: 10, max: 1000 }).withMessage('Text must be between 10 and 1000 characters')
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

    const { text } = req.body;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: process.env.OPENAI_MODEL || DEFAULTS.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the given text and respond with a JSON object containing: {"sentiment": "positive/negative/neutral", "score": -1 to 1, "confidence": 0 to 1}'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const sentimentData = JSON.parse(response.data.choices[0].message.content);

      res.json({
        status: 'success',
        data: sentimentData
      });
    } catch (aiError) {
      console.error('AI API error:', aiError);
      
      // Fallback sentiment analysis (basic keyword-based)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'enjoyed', 'perfect', 'beautiful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'hate', 'worst', 'poor', 'ugly', 'disgusting'];
      
      const lowerText = text.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
      
      let sentiment = 'neutral';
      let score = 0;
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        score = Math.min(positiveCount / 10, 1);
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        score = -Math.min(negativeCount / 10, 1);
      }

      res.json({
        status: 'success',
        data: {
          sentiment,
          score,
          confidence: 0.6
        }
      });
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while analyzing sentiment'
    });
  }
});

module.exports = router;

// ---- Chat with Grok API ----
// POST /api/chat { message }
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Message is required and must be a string' 
      });
    }

    const grokKey = (
      process.env.GROK_API_KEY ||
      process.env.XAI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      ''
    ).trim();
    
    if (!grokKey) {
      console.warn('AI Chat: GROK_API_KEY missing. Available env keys:', Object.keys(process.env).filter(k => /GROK|XAI|OPENAI/.test(k)));
      return res.json({ 
        status: 'error',
        reply: 'Grok API key not configured. Please add GROK_API_KEY in server/.env.' 
      });
    }

    console.log('AI Chat: Using GROK key length:', grokKey.length);

    const baseUrl = process.env.GROK_BASE_URL || DEFAULTS.GROK_BASE_URL;
    const url = `${baseUrl}/chat/completions`;
    
    const payload = {
      model: process.env.GROK_MODEL || DEFAULTS.GROK_MODEL,
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful Jharkhand Tourism assistant. Provide accurate, concise, and engaging information about Jharkhand destinations, culture, food, and travel tips. Keep responses conversational and helpful.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: false
    };

    // Try Authorization header first, then x-api-key as fallback
    const attempts = [
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${grokKey}` } },
      { headers: { 'Content-Type': 'application/json', 'x-api-key': grokKey } }
    ];

    for (let i = 0; i < attempts.length; i++) {
      try {
        const response = await axios.post(url, payload, { ...attempts[i], timeout: 30000 });
        const data = response.data;
        const reply = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        return res.json({ 
          status: 'success',
          reply: reply.trim(),
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Grok chat error (attempt ${i + 1}):`, {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          message: err.message,
          url: url,
          headers: attempts[i].headers
        });
        
        if (i === attempts.length - 1) {
          const status = err?.response?.status;
          const body = err?.response?.data;
          
          return res.status(500).json({ 
            status: 'error',
            error: body?.error?.message || body?.message || 'Error fetching response from Grok API',
            details: process.env.NODE_ENV === 'development' ? {
              status: status,
              statusText: err?.response?.statusText,
              data: body,
              message: err.message
            } : undefined
          });
        }
        // else try next header style
      }
    }
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
