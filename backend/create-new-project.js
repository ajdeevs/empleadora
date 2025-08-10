const { ethers } = require('ethers');
require('dotenv').config();

async function createNewProject() {
  try {
    console.log('🏗️ Creating New Project...\n');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    const contractWithSigner = contract.connect(adminWallet);
    
    console.log('👛 Admin wallet address:', adminWallet.address);
    
    // Create a new project
    const freelancerAddress = adminWallet.address; // Using same address for testing
    const milestoneAmounts = [
      ethers.parseEther("0.1"),  // 0.1 AVAX
      ethers.parseEther("0.2")   // 0.2 AVAX
    ];
    
    console.log('📋 Creating project with:');
    console.log('- Freelancer:', freelancerAddress);
    console.log('- Milestone amounts:', milestoneAmounts.map(amt => ethers.formatEther(amt) + ' AVAX'));
    
    const createTx = await contractWithSigner.createProject(freelancerAddress, milestoneAmounts);
    console.log('Transaction hash:', createTx.hash);
    
    const receipt = await createTx.wait();
    console.log('✅ Project created successfully!');
    console.log('Block number:', receipt.blockNumber);
    
    // Get the new project ID
    const nextProjectId = await contract.nextProjectId();
    const newProjectId = nextProjectId - 1n;
    console.log('New project ID:', newProjectId.toString());
    
    // Check the new project
    console.log('\n📊 New Project Details:');
    const project = await contract.projects(newProjectId);
    console.log('- Client:', project.client);
    console.log('- Freelancer:', project.freelancer);
    console.log('- Disputed:', project.disputed);
    console.log('- Milestones count:', project.milestones.length);
    
    // Fund the first milestone
    console.log('\n💰 Funding first milestone...');
    const milestone = project.milestones[0];
    console.log('Milestone 0 amount:', ethers.formatEther(milestone.amount), 'AVAX');
    console.log('Milestone 0 funded:', milestone.funded);
    
    if (!milestone.funded) {
      const fundTx = await contractWithSigner.fundMilestone(
        newProjectId,
        0, // milestoneId
        { 
          value: milestone.amount,
          gasLimit: 200000
        }
      );
      
      console.log('Funding transaction hash:', fundTx.hash);
      const fundReceipt = await fundTx.wait();
      console.log('✅ Milestone funded successfully!');
      console.log('Gas used:', fundReceipt.gasUsed.toString());
    } else {
      console.log('❌ Milestone is already funded');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  }
}

createNewProject();
