const { ethers } = require('ethers');
require('dotenv').config();

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

async function testFundTransfer() {
  logInfo('💰 Testing Fund Transfer Flow');
  logInfo('============================');
  
  try {
    // Setup provider and wallets
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    
    if (!process.env.CONTRACT_ADDRESS) {
      logError('CONTRACT_ADDRESS not set in .env file');
      logInfo('Deploy contract first: npx hardhat run scripts/deploy.js --network avalanche-fuji');
      return;
    }
    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    logSuccess(`Contract address: ${contractAddress}`);
    
    // Load contract ABI
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    
    // Check balances
    logStep('Checking wallet balances...');
    const adminBalance = await provider.getBalance(adminWallet.address);
    logInfo(`Admin wallet balance: ${ethers.formatEther(adminBalance)} AVAX`);
    
    if (adminBalance === 0n) {
      logWarning('Admin wallet has no balance - need to fund it');
      logInfo('Visit: https://faucet.avax.network/');
      return;
    }
    
    // Test 1: Create a project
    logStep('\n1. Creating a test project...');
    const freelancerAddress = "0x1234567890123456789012345678901234567890"; // Test address
    const milestoneAmounts = [ethers.parseEther("0.1"), ethers.parseEther("0.2")]; // 0.1 and 0.2 AVAX
    
    try {
      const createTx = await contract.createProject(freelancerAddress, milestoneAmounts);
      await createTx.wait();
      logSuccess('Project created successfully');
      
      // Get the project ID
      const projectId = await contract.nextProjectId() - 1n;
      logInfo(`Project ID: ${projectId}`);
      
      // Test 2: Fund first milestone
      logStep('\n2. Funding first milestone...');
      const fundTx = await contract.fundMilestone(projectId, 0, { 
        value: ethers.parseEther("0.1") 
      });
      await fundTx.wait();
      logSuccess('Milestone funded successfully');
      
      // Test 3: Check milestone status
      logStep('\n3. Checking milestone status...');
      const project = await contract.projects(projectId);
      logInfo(`Project client: ${project.client}`);
      logInfo(`Project freelancer: ${project.freelancer}`);
      logInfo(`Project disputed: ${project.disputed}`);
      
      // Test 4: Approve milestone (release funds to freelancer)
      logStep('\n4. Approving milestone (releasing funds to freelancer)...');
      const approveTx = await contract.approveMilestone(projectId, 0);
      await approveTx.wait();
      logSuccess('Milestone approved - funds released to freelancer');
      
      // Test 5: Check contract balance
      logStep('\n5. Checking contract balance...');
      const contractBalance = await provider.getBalance(contractAddress);
      logInfo(`Contract balance: ${ethers.formatEther(contractBalance)} AVAX`);
      
      // Test 6: Raise dispute
      logStep('\n6. Raising dispute...');
      const disputeTx = await contract.raiseDispute(projectId);
      await disputeTx.wait();
      logSuccess('Dispute raised successfully');
      
      // Test 7: Fund second milestone for refund test
      logStep('\n7. Funding second milestone for refund test...');
      const fundTx2 = await contract.fundMilestone(projectId, 1, { 
        value: ethers.parseEther("0.2") 
      });
      await fundTx2.wait();
      logSuccess('Second milestone funded');
      
      // Test 8: Process refund
      logStep('\n8. Processing refund...');
      const refundTx = await contract.refundMilestone(projectId, 1);
      await refundTx.wait();
      logSuccess('Refund processed - funds returned to client');
      
      // Final balance check
      logStep('\n9. Final balance check...');
      const finalContractBalance = await provider.getBalance(contractAddress);
      logInfo(`Final contract balance: ${ethers.formatEther(finalContractBalance)} AVAX`);
      
      logSuccess('\n🎉 Fund transfer testing completed successfully!');
      
    } catch (error) {
      logError(`Transaction failed: ${error.message}`);
      if (error.data) {
        logError(`Error data: ${error.data}`);
      }
    }
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

function printFundTransferExplanation() {
  logInfo('\n📋 Fund Transfer Flow Explanation:');
  logInfo('==================================');
  
  logStep('1. Client Funding:');
  log('   - Client calls fundMilestone() with AVAX');
  log('   - Funds are transferred from client wallet to smart contract');
  log('   - Contract holds funds in escrow');
  
  logStep('2. Milestone Approval:');
  log('   - Client calls approveMilestone()');
  log('   - Smart contract transfers AVAX to freelancer wallet');
  log('   - Uses .transfer() for secure payment');
  
  logStep('3. Dispute & Refund:');
  log('   - Either party calls raiseDispute()');
  log('   - Admin calls refundMilestone()');
  log('   - Smart contract returns AVAX to client wallet');
  
  logStep('4. Security Features:');
  log('   - Only client can fund milestones');
  log('   - Only client can approve milestones');
  log('   - Only parties can raise disputes');
  log('   - Only admin can process refunds');
  log('   - NonReentrant protection on critical functions');
  
  logStep('5. Gas Costs:');
  log('   - Client pays gas for funding');
  log('   - Client pays gas for approval');
  log('   - Parties pay gas for disputes');
  log('   - Admin pays gas for refunds');
}

async function runFundTransferTest() {
  try {
    await testFundTransfer();
    printFundTransferExplanation();
  } catch (error) {
    logError(`Fund transfer test failed: ${error.message}`);
  }
}

if (require.main === module) {
  runFundTransferTest()
    .then(() => {
      logInfo('Fund transfer test completed');
    })
    .catch((error) => {
      logError(`Fund transfer test failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testFundTransfer, runFundTransferTest };
