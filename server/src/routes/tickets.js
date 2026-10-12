const express = require("express");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { requireAuth, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth); 

const PEOPLE = "name email role";

async function loadTicket(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid ticket id" });
    return null;
  }
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return null;
  }
  const isOwner = ticket.createdBy.toString() === req.user.id;
  if (req.user.role !== "agent" && !isOwner) {
    res.status(404).json({ message: "Ticket not found" });
    return null;
  }
  return ticket;
}

function withPeople(query) {
  return query.populate("createdBy", PEOPLE).populate("assignedTo", PEOPLE).populate("comments.author", PEOPLE);
}


router.get("/", async (req, res) => {
  const filter = {};
  if (req.user.role !== "agent") filter.createdBy = req.user.id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search) {
    const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: safe, $options: "i" };
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .select("-comments") 
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", PEOPLE)
      .populate("assignedTo", PEOPLE),
    Ticket.countDocuments(filter),
  ]);

  res.json({ tickets, page, totalPages: Math.ceil(total / limit) || 1, total });
});

// Any logged-in person can raise a ticket.
router.post("/", async (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }
  const ticket = await Ticket.create({ title, description, priority, createdBy: req.user.id });
  res.status(201).json({ ticket });
});

router.get("/:id", async (req, res) => {
  const ticket = await loadTicket(req, res);
  if (!ticket) return;
  res.json({ ticket: await withPeople(Ticket.findById(ticket._id)) });
});

// Only agents can move a ticket through its workflow.
router.patch("/:id/status", allowRoles("agent"), async (req, res) => {
  const ticket = await loadTicket(req, res);
  if (!ticket) return;
  const { status } = req.body;
  const allowed = Ticket.ALLOWED_MOVES[ticket.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Cannot move a ticket from ${ticket.status} to ${status}` });
  }
  ticket.status = status;
  await ticket.save();
  res.json({ ticket: await withPeople(Ticket.findById(ticket._id)) });
});

// Only agents can assign, and only to another agent (or null to unassign).
router.patch("/:id/assign", allowRoles("agent"), async (req, res) => {
  const ticket = await loadTicket(req, res);
  if (!ticket) return;
  const { agentId } = req.body;
  if (agentId) {
    const agent = mongoose.isValidObjectId(agentId) && (await User.findById(agentId));
    if (!agent || agent.role !== "agent") {
      return res.status(400).json({ message: "Tickets can only be assigned to an agent" });
    }
  }
  ticket.assignedTo = agentId || null;
  await ticket.save();
  res.json({ ticket: await withPeople(Ticket.findById(ticket._id)) });
});

// The ticket owner and agents can comment.
router.post("/:id/comments", async (req, res) => {
  const ticket = await loadTicket(req, res);
  if (!ticket) return;
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ message: "Comment cannot be empty" });
  ticket.comments.push({ author: req.user.id, text });
  await ticket.save();
  res.status(201).json({ ticket: await withPeople(Ticket.findById(ticket._id)) });
});

module.exports = router;
