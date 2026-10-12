const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "Email is already registered" });
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
});

module.exports = router;
