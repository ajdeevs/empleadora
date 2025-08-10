const express = require('express');
const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Load contract configuration
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
const contractABI = require('../../artifacts/contracts/EscrowWithTokens.sol/EscrowWithTokens.json').abi;
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, adminWallet);

// Popular token addresses on Avalanche
const TOKENS = {
  USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
  WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  WBTC: '0x50b7545627a5162F82A992c33b87aDc75187B218'
};

/**
 * POST /funding-with-tokens/fund-milestone
 * Client funds a milestone with AVAX or tokens
 */
router.post('/fund-milestone', async (req, res) => {
  try {
    const { projectId, milestoneId, clientWalletAddress, amount, tokenAddress } = req.body;
    
    // Validate input
    if (!projectId || !milestoneId || !clientWalletAddress || !amount) {
      return res.status(400).json({ 
        error: "Missing required parameters: projectId, milestoneId, clientWalletAddress, amount" 
      });
    }
    
    // Get project from database
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: { milestones: true }
    });
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Get milestone
    const milestone = project.milestones.find(m => m.id === parseInt(milestoneId));
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }
    
    if (milestone.funded) {
      return res.status(400).json({ error: "Milestone already funded" });
    }
    
    // Convert amount to wei
    const amountWei = ethers.parseEther(amount.toString());
    
    // Check if amount matches milestone amount
    if (BigInt(amountWei) != BigInt(milestone.amount_wei)) {
      return res.status(400).json({ 
        error: `Amount must be exactly ${milestone.amount_wei} wei` 
      });
    }
    
    let fundTx;
    
    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
      // Fund with native AVAX
      fundTx = await contract.fundMilestone(
        BigInt(project.onchain_pid), 
        parseInt(milestoneId),
        { value: amountWei }
      );
    } else {
      // Fund with ERC-20 token
      fundTx = await contract.fundMilestoneWithToken(
        BigInt(project.onchain_pid), 
        parseInt(milestoneId),
        tokenAddress
      );
    }
    
    await fundTx.wait();
    
    // Update database
    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { 
        funded: true,
        token_address: tokenAddress || null
      }
    });
    
    res.json({
      success: true,
      message: "Milestone funded successfully",
      transactionHash: fundTx.hash,
      amount: amountWei.toString(),
      milestoneId: milestoneId,
      tokenAddress: tokenAddress || 'native AVAX'
    });
    
  } catch (error) {
    console.error('Funding error:', error);
    res.status(500).json({ 
      error: "Funding failed", 
      details: error.message 
    });
  }
});

/**
 * GET /funding-with-tokens/supported-tokens
 * Get list of supported tokens
 */
router.get('/supported-tokens', (req, res) => {
  res.json({
    tokens: {
      'Native AVAX': {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'AVAX',
        decimals: 18,
        name: 'Avalanche'
      },
      'USDC': {
        address: TOKENS.USDC,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin'
      },
      'USDT': {
        address: TOKENS.USDT,
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD'
      },
      'DAI': {
        address: TOKENS.DAI,
        symbol: 'DAI',
        decimals: 18,
        name: 'Dai Stablecoin'
      },
      'WAVAX': {
        address: TOKENS.WAVAX,
        symbol: 'WAVAX',
        decimals: 18,
        name: 'Wrapped AVAX'
      }
    }
  });
});

/**
 * POST /funding-with-tokens/create-project-with-tokens
 * Create project with token support
 */
router.post('/create-project-with-tokens', async (req, res) => {
  try {
    const { clientWallet, freelancerWallet, amounts, tokens } = req.body;
    
    // Validate input
    if (!clientWallet || !freelancerWallet || !amounts || !tokens) {
      return res.status(400).json({ 
        error: "Missing required parameters" 
      });
    }
    
    if (amounts.length !== tokens.length) {
      return res.status(400).json({ 
        error: "Amounts and tokens arrays must have same length" 
      });
    }
    
    // Create or get users
    const client = await prisma.user.upsert({
      where: { wallet: clientWallet },
      update: {},
      create: { wallet: clientWallet, role: 'client' }
    });
    
    const freelancer = await prisma.user.upsert({
      where: { wallet: freelancerWallet },
      update: {},
      create: { wallet: freelancerWallet, role: 'freelancer' }
    });
    
    // Create project on blockchain
    const createTx = await contract.createProject(freelancerWallet, amounts, tokens);
    await createTx.wait();
    
    // Get project ID from blockchain
    const projectId = await contract.nextProjectId() - 1n;
    
    // Create project in database
    const project = await prisma.project.create({
      data: {
        onchain_pid: projectId,
        clientId: client.id,
        freelancerId: freelancer.id,
        milestones: {
          create: amounts.map((amount, index) => ({
            mid: index,
            amount_wei: amount.toString(),
            token_address: tokens[index] === '0x0000000000000000000000000000000000000000' ? null : tokens[index]
          }))
        }
      },
      include: { milestones: true }
    });
    
    res.json({
      success: true,
      message: "Project created successfully",
      project: project,
      transactionHash: createTx.hash
    });
    
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ 
      error: "Project creation failed", 
      details: error.message 
    });
  }
});

module.exports = router;
