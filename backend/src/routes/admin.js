  const express = require("express");
const { ethers } = require("ethers");
const prisma = require("../config/db");
const { adminWallet, contract } = require("../config/web3");
const router = express.Router();

// GET system status and statistics
router.get("/status", async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalMilestones,
      disputedProjects,
      fundedMilestones,
      releasedMilestones
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.milestone.count(),
      prisma.project.count({ where: { disputed: true } }),
      prisma.milestone.count({ where: { funded: true } }),
      prisma.milestone.count({ where: { released: true } })
    ]);

    // Get all milestones to calculate amounts manually since amount_wei is stored as string
    const allMilestones = await prisma.milestone.findMany({
      select: { amount_wei: true, funded: true, released: true }
    });

    const totalAmount = allMilestones.reduce((sum, m) => sum + BigInt(m.amount_wei), BigInt(0));
    const fundedAmount = allMilestones
      .filter(m => m.funded)
      .reduce((sum, m) => sum + BigInt(m.amount_wei), BigInt(0));
    const releasedAmount = allMilestones
      .filter(m => m.released)
      .reduce((sum, m) => sum + BigInt(m.amount_wei), BigInt(0));

    res.json({
      system: "online",
      timestamp: new Date().toISOString(),
      statistics: {
        users: {
          total: totalUsers,
          clients: await prisma.user.count({ where: { role: 'client' } }),
          freelancers: await prisma.user.count({ where: { role: 'freelancer' } }),
          admins: await prisma.user.count({ where: { role: 'admin' } })
        },
        projects: {
          total: totalProjects,
          disputed: disputedProjects,
          active: totalProjects - disputedProjects
        },
        milestones: {
          total: totalMilestones,
          funded: fundedMilestones,
          released: releasedMilestones,
          pending: totalMilestones - fundedMilestones
        },
        funding: {
          totalAmount: totalAmount.toString(),
          fundedAmount: fundedAmount.toString(),
          releasedAmount: releasedAmount.toString()
        }
      }
    });
  } catch (err) {
    console.error("Get status error:", err);
    res.status(500).json({ error: "Could not fetch system status" });
  }
});

// GET contract information for client-side funding
router.get("/contract-info", async (req, res) => {
  try {
    res.json({
      contractAddress: process.env.CONTRACT_ADDRESS,
      rpcUrl: process.env.RPC_URL,
      network: "Avalanche Fuji Testnet"
    });
  } catch (err) {
    console.error("Get contract info error:", err);
    res.status(500).json({ error: "Could not fetch contract information" });
  }
});

// GET all disputed projects
router.get("/disputes", async (req, res) => {
  try {
    const disputes = await prisma.project.findMany({
      where: { disputed: true },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            wallet_address: true,
            role: true
          }
        },
        freelancer: {
          select: {
            id: true,
            email: true,
            wallet_address: true,
            role: true
          }
        },
        milestones: true
      }
    });

    // Convert BigInts to strings for safe JSON
    const safeDisputes = JSON.parse(JSON.stringify(disputes, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeDisputes);
  } catch (err) {
    console.error("Get disputes error:", err);
    res.status(500).json({ error: "Could not fetch disputes" });
  }
});

// GET dispute by project ID
router.get("/disputes/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    const dispute = await prisma.project.findFirst({
      where: {
        id: projectId,
        disputed: true
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            wallet_address: true,
            role: true
          }
        },
        freelancer: {
          select: {
            id: true,
            email: true,
            wallet_address: true,
            role: true
          }
        },
        milestones: true
      }
    });

    if (!dispute) {
      return res.status(404).json({ error: "Dispute not found" });
    }

    // Convert BigInts to strings for safe JSON
    const safeDispute = JSON.parse(JSON.stringify(dispute, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeDispute);
  } catch (err) {
    console.error("Get dispute error:", err);
    res.status(500).json({ error: "Could not fetch dispute" });
  }
});

// GET all events/logs
router.get("/events", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { created_at: 'desc' },
      take: 100 // Limit to last 100 events
    });

    res.json(events);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ error: "Could not fetch events" });
  }
});

// GET events by type
router.get("/events/:type", async (req, res) => {
  try {
    const { type } = req.params;
    
    const events = await prisma.event.findMany({
      where: { type },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    res.json(events);
  } catch (err) {
    console.error("Get events by type error:", err);
    res.status(500).json({ error: "Could not fetch events" });
  }
});

router.post("/dispute", async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const project = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: { disputed: true },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            wallet_address: true,
            role: true
          }
        },
        freelancer: {
          select: {
            id: true,
            email: true,
            wallet_address: true,
            role: true
          }
        },
        milestones: true
      }
    });

    // Log the dispute event
    await prisma.event.create({
      data: {
        tx_hash: `dispute_${Date.now()}`,
        type: "dispute_raised",
        payload: {
          projectId: project.id,
          onchain_pid: project.onchain_pid.toString(),
          timestamp: new Date().toISOString()
        }
      }
    });

    // Convert BigInts to strings for safe JSON
    const safeProject = JSON.parse(JSON.stringify(project, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeProject);
  } catch (err) {
    console.error("Raise dispute error:", err);
    res.status(500).json({ error: "Could not raise dispute" });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { projectId, milestoneId } = req.body;

    if (!projectId || !milestoneId) {
      return res.status(400).json({ error: "projectId and milestoneId are required" });
    }

    const milestone = await prisma.milestone.update({
      where: {
        id: parseInt(milestoneId),
        projectId: parseInt(projectId)
      },
      data: { 
        funded: false,
        released: false
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                email: true,
                wallet_address: true,
                role: true
              }
            },
            freelancer: {
              select: {
                id: true,
                email: true,
                wallet_address: true,
                role: true
              }
            }
          }
        }
      }
    });

    // Log the refund event
    await prisma.event.create({
      data: {
        tx_hash: `refund_${Date.now()}`,
        type: "refund_processed",
        payload: {
          projectId: milestone.projectId,
          milestoneId: milestone.id,
          amount_wei: milestone.amount_wei,
          timestamp: new Date().toISOString()
        }
      }
    });

    res.json(milestone);
  } catch (err) {
    console.error("Process refund error:", err);
    res.status(500).json({ error: "Could not process refund" });
  }
});

module.exports = router;
