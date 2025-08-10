const express = require("express");
const prisma = require("../config/db");
const { uploadFile } = require("../services/web3storage");
const router = express.Router();

// GET all milestones
router.get("/", async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany({
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

    // Convert BigInts to strings for safe JSON
    const safeMilestones = JSON.parse(JSON.stringify(milestones, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeMilestones);
  } catch (err) {
    console.error("Get milestones error:", err);
    res.status(500).json({ error: "Could not fetch milestones" });
  }
});

// GET milestone by ID
router.get("/:id", async (req, res) => {
  try {
    const milestoneId = parseInt(req.params.id);
    
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
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

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    // Convert BigInts to strings for safe JSON
    const safeMilestone = JSON.parse(JSON.stringify(milestone, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeMilestone);
  } catch (err) {
    console.error("Get milestone error:", err);
    res.status(500).json({ error: "Could not fetch milestone" });
  }
});

// GET milestones by project ID
router.get("/project/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
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
      },
      orderBy: { mid: 'asc' }
    });

    // Convert BigInts to strings for safe JSON
    const safeMilestones = JSON.parse(JSON.stringify(milestones, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeMilestones);
  } catch (err) {
    console.error("Get project milestones error:", err);
    res.status(500).json({ error: "Could not fetch project milestones" });
  }
});

router.post("/:id/deliver", async (req, res) => {
  try {
    const milestoneId = parseInt(req.params.id);
    const { deliverable_cid } = req.body;

    if (!deliverable_cid) {
      return res.status(400).json({ error: "deliverable_cid is required" });
    }

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { deliverable_cid },
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

    // Convert BigInts to strings for safe JSON
    const safeMilestone = JSON.parse(JSON.stringify(milestone, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeMilestone);
  } catch (err) {
    console.error("Milestone delivery error:", err);
    res.status(500).json({ error: "Could not update milestone" });
  }
});

// PUT mark milestone as funded (for client-side funding)
router.put("/:id/mark-funded", async (req, res) => {
  try {
    const milestoneId = parseInt(req.params.id);
    const { funded, transactionHash } = req.body;

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { 
        funded: funded || true,
        // You could also store the transaction hash if needed
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

    // Convert BigInts to strings for safe JSON
    const safeMilestone = JSON.parse(JSON.stringify(milestone, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.json(safeMilestone);
  } catch (err) {
    console.error("Mark milestone funded error:", err);
    res.status(500).json({ error: "Could not update milestone funding status" });
  }
});

module.exports = router;
