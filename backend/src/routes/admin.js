const express = require("express");
const prisma = require("../config/db");
const { adminWallet, contract } = require("../config/web3");
const router = express.Router();

router.post("/refund", async (req, res) => {
  try {
    const { pid, mid } = req.body;
    const tx = await contract.connect(adminWallet).refundMilestone(pid, mid);
    await tx.wait();

    await prisma.milestone.updateMany({
      where: { projectId: pid, mid },
      data: { released: true }
    });

    res.json({ status: "refunded", tx: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Refund failed" });
  }
});

module.exports = router;
