require('dotenv').config();
const { ethers } = require('ethers');

async function testContractCall() {
  try {
    console.log('Testing contract call...');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    
    console.log('Contract address:', process.env.CONTRACT_ADDRESS);
    console.log('ABI length:', contractABI.length);
    
    // Test if we can call a view function
    const nextProjectId = await contract.nextProjectId();
    console.log('Next project ID:', nextProjectId.toString());
    
    // Test if we can get project info
    const project = await contract.projects(1);
    console.log('Project 1:', project);
    
    console.log('✅ Contract calls working!');
    
  } catch (error) {
    console.error('❌ Contract call failed:', error.message);
  }
}

testContractCall();
