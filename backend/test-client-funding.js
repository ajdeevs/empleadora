const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
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

function logStep(message) {
  log(`🔹 ${message}`, colors.cyan);
}

async function testClientFunding() {
  logInfo('💰 Testing Client Funding Flow');
  logInfo('==============================');
  
  const BASE_URL = 'http://localhost:5000';
  
  // Test data for your project (ID: 9, onchain_pid: 123)
  const testData = {
    projectId: 9,
    milestoneId: 0, // First milestone
    clientWalletAddress: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", // Use admin wallet as client for testing
    amount: "0.1" // 0.1 AVAX
  };
  
  try {
    // Step 1: Check milestone status
    logStep('\n1. Checking milestone status...');
    const statusResponse = await axios.get(
      `${BASE_URL}/funding/milestone-status/${testData.projectId}/${testData.milestoneId}`
    );
    
    if (statusResponse.status === 200) {
      logSuccess('Milestone status retrieved');
      console.log('Status:', JSON.stringify(statusResponse.data, null, 2));
    }
    
    // Step 2: Fund milestone
    logStep('\n2. Funding milestone...');
    const fundResponse = await axios.post(
      `${BASE_URL}/funding/fund-milestone`,
      testData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (fundResponse.status === 200) {
      logSuccess('Milestone funded successfully');
      console.log('Response:', JSON.stringify(fundResponse.data, null, 2));
    }
    
    // Step 3: Check status after funding
    logStep('\n3. Checking status after funding...');
    const statusAfterResponse = await axios.get(
      `${BASE_URL}/funding/milestone-status/${testData.projectId}/${testData.milestoneId}`
    );
    
    if (statusAfterResponse.status === 200) {
      logSuccess('Updated status retrieved');
      console.log('Updated Status:', JSON.stringify(statusAfterResponse.data, null, 2));
    }
    
    // Step 4: Approve milestone (release funds to freelancer)
    logStep('\n4. Approving milestone...');
    const approveResponse = await axios.post(
      `${BASE_URL}/funding/approve-milestone`,
      {
        projectId: testData.projectId,
        milestoneId: testData.milestoneId,
        clientWalletAddress: testData.clientWalletAddress
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (approveResponse.status === 200) {
      logSuccess('Milestone approved and funds released');
      console.log('Response:', JSON.stringify(approveResponse.data, null, 2));
    }
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

function printClientFundingGuide() {
  logInfo('\n📋 How Clients Fund Milestones:');
  logInfo('================================');
  
  logStep('Method 1: Through Your API (Recommended)');
  log('   - Client calls your API endpoint');
  log('   - Your backend handles blockchain interaction');
  log('   - Client provides wallet address and amount');
  log('   - API validates and executes transaction');
  
  logStep('Method 2: Direct Blockchain Interaction');
  log('   - Client connects wallet (MetaMask, etc.)');
  log('   - Calls contract.fundMilestone() directly');
  log('   - Sends exact AVAX amount with transaction');
  log('   - Pays gas fees for transaction');
  
  logStep('Method 3: Frontend Integration');
  log('   - Web3 wallet integration in frontend');
  log('   - Client signs transaction in browser');
  log('   - Frontend calls smart contract directly');
  log('   - Real-time transaction status updates');
  
  logStep('API Endpoints Available:');
  log('   POST /funding/fund-milestone - Fund a milestone');
  log('   POST /funding/approve-milestone - Approve milestone');
  log('   GET /funding/milestone-status/:pid/:mid - Check status');
  
  logStep('Required Parameters:');
  log('   - projectId: Database project ID');
  log('   - milestoneId: Milestone index (0, 1, 2...)');
  log('   - clientWalletAddress: Client\'s wallet address');
  log('   - amount: Exact AVAX amount in ETH units');
  
  logStep('Example cURL Commands:');
  log('   # Fund milestone');
  log('   curl -X POST http://localhost:5000/funding/fund-milestone \\');
  log('     -H "Content-Type: application/json" \\');
  log('     -d \'{"projectId": 9, "milestoneId": 0, "clientWalletAddress": "0x...", "amount": "0.1"}\'');
  log('');
  log('   # Approve milestone');
  log('   curl -X POST http://localhost:5000/funding/approve-milestone \\');
  log('     -H "Content-Type: application/json" \\');
  log('     -d \'{"projectId": 9, "milestoneId": 0, "clientWalletAddress": "0x..."}\'');
}

async function runClientFundingTest() {
  try {
    await testClientFunding();
    printClientFundingGuide();
  } catch (error) {
    logError(`Client funding test failed: ${error.message}`);
  }
}

if (require.main === module) {
  runClientFundingTest()
    .then(() => {
      logInfo('Client funding test completed');
    })
    .catch((error) => {
      logError(`Client funding test failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testClientFunding, runClientFundingTest };
