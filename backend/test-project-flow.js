const axios = require('axios');

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

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    logStep(`Testing ${name}...`);
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logSuccess(`${name} - Status: ${response.status}`);
      if (response.data) {
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
      return { success: true, data: response.data };
    } else {
      logError(`${name} - Expected ${expectedStatus}, got ${response.status}`);
      return { success: false, error: `Expected ${expectedStatus}, got ${response.status}` };
    }
  } catch (error) {
    logError(`${name} - Error: ${error.message}`);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function testProjectFlow() {
  logInfo('🚀 Testing Payment Flow for Project ID: 9 (onchain_pid: 123)');
  logInfo('========================================================');
  
  const BASE_URL = 'http://localhost:5000';
  const PROJECT_ID = 9;
  const ONCHAIN_PID = 123;
  
  // Test 1: Check admin status
  logInfo('\n📊 Step 1: Checking Admin Status');
  await testEndpoint(
    'Admin Status',
    'GET',
    `${BASE_URL}/admin/status`
  );
  
  // Test 2: Upload milestone deliverable
  logInfo('\n📤 Step 2: Uploading Milestone Deliverable');
  await testEndpoint(
    'Milestone Delivery',
    'POST',
    `${BASE_URL}/milestones/17/deliver`,
    {
      file: 'test-deliverable.txt'
    }
  );
  
  // Test 3: Raise dispute
  logInfo('\n⚖️  Step 3: Raising Dispute');
  await testEndpoint(
    'Raise Dispute',
    'POST',
    `${BASE_URL}/admin/dispute`,
    {
      pid: ONCHAIN_PID
    }
  );
  
  // Test 4: Process refund
  logInfo('\n💰 Step 4: Processing Refund');
  await testEndpoint(
    'Process Refund',
    'POST',
    `${BASE_URL}/admin/refund`,
    {
      pid: ONCHAIN_PID,
      mid: 0
    }
  );
  
  // Test 5: Check project status
  logInfo('\n📋 Step 5: Checking Project Status');
  await testEndpoint(
    'Project Status',
    'GET',
    `${BASE_URL}/projects/${PROJECT_ID}`
  );
}

async function testBlockchainInteraction() {
  logInfo('\n🔗 Testing Blockchain Interaction');
  logInfo('================================');
  
  // Test contract deployment status
  logStep('Checking if contract is deployed...');
  
  try {
    const { ethers } = require('ethers');
    require('dotenv').config();
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    
    if (!process.env.CONTRACT_ADDRESS) {
      logWarning('CONTRACT_ADDRESS not set in .env file');
      logInfo('You need to deploy the contract first');
      return;
    }
    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    logSuccess(`Contract address: ${contractAddress}`);
    
    // Check contract code
    const code = await provider.getCode(contractAddress);
    if (code !== '0x') {
      logSuccess('Contract is deployed and has code');
    } else {
      logError('Contract address has no code (not deployed)');
    }
    
    // Check admin wallet balance
    const balance = await provider.getBalance(adminWallet.address);
    logInfo(`Admin wallet balance: ${ethers.formatEther(balance)} AVAX`);
    
    if (balance === 0n) {
      logWarning('Admin wallet has no balance - need to fund it');
      logInfo('Visit: https://faucet.avax.network/');
    }
    
  } catch (error) {
    logError(`Blockchain test failed: ${error.message}`);
  }
}

function printNextSteps() {
  logInfo('\n📋 Next Steps to Complete Payment Flow:');
  logInfo('========================================');
  
  logStep('1. Deploy Smart Contract:');
  log('   npx hardhat run scripts/deploy.js --network avalanche-fuji');
  
  logStep('2. Fund Admin Wallet:');
  log('   Visit: https://faucet.avax.network/');
  log('   Send testnet AVAX to your admin wallet address');
  
  logStep('3. Update .env file:');
  log('   Add CONTRACT_ADDRESS=0x... (from deployment)');
  
  logStep('4. Test Blockchain Functions:');
  log('   - Fund milestone on blockchain');
  log('   - Approve milestone release');
  log('   - Raise dispute on blockchain');
  log('   - Process refund on blockchain');
  
  logStep('5. Test API Endpoints:');
  log('   - /admin/status - Check contract status');
  log('   - /admin/dispute - Raise dispute');
  log('   - /admin/refund - Process refund');
  log('   - /milestones/:id/deliver - Upload deliverables');
  
  logStep('6. Monitor Database:');
  log('   - Check project disputed status');
  log('   - Check milestone funded/released status');
  log('   - Verify deliverable uploads');
}

async function runAllTests() {
  try {
    await testProjectFlow();
    await testBlockchainInteraction();
    printNextSteps();
    
    logSuccess('\n🎉 Payment flow testing completed!');
    logInfo('Check the results above and follow the next steps.');
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

if (require.main === module) {
  runAllTests()
    .then(() => {
      logInfo('All tests completed');
    })
    .catch((error) => {
      logError(`Test suite failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testProjectFlow, testBlockchainInteraction, runAllTests };
