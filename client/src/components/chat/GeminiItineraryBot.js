import React, { useState, useRef, useEffect } from 'react';

const GeminiItineraryBot = ({ botName = 'Itinerary Planner' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I'm ${botName}. I will plan your trip. First, which place should I plan for? (e.g., Ranchi, Netarhat, Deoghar)`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState({
    destination: '',
    duration: '',
    interests: '',
    budget: '',
    travelStyle: ''
  });
  const [currentStep, setCurrentStep] = useState('destination');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseDaysFromText = (text = '') => {
    const m = String(text).match(/(\d{1,2})\s*(day|days|d)\b/i);
    if (m) return parseInt(m[1], 10);
    const n = parseInt(text, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const parseDestinationFromText = (text = '') => {
    const trimmed = String(text).trim();
    if (/^\d+\s*(day|days|d)?$/i.test(trimmed)) return undefined;
    return trimmed || undefined;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let response = '';
      let nextStep = currentStep;

      if (currentStep === 'destination') {
        const destination = parseDestinationFromText(userInput);
        if (destination) {
          setTripData(prev => ({ ...prev, destination }));
          response = `Great! I will plan a trip to ${destination}. How many days would you like to stay? (e.g., 2 days, 3 days)`;
          nextStep = 'duration';
        } else {
          response = 'Please tell me which destination you would like to visit. (e.g., Ranchi, Netarhat, Deoghar)';
        }
      } else if (currentStep === 'duration') {
        const days = parseDaysFromText(userInput);
        if (days && days >= 1 && days <= 30) {
          setTripData(prev => ({ ...prev, duration: days }));
          response = `Perfect! ${days} days in ${tripData.destination}. What are your main interests? (e.g., culture, nature, adventure, food, temples)`;
          nextStep = 'interests';
        } else {
          response = 'Please tell me how many days you want to stay (1-30 days).';
        }
      } else if (currentStep === 'interests') {
        setTripData(prev => ({ ...prev, interests: userInput }));
        response = `Nice interests! What's your budget range? (e.g., ₹5000, ₹10000, ₹20000)`;
        nextStep = 'budget';
      } else if (currentStep === 'budget') {
        setTripData(prev => ({ ...prev, budget: userInput }));
        response = `Got it! What's your travel style? (budget, luxury, adventure, cultural, eco-friendly)`;
        nextStep = 'travelStyle';
      } else if (currentStep === 'travelStyle') {
        setTripData(prev => ({ ...prev, travelStyle: userInput }));
        
        // Generate itinerary using Gemini API
        const itineraryData = {
          destination: tripData.destination,
          duration: parseInt(tripData.duration),
          interests: [tripData.interests], // Convert to array as expected by API
          budget: parseInt(tripData.budget) || 0,
          travelStyle: userInput
        };

        console.log('Sending itinerary data:', itineraryData);

        const apiResponse = await fetch('/api/ai/itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8tdG91cmlzdCIsImlhdCI6MTc1ODM4ODExMX0.tJP0ZzB9A7-9RXnbvC7WYJHqelgnd4tSARuBOTCr97M'
          },
          body: JSON.stringify(itineraryData),
        });

        const data = await apiResponse.json();
        
        if (apiResponse.ok && data.status === 'success') {
          response = data.data.itinerary.content;
        } else {
          console.error('Itinerary API Error:', data);
          response = `I apologize, but I had trouble generating your itinerary. Error: ${data.message || 'Unknown error'}. Please try again or contact our support team.`;
        }
        
        // Reset for new trip
        setTripData({
          destination: '',
          duration: '',
          interests: '',
          budget: '',
          travelStyle: ''
        });
        nextStep = 'destination';
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setCurrentStep(nextStep);

    } catch (error) {
      console.error('Itinerary error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble generating your itinerary. Please try again or contact our support team.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startNewTrip = () => {
    setMessages([
      {
        id: 1,
        text: `Hi! I'm ${botName}. I will plan your trip. First, which place should I plan for? (e.g., Ranchi, Netarhat, Deoghar)`,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setTripData({
      destination: '',
      duration: '',
      interests: '',
      budget: '',
      travelStyle: ''
    });
    setCurrentStep('destination');
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 shadow-2xl bg-white rounded-t-xl">
          {/* Header */}
          <div 
            className="rounded-t-xl px-4 py-3 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
          >
            <div className="font-semibold">{botName}</div>
            <button 
              aria-label="Close chatbot" 
              className="text-white/90 hover:text-white text-xl leading-none" 
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Chat History Button */}
          <div className="px-4 py-2 border-b">
            <button 
              onClick={startNewTrip}
              className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start New Trip
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Planning your trip...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          aria-label="Open itinerary planner"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-green-600 text-white shadow-lg hover:scale-105 transition-transform duration-150 flex items-center justify-center gentle-float"
        >
          <span role="img" aria-label="calendar">📅</span>
        </button>
      )}
    </>
  );
};

export default GeminiItineraryBot;
