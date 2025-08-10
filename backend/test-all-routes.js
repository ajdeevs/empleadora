require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function logSuccess(message) {
  log('✅ ' + message, colors.green);
}

function logError(message) {
  log('❌ ' + message, colors.red);
}

function logWarning(message) {
  log('⚠️ ' + message, colors.yellow);
}

function logInfo(message) {
  log('ℹ️ ' + message, colors.blue);
}

function logStep(message) {
  log('🔹 ' + message, colors.cyan);
}

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    logStep(`Testing ${name}...`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logSuccess(`${name} - Status: ${response.status}`);
      return { success: true, data: response.data };
    } else {
      logError(`${name} - Expected ${expectedStatus}, got ${response.status}`);
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    logError(`${name} - ${error.message}`);
    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function testAllRoutes() {
  log('🚀 Testing All Backend Routes', colors.bright);
  log('=============================', colors.bright);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  log('\n📋 1. Testing Health Check');
  const healthResult = await testEndpoint('GET /', 'GET', '/');
  results.tests.push({ name: 'Health Check', result: healthResult });
  if (healthResult.success) results.passed++; else results.failed++;

  // Test 2: Admin Status
  log('\n📋 2. Testing Admin Status');
  const adminStatusResult = await testEndpoint('GET /admin/status', 'GET', '/admin/status');
  results.tests.push({ name: 'Admin Status', result: adminStatusResult });
  if (adminStatusResult.success) results.passed++; else results.failed++;

  // Test 3: Create Project
  log('\n📋 3. Testing Project Creation');
  const projectData = {
    onchain_pid: 999,
    client_wallet: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604",
    freelancer_wallet: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604",
    amounts_wei: ["0.1", "0.2"]
  };
  const createProjectResult = await testEndpoint('POST /projects', 'POST', '/projects', projectData);
  results.tests.push({ name: 'Create Project', result: createProjectResult });
  if (createProjectResult.success) results.passed++; else results.failed++;

  // Get the created project ID
  let projectId = 9; // Default fallback
  if (createProjectResult.success && createProjectResult.data) {
    projectId = createProjectResult.data.id;
  }

  // Test 4: Get Project Milestones
  log('\n📋 4. Testing Get Project Milestones');
  const milestonesResult = await testEndpoint('GET /funding/project-milestones/:projectId', 'GET', `/funding/project-milestones/${projectId}`);
  results.tests.push({ name: 'Get Project Milestones', result: milestonesResult });
  if (milestonesResult.success) results.passed++; else results.failed++;

  // Test 5: Get Milestone Status
  log('\n📋 5. Testing Get Milestone Status');
  const milestoneStatusResult = await testEndpoint('GET /funding/milestone-status/:projectId/:milestoneId', 'GET', `/funding/milestone-status/${projectId}/0`);
  results.tests.push({ name: 'Get Milestone Status', result: milestoneStatusResult });
  if (milestoneStatusResult.success) results.passed++; else results.failed++;

  // Test 6: Fund Milestone (should fail if already funded)
  log('\n📋 6. Testing Fund Milestone');
  const fundData = {
    projectId: projectId,
    milestoneId: 0,
    clientWalletAddress: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604",
    amount: "0.1"
  };
  const fundMilestoneResult = await testEndpoint('POST /funding/fund-milestone', 'POST', '/funding/fund-milestone', fundData);
  results.tests.push({ name: 'Fund Milestone', result: fundMilestoneResult });
  if (fundMilestoneResult.success) results.passed++; else results.failed++;

  // Test 7: Approve Milestone (should fail if not funded)
  log('\n📋 7. Testing Approve Milestone');
  const approveData = {
    projectId: projectId,
    milestoneId: 0,
    clientWalletAddress: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604"
  };
  const approveMilestoneResult = await testEndpoint('POST /funding/approve-milestone', 'POST', '/funding/approve-milestone', approveData);
  results.tests.push({ name: 'Approve Milestone', result: approveMilestoneResult });
  if (approveMilestoneResult.success) results.passed++; else results.failed++;

  // Test 8: Admin Dispute
  log('\n📋 8. Testing Admin Dispute');
  const disputeData = { pid: 1 };
  const disputeResult = await testEndpoint('POST /admin/dispute', 'POST', '/admin/dispute', disputeData);
  results.tests.push({ name: 'Admin Dispute', result: disputeResult });
  if (disputeResult.success) results.passed++; else results.failed++;

  // Test 9: Admin Refund (should fail if not disputed)
  log('\n📋 9. Testing Admin Refund');
  const refundData = { pid: 1, mid: 0 };
  const refundResult = await testEndpoint('POST /admin/refund', 'POST', '/admin/refund', refundData);
  results.tests.push({ name: 'Admin Refund', result: refundResult });
  if (refundResult.success) results.passed++; else results.failed++;

  // Test 10: Upload Milestone Deliverable
  log('\n📋 10. Testing Upload Milestone Deliverable');
  const deliverableData = { file: "test-file.txt" };
  const deliverableResult = await testEndpoint('POST /milestones/:id/deliver', 'POST', '/milestones/1/deliver', deliverableData);
  results.tests.push({ name: 'Upload Deliverable', result: deliverableResult });
  if (deliverableResult.success) results.passed++; else results.failed++;

  // Test 11: Invalid Endpoint (should fail)
  log('\n📋 11. Testing Invalid Endpoint');
  const invalidResult = await testEndpoint('GET /invalid-endpoint', 'GET', '/invalid-endpoint', null, 404);
  results.tests.push({ name: 'Invalid Endpoint', result: invalidResult });
  if (invalidResult.success) results.passed++; else results.failed++;

  // Print Results
  log('\n📊 Test Results Summary', colors.bright);
  log('======================', colors.bright);
  log(`✅ Passed: ${results.passed}`, colors.green);
  log(`❌ Failed: ${results.failed}`, colors.red);
  log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`, colors.cyan);

  log('\n📋 Detailed Results:', colors.bright);
  results.tests.forEach((test, index) => {
    const status = test.result.success ? '✅' : '❌';
    const color = test.result.success ? colors.green : colors.red;
    log(`${index + 1}. ${status} ${test.name}`, color);
  });

  // Check for critical failures
  const criticalEndpoints = ['Health Check', 'Admin Status', 'Create Project'];
  const criticalFailures = results.tests.filter(test => 
    criticalEndpoints.includes(test.name) && !test.result.success
  );

  if (criticalFailures.length > 0) {
    log('\n🚨 Critical Failures Detected:', colors.red);
    criticalFailures.forEach(failure => {
      log(`- ${failure.name}: ${failure.result.error}`, colors.red);
    });
    log('\n⚠️ Please fix critical failures before proceeding to frontend development.', colors.yellow);
  } else {
    log('\n🎉 All critical endpoints are working! Ready for frontend development.', colors.green);
  }

  return results;
}

// Run the tests
testAllRoutes().catch(console.error);

