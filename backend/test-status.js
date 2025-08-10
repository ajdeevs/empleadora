const axios = require('axios');

async function testStatus() {
  try {
    console.log('🔍 Testing contract status...');
    const response = await axios.get('http://localhost:5000/admin/status');
    console.log('✅ Status check successful:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Status check failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

testStatus();
