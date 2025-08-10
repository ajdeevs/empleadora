const { ethers } = require('ethers');
require('dotenv').config();

async function debugContractState() {
  try {
    console.log('🔍 Debugging Contract State...\n');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    
    console.log('📋 Environment Variables:');
    console.log('- CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);
    console.log('- RPC_URL:', process.env.RPC_URL);
    console.log('- PRIVATE_KEY_ADMIN exists:', !!process.env.PRIVATE_KEY_ADMIN);
    
    // Check contract deployment
    console.log('\n📦 Contract Deployment Check:');
    const code = await provider.getCode(process.env.CONTRACT_ADDRESS);
    if (code === '0x') {
      console.log('❌ ERROR: No contract deployed at this address!');
      return;
    }
    console.log('✅ Contract is deployed at this address');
    
    // Check next project ID
    console.log('\n🔢 Project State:');
    const nextProjectId = await contract.nextProjectId();
    console.log('- Next Project ID:', nextProjectId.toString());
    
    // Check if project 1 exists
    if (nextProjectId > 1n) {
      console.log('\n📊 Project 1 Details:');
      try {
        const project = await contract.projects(1n);
        console.log('- Client:', project.client);
        console.log('- Freelancer:', project.freelancer);
        console.log('- Disputed:', project.disputed);
        console.log('- Milestones count:', project.milestones.length);
        
        // Check milestone 17
        if (project.milestones.length > 17) {
          const milestone = project.milestones[17];
          console.log('\n🎯 Milestone 17 Details:');
          console.log('- Amount:', milestone.amount.toString());
          console.log('- Funded:', milestone.funded);
          console.log('- Released:', milestone.released);
        } else {
          console.log('❌ Milestone 17 does not exist (only', project.milestones.length, 'milestones)');
        }
      } catch (error) {
        console.log('❌ Error reading project 1:', error.message);
      }
    } else {
      console.log('❌ Project 1 does not exist (nextProjectId =', nextProjectId.toString(), ')');
    }
    
    // Check wallet details
    console.log('\n👛 Wallet Details:');
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    console.log('- Admin wallet address:', adminWallet.address);
    
    const balance = await provider.getBalance(adminWallet.address);
    console.log('- Balance:', ethers.formatEther(balance), 'AVAX');
    
    // Check if admin wallet is client of any project
    console.log('\n🔍 Checking if admin wallet is client of any project...');
    for (let i = 0; i < Number(nextProjectId); i++) {
      try {
        const project = await contract.projects(BigInt(i));
        if (project.client === adminWallet.address) {
          console.log(`✅ Admin wallet is client of project ${i}`);
          console.log(`   - Freelancer: ${project.freelancer}`);
          console.log(`   - Disputed: ${project.disputed}`);
          console.log(`   - Milestones: ${project.milestones.length}`);
        }
      } catch (error) {
        // Project doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugContractState();
