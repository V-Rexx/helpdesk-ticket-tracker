// Creates demo accounts and a few tickets. Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Ticket = require("./models/Ticket");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Ticket.deleteMany({})]);

  // .create() runs the pre-save hook, so passwords get hashed.
  const agent = await User.create({ name: "Asha (Agent)", email: "agent@demo.com", password: "agent123", role: "agent" });
  const user = await User.create({ name: "Rahul (User)", email: "user@demo.com", password: "user123" });

  await Ticket.create([
    { title: "Wi-Fi not working on 3rd floor", description: "Laptop connects but no internet.", priority: "high", createdBy: user._id },
    { title: "Need access to shared drive", description: "Please give me access to the Finance folder.", priority: "medium", createdBy: user._id, status: "in_progress", assignedTo: agent._id },
    { title: "Printer out of toner", description: "Printer near the pantry shows a toner error.", priority: "low", createdBy: user._id, status: "resolved", assignedTo: agent._id },
  ]);

  console.log("Seeded. Agent: agent@demo.com / agent123   User: user@demo.com / user123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
