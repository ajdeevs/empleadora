const { ethers } = require('ethers');
require('dotenv').config();

async function setupTestProject() {
  console.log('🔧 Setting up test project on blockchain...');
  
  // Connect to blockchain
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
  
  // Load contract
  const contractABI = require('../artifacts/contracts/Escrow.sol/Escrow.json').abi;
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, adminWallet);
  
  try {
    // Create a test project on blockchain
    // Using admin wallet as both client and freelancer for testing
    const freelancerAddress = "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604"; // Same as admin for testing
    const amounts = [
      ethers.parseEther("0.1"), // 0.1 AVAX for first milestone
      ethers.parseEther("0.1")  // 0.1 AVAX for second milestone
    ];
    
    console.log('📝 Creating project on blockchain...');
    console.log('Client (admin):', adminWallet.address);
    console.log('Freelancer:', freelancerAddress);
    console.log('Amounts:', amounts.map(a => ethers.formatEther(a) + ' AVAX'));
    
    const createTx = await contract.createProject(freelancerAddress, amounts);
    await createTx.wait();
    
    // Get the project ID
    const projectId = await contract.nextProjectId() - 1n;
    
    console.log('✅ Project created successfully!');
    console.log('Project ID (onchain):', projectId.toString());
    console.log('Transaction Hash:', createTx.hash);
    
    // Update your database project to match
    console.log('\n📋 Next Steps:');
    console.log('1. Update your database project (ID: 9) with onchain_pid:', projectId.toString());
    console.log('2. Run: UPDATE projects SET onchain_pid =', projectId.toString(), 'WHERE id = 9;');
    console.log('3. Test the funding API again');
    
    return projectId;
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    throw error;
  }
}

async function fundTestMilestone() {
  console.log('\n💰 Testing milestone funding...');
  
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
  
  const contractABI = require('../artifacts/contracts/Escrow.sol/Escrow.json').abi;
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, adminWallet);
  
  try {
    // Fund milestone 0 with 0.1 AVAX
    const projectId = 0n; // First project created
    const milestoneId = 0;
    const amount = ethers.parseEther("0.1");
    
    console.log('Funding milestone...');
    console.log('Project ID:', projectId.toString());
    console.log('Milestone ID:', milestoneId);
    console.log('Amount:', ethers.formatEther(amount), 'AVAX');
    
    const fundTx = await contract.fundMilestone(projectId, milestoneId, { value: amount });
    await fundTx.wait();
    
    console.log('✅ Milestone funded successfully!');
    console.log('Transaction Hash:', fundTx.hash);
    
  } catch (error) {
    console.error('❌ Error funding milestone:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await setupTestProject();
    await fundTestMilestone();
    console.log('\n🎉 Test project setup completed!');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupTestProject, fundTestMilestone };
