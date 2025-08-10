const { ethers } = require('ethers');
require('dotenv').config();

async function investigateDispute() {
  try {
    console.log('🔍 Investigating Project 1 Dispute...\n');
    
    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractABI = require('./artifacts/contracts/Escrow.sol/Escrow.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    
    console.log('📊 Project 1 Details:');
    const project = await contract.projects(1n);
    console.log('- Client:', project.client);
    console.log('- Freelancer:', project.freelancer);
    console.log('- Disputed:', project.disputed);
    
    // Check recent events to see when dispute was raised
    console.log('\n📜 Checking Recent Events...');
    
    // Get the current block number
    const currentBlock = await provider.getBlockNumber();
    console.log('Current block:', currentBlock);
    
    // Look for DisputeRaised events in recent blocks
    const fromBlock = currentBlock - 1000; // Check last 1000 blocks
    console.log('Checking events from block', fromBlock, 'to', currentBlock);
    
    try {
      const disputeEvents = await contract.queryFilter(
        contract.filters.DisputeRaised(1n), // Filter for project 1
        fromBlock,
        currentBlock
      );
      
      if (disputeEvents.length > 0) {
        console.log('\n🎯 Found DisputeRaised events:');
        for (let i = 0; i < disputeEvents.length; i++) {
          const event = disputeEvents[i];
          console.log(`Event ${i + 1}:`);
          console.log('- Block:', event.blockNumber);
          console.log('- Transaction:', event.transactionHash);
          console.log('- Project ID:', event.args.projectId.toString());
          
          // Get transaction details
          const tx = await provider.getTransaction(event.transactionHash);
          console.log('- From:', tx.from);
          console.log('- To:', tx.to);
          console.log('- Gas used:', tx.gasLimit.toString());
        }
      } else {
        console.log('❌ No DisputeRaised events found for project 1 in recent blocks');
      }
    } catch (error) {
      console.log('❌ Error querying events:', error.message);
    }
    
    // Check all recent DisputeRaised events (not just for project 1)
    console.log('\n🔍 Checking all recent DisputeRaised events...');
    try {
      const allDisputeEvents = await contract.queryFilter(
        contract.filters.DisputeRaised(), // No filter - get all
        fromBlock,
        currentBlock
      );
      
      if (allDisputeEvents.length > 0) {
        console.log(`Found ${allDisputeEvents.length} dispute events:`);
        for (let i = 0; i < allDisputeEvents.length; i++) {
          const event = allDisputeEvents[i];
          console.log(`Event ${i + 1}:`);
          console.log('- Block:', event.blockNumber);
          console.log('- Project ID:', event.args.projectId.toString());
          console.log('- Transaction:', event.transactionHash);
          
          // Get transaction details
          const tx = await provider.getTransaction(event.transactionHash);
          console.log('- From:', tx.from);
        }
      } else {
        console.log('❌ No dispute events found in recent blocks');
      }
    } catch (error) {
      console.log('❌ Error querying all events:', error.message);
    }
    
    // Check if there are any other projects with disputes
    console.log('\n🔍 Checking all projects for disputes...');
    const nextProjectId = await contract.nextProjectId();
    console.log('Total projects:', nextProjectId.toString());
    
    for (let i = 0; i < Number(nextProjectId); i++) {
      try {
        const project = await contract.projects(BigInt(i));
        if (project.disputed) {
          console.log(`⚠️  Project ${i} is disputed:`);
          console.log(`   - Client: ${project.client}`);
          console.log(`   - Freelancer: ${project.freelancer}`);
        }
      } catch (error) {
        // Project doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
}

investigateDispute();
