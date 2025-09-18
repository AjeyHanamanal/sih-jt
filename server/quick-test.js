const axios = require('axios');

async function test() {
  try {
    console.log('Testing with new API key...');
    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'Top tribal handicrafts'
    });
    
    console.log('SUCCESS!');
    console.log('Reply:', response.data.reply);
  } catch (error) {
    console.log('ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

test();
