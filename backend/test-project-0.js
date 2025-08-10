const { ethers } = require('ethers');
require('dotenv').config();

async function testProject0Funding() {
  try {
    console.log('🧪 Testing Project 0 Funding...\n');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    const contractWithSigner = contract.connect(adminWallet);
    
    console.log('📊 Project 0 Details:');
    const project = await contract.projects(0n);
    console.log('- Client:', project.client);
    console.log('- Freelancer:', project.freelancer);
    console.log('- Disputed:', project.disputed);
    console.log('- Milestones count:', project.milestones.length);
    
    // Check milestone 0
    if (project.milestones.length > 0) {
      const milestone = project.milestones[0];
      console.log('\n🎯 Milestone 0 Details:');
      console.log('- Amount:', milestone.amount.toString());
      console.log('- Funded:', milestone.funded);
      console.log('- Released:', milestone.released);
      
      if (!milestone.funded) {
        console.log('\n💰 Funding Milestone 0...');
        const amountWei = milestone.amount;
        
        console.log('Calling fundMilestone with:');
        console.log('- projectId: 0');
        console.log('- milestoneId: 0');
        console.log('- amount:', ethers.formatEther(amountWei), 'AVAX');
        
        const fundTx = await contractWithSigner.fundMilestone(
          0n, // projectId
          0,  // milestoneId
          { 
            value: amountWei,
            gasLimit: 200000
          }
        );
        
        console.log('Transaction hash:', fundTx.hash);
        const receipt = await fundTx.wait();
        console.log('✅ Milestone funded successfully!');
        console.log('Gas used:', receipt.gasUsed.toString());
        
      } else {
        console.log('❌ Milestone 0 is already funded');
      }
    } else {
      console.log('❌ No milestones in project 0');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testProject0Funding();
