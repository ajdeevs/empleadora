  const express = require("express");
const { ethers } = require("ethers");
const prisma = require("../config/db");
const { adminWallet, contract } = require("../config/web3");
const router = express.Router();

// Debug endpoint to check contract status
router.get("/status", async (req, res) => {
  try {
    const network = await contract.runner.provider.getNetwork();
    const code = await contract.runner.provider.getCode(contract.target);
    const adminBalance = await contract.runner.provider.getBalance(adminWallet.address);
    
    res.json({
      contract_address: contract.target,
      network_name: network.name,
      network_chain_id: network.chainId.toString(),
      contract_deployed: code !== "0x",
      admin_wallet: adminWallet.address,
      admin_balance_eth: ethers.formatEther(adminBalance),
      contract_code_size: code.length
    });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ error: "Status check failed", details: err.message });
  }
});

// Raise dispute first (required before refund)
router.post("/dispute", async (req, res) => {
  try {
    const { pid } = req.body;
    
    // Validate input
    if (!pid || isNaN(Number(pid))) {
      return res.status(400).json({ error: "Invalid pid parameter" });
    }
    
    // Check if contract is deployed and accessible
    try {
      const code = await contract.runner.provider.getCode(contract.target);
      if (code === "0x") {
        return res.status(500).json({ 
          error: "Contract not deployed", 
          details: "No contract found at the specified address. Check CONTRACT_ADDRESS in .env" 
        });
      }
    } catch (contractError) {
      return res.status(500).json({ 
        error: "Contract connection failed", 
        details: contractError.message 
      });
    }
    
    // Check if project exists
    let project;
    try {
      project = await contract.projects(pid);
    } catch (projectError) {
      return res.status(400).json({ 
        error: "Failed to fetch project", 
        details: projectError.message 
      });
    }
    
    if (!project || project.client === "0x0000000000000000000000000000000000000000") {
      return res.status(400).json({ error: "Project not found" });
    }
    
    // Raise dispute on blockchain
    const tx = await contract.connect(adminWallet).raiseDispute(pid);
    await tx.wait();

    // Update database
    try {
      await prisma.project.updateMany({
        where: { onchain_pid: BigInt(pid) },
        data: { disputed: true }
      });
    } catch (dbError) {
      console.error("Database update error:", dbError);
      // Don't fail the request if DB update fails, but log it
    }

    res.json({ status: "dispute raised", tx: tx.hash });
  } catch (err) {
    console.error("Dispute error:", err);
    res.status(500).json({ error: "Dispute failed", details: err.message });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { pid, mid } = req.body;
    
    // Validate input
    if (pid === undefined || mid === undefined || isNaN(Number(pid)) || isNaN(Number(mid))) {
      return res.status(400).json({ error: "Missing or invalid pid or mid parameter" });
    }
    
    // Check if contract is deployed and accessible
    try {
      const code = await contract.runner.provider.getCode(contract.target);
      if (code === "0x") {
        return res.status(500).json({ 
          error: "Contract not deployed", 
          details: "No contract found at the specified address. Check CONTRACT_ADDRESS in .env" 
        });
      }
    } catch (contractError) {
      return res.status(500).json({ 
        error: "Contract connection failed", 
        details: contractError.message 
      });
    }
    
    // Check if project exists and is disputed
    let project;
    try {
      project = await contract.projects(pid);
    } catch (projectError) {
      return res.status(400).json({ 
        error: "Failed to fetch project", 
        details: projectError.message 
      });
    }
    
    if (!project || project.client === "0x0000000000000000000000000000000000000000") {
      return res.status(400).json({ error: "Project not found" });
    }
    
    if (!project.disputed) {
      return res.status(400).json({ error: "Project must be disputed before refund. Call /admin/dispute first" });
    }
    
    // Check milestone exists and is refundable
    if (!project.milestones || mid >= project.milestones.length) {
      return res.status(400).json({ error: "Milestone not found" });
    }
      
    // Execute refund on blockchain
    const tx = await contract.connect(adminWallet).refundMilestone(pid, mid);
    await tx.wait();

    // Update database
    try {
      await prisma.milestone.updateMany({
        where: { 
          project: { onchain_pid: BigInt(pid) },
          mid: parseInt(mid)
        },
        data: { released: true }
      });
    } catch (dbError) {
      console.error("Database update error:", dbError);
      // Don't fail the request if DB update fails, but log it
    }

    res.json({ status: "refunded", tx: tx.hash });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: "Refund failed", details: err.message });
  }
});

module.exports = router;
