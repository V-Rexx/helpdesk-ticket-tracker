const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/users", require("./routes/users"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
