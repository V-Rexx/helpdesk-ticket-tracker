const express = require("express");
const User = require("../models/User");
const { requireAuth, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/agents", requireAuth, allowRoles("agent"), async (req, res) => {
  const agents = await User.find({ role: "agent" }).select("name email role").sort({ name: 1 });
  res.json({ agents });
});

module.exports = router;
