const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const STATUSES = ["open", "in_progress", "resolved"];

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: STATUSES, default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    comments: [commentSchema],
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1 });
ticketSchema.index({ createdBy: 1 });

ticketSchema.statics.ALLOWED_MOVES = {
  open: ["in_progress"],
  in_progress: ["resolved", "open"],
  resolved: ["open"],
};

module.exports = mongoose.model("Ticket", ticketSchema);
