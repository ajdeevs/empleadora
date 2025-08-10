const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testData = {
  project: {
    onchain_pid: 1,
    client_wallet: "0x1234567890123456789012345678901234567890",
    freelancer_wallet: "0x0987654321098765432109876543210987654321",
    amounts_wei: ["1000000000000000000", "2000000000000000000"] // 1 ETH, 2 ETH in wei
  },
  milestone: {
    file: "test-file-path.txt" // For testing file upload
  },
  dispute: {
    pid: 1
  },
  refund: {
    pid: 1,
    mid: 0
  }
};

async function testEndpoints() {
  console.log('🚀 Testing API Endpoints...\n');

  try {
    // Test 1: Create Project
    console.log('📝 Testing POST /projects');
    try {
      const projectResponse = await axios.post(`${BASE_URL}/projects`, testData.project);
      console.log('✅ Project created successfully');
      console.log('Response:', JSON.stringify(projectResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ Project creation failed (expected - needs database)');
      console.log('Error:', error.response?.data || error.message);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Admin Dispute
    console.log('⚖️ Testing POST /admin/dispute');
    try {
      const disputeResponse = await axios.post(`${BASE_URL}/admin/dispute`, testData.dispute);
      console.log('✅ Dispute raised successfully');
      console.log('Response:', JSON.stringify(disputeResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ Dispute failed (expected - requires blockchain connection)');
      console.log('Error:', error.response?.data || error.message);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Admin Refund
    console.log('� Testing POST /admin/refund');
    try {
      const refundResponse = await axios.post(`${BASE_URL}/admin/refund`, testData.refund);
      console.log('✅ Refund successful');
      console.log('Response:', JSON.stringify(refundResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ Refund failed');
      console.log('Error:', error.response?.data || error.message);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Deliver Milestone
    console.log('� Testing POST /milestones/1/deliver');
    try {
      const milestoneResponse = await axios.post(`${BASE_URL}/milestones/1/deliver`, testData.milestone);
      console.log('✅ Milestone delivery successful');
      console.log('Response:', JSON.stringify(milestoneResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ Milestone delivery failed (expected - file upload needs proper setup)');
      console.log('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testEndpoints();
