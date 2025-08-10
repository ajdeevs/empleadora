const axios = require('axios');

async function testApiFunding() {
  try {
    console.log('🧪 Testing API Funding Endpoint...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Test data for project 2 (which we know exists and is not disputed)
    const testData = {
      projectId: 2, // Use project 2 which we created
      milestoneId: 0, // First milestone
      clientWalletAddress: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", // Admin wallet
      amount: "0.1" // 0.1 AVAX
    };
    
    console.log('📋 Test Data:');
    console.log('- Project ID:', testData.projectId);
    console.log('- Milestone ID:', testData.milestoneId);
    console.log('- Client Wallet:', testData.clientWalletAddress);
    console.log('- Amount:', testData.amount, 'AVAX');
    
    console.log('\n🚀 Making API call...');
    
    const response = await axios.post(`${baseURL}/funding/fund-milestone`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('Transaction Hash:', response.data.transactionHash);
    console.log('Gas Used:', response.data.gasUsed);
    
  } catch (error) {
    console.error('❌ API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data.error);
      console.error('Details:', error.response.data.details);
    } else {
      console.error('Network Error:', error.message);
    }
  }
}

testApiFunding();
