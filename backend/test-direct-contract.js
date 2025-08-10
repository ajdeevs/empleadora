require('dotenv').config();
const { ethers } = require('ethers');

async function testDirectContractCall() {
  try {
    console.log('Testing direct contract call...');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    
    // Create wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
    const contractWithSigner = contract.connect(wallet);
    
    console.log('Contract address:', process.env.CONTRACT_ADDRESS);
    console.log('Wallet address:', wallet.address);
    
    // Test the fundMilestone function
    const projectId = 1n;
    const milestoneId = 0;
    const amountWei = ethers.parseEther("0.1");
    
    console.log('Calling fundMilestone with:');
    console.log('- projectId:', projectId);
    console.log('- milestoneId:', milestoneId);
    console.log('- amountWei:', amountWei.toString());
    
    // Check if function exists
    console.log('Function type:', typeof contractWithSigner.fundMilestone);
    
    // Try to call the function
    const tx = await contractWithSigner.fundMilestone(
      projectId,
      milestoneId,
      {
        value: amountWei,
        gasLimit: 200000
      }
    );
    
    console.log('Transaction hash:', tx.hash);
    console.log('Transaction data:', tx.data);
    
    const receipt = await tx.wait();
    console.log('Transaction successful!');
    console.log('Gas used:', receipt.gasUsed.toString());
    
  } catch (error) {
    console.error('❌ Contract call failed:', error.message);
    console.error('Error details:', error);
  }
}

testDirectContractCall();

