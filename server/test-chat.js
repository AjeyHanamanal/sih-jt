const axios = require('axios');

async function testChat() {
  try {
    console.log('Testing chat endpoint...');
    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Best time to visit Ranchi?'
    });
    
    console.log('SUCCESS:');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.log('ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data || error.message);
  }
}

testChat();
