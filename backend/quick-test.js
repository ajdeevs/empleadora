require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function quickTest() {
  console.log('🚀 Quick Backend Test');
  console.log('=====================');
  
  try {
    // Test 1: Health Check
    console.log('\n1. Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health Check:', health.data);
    
    // Test 2: Admin Status
    console.log('\n2. Testing Admin Status...');
    const adminStatus = await axios.get(`${BASE_URL}/admin/status`);
    console.log('✅ Admin Status:', adminStatus.data);
    
    // Test 3: Create Project
    console.log('\n3. Testing Project Creation...');
    const projectData = {
      onchain_pid: 999,
      client_wallet: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604",
      freelancer_wallet: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604",
      amounts_wei: ["0.1", "0.2"]
    };
    const project = await axios.post(`${BASE_URL}/projects`, projectData);
    console.log('✅ Project Created:', project.data.id);
    
    // Test 4: Get Milestones
    console.log('\n4. Testing Get Milestones...');
    const milestones = await axios.get(`${BASE_URL}/funding/project-milestones/${project.data.id}`);
    console.log('✅ Milestones Retrieved:', milestones.data.milestones.length, 'milestones');
    
    // Test 5: Get Milestone Status
    console.log('\n5. Testing Milestone Status...');
    const status = await axios.get(`${BASE_URL}/funding/milestone-status/${project.data.id}/0`);
    console.log('✅ Milestone Status:', status.data);
    
    console.log('\n🎉 All Critical Endpoints Working!');
    console.log('✅ Ready for frontend development');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Error Response:', error.response.data);
    }
  }
}

quickTest();

