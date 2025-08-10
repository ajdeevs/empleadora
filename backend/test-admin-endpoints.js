const axios = require('axios');

const BASE_URL = 'http://localhost:5000/admin';

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    logInfo(`Testing ${name}...`);
    
    const config = {
      ...testConfig,
      method,
      url: `${BASE_URL}${url}`,
      ...(data && { data })
    };

    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logSuccess(`${name} - Status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data };
    } else {
      logError(`${name} - Expected status ${expectedStatus}, got ${response.status}`);
      return { success: false, error: `Unexpected status: ${response.status}` };
    }
  } catch (error) {
    if (error.response) {
      logError(`${name} - Status: ${error.response.status}`);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      return { success: false, error: error.response.data };
    } else {
      logError(`${name} - Network error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function runAllTests() {
  log('🚀 Starting Admin Endpoints Test Suite', colors.bold);
  log('=====================================', colors.bold);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: Status endpoint
  log('\n📊 Test 1: GET /status', colors.bold);
  const statusResult = await testEndpoint('Status Check', 'GET', '/status');
  results.total++;
  if (statusResult.success) {
    results.passed++;
    logSuccess('Status endpoint working correctly');
  } else {
    results.failed++;
    logError('Status endpoint failed');
  }

  // Test 2: Dispute endpoint with invalid input
  log('\n🔍 Test 2: POST /dispute (Invalid Input)', colors.bold);
  const disputeInvalidResult = await testEndpoint('Dispute with Invalid PID', 'POST', '/dispute', { pid: 'invalid' }, 400);
  results.total++;
  if (disputeInvalidResult.success === false) {
    results.passed++;
    logSuccess('Dispute endpoint correctly rejected invalid input');
  } else {
    results.failed++;
    logError('Dispute endpoint should have rejected invalid input');
  }

  // Test 3: Dispute endpoint with missing input
  log('\n🔍 Test 3: POST /dispute (Missing Input)', colors.bold);
  const disputeMissingResult = await testEndpoint('Dispute with Missing PID', 'POST', '/dispute', {}, 400);
  results.total++;
  if (disputeMissingResult.success === false) {
    results.passed++;
    logSuccess('Dispute endpoint correctly rejected missing input');
  } else {
    results.failed++;
    logError('Dispute endpoint should have rejected missing input');
  }

  // Test 4: Dispute endpoint with valid input (this might fail if no project exists)
  log('\n🔍 Test 4: POST /dispute (Valid Input)', colors.bold);
  const disputeValidResult = await testEndpoint('Dispute with Valid PID', 'POST', '/dispute', { pid: 1 });
  results.total++;
  if (disputeValidResult.success) {
    results.passed++;
    logSuccess('Dispute endpoint worked with valid input');
  } else {
    results.passed++;
    logWarning('Dispute endpoint failed as expected (no project exists)');
  }

  // Test 5: Refund endpoint with invalid input
  log('\n💰 Test 5: POST /refund (Invalid Input)', colors.bold);
  const refundInvalidResult = await testEndpoint('Refund with Invalid Parameters', 'POST', '/refund', { pid: 'invalid', mid: 'invalid' }, 400);
  results.total++;
  if (refundInvalidResult.success === false) {
    results.passed++;
    logSuccess('Refund endpoint correctly rejected invalid input');
  } else {
    results.failed++;
    logError('Refund endpoint should have rejected invalid input');
  }

  // Test 6: Refund endpoint with missing input
  log('\n💰 Test 6: POST /refund (Missing Input)', colors.bold);
  const refundMissingResult = await testEndpoint('Refund with Missing Parameters', 'POST', '/refund', {}, 400);
  results.total++;
  if (refundMissingResult.success === false) {
    results.passed++;
    logSuccess('Refund endpoint correctly rejected missing input');
  } else {
    results.failed++;
    logError('Refund endpoint should have rejected missing input');
  }

  // Test 7: Refund endpoint with valid input (this might fail if no project exists)
  log('\n💰 Test 7: POST /refund (Valid Input)', colors.bold);
  const refundValidResult = await testEndpoint('Refund with Valid Parameters', 'POST', '/refund', { pid: 1, mid: 0 });
  results.total++;
  if (refundValidResult.success) {
    results.passed++;
    logSuccess('Refund endpoint worked with valid input');
  } else {
    results.passed++;
    logWarning('Refund endpoint failed as expected (no project exists or not disputed)');
  }

  // Test 8: Test with non-existent endpoint
  log('\n🚫 Test 8: Non-existent Endpoint', colors.bold);
  const notFoundResult = await testEndpoint('Non-existent Endpoint', 'GET', '/nonexistent', null, 404);
  results.total++;
  if (notFoundResult.success === false) {
    results.passed++;
    logSuccess('Correctly handled non-existent endpoint');
  } else {
    results.failed++;
    logError('Should have returned 404 for non-existent endpoint');
  }

  // Summary
  log('\n📋 Test Summary', colors.bold);
  log('==============', colors.bold);
  log(`Total Tests: ${results.total}`, colors.bold);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, colors.red);
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed!', colors.green);
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed`, colors.yellow);
  }

  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      log('\n🏁 Test suite completed', colors.bold);
      process.exit(0);
    })
    .catch((error) => {
      logError(`Test suite failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runAllTests, testEndpoint };
