const { ethers } = require('ethers');
require('dotenv').config();

async function simpleFundTest() {
  try {
    console.log('🧪 Simple Funding Test...\n');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    const contractWithSigner = contract.connect(adminWallet);
    
    console.log('👛 Admin wallet address:', adminWallet.address);
    
    // Check next project ID
    const nextProjectId = await contract.nextProjectId();
    console.log('Next Project ID:', nextProjectId.toString());
    
    // Try to fund milestone 0 of project 2 (the one we just created)
    const projectId = 2n;
    const milestoneId = 0;
    const amountWei = ethers.parseEther("0.1"); // 0.1 AVAX
    
    console.log('\n💰 Funding milestone...');
    console.log('- Project ID:', projectId.toString());
    console.log('- Milestone ID:', milestoneId);
    console.log('- Amount:', ethers.formatEther(amountWei), 'AVAX');
    
    // Check wallet balance
    const balance = await provider.getBalance(adminWallet.address);
    console.log('- Wallet balance:', ethers.formatEther(balance), 'AVAX');
    
    if (balance < amountWei) {
      console.log('❌ Insufficient balance');
      return;
    }
    
    // Try to fund the milestone
    const fundTx = await contractWithSigner.fundMilestone(
      projectId,
      milestoneId,
      { 
        value: amountWei,
        gasLimit: 200000
      }
    );
    
    console.log('Transaction hash:', fundTx.hash);
    const receipt = await fundTx.wait();
    
    if (receipt.status === 1) {
      console.log('✅ Milestone funded successfully!');
      console.log('Gas used:', receipt.gasUsed.toString());
    } else {
      console.log('❌ Transaction failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Check if it's a specific contract error
    if (error.reason) {
      console.error('Contract error reason:', error.reason);
    }
    
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

simpleFundTest();
