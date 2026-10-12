require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5001;

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET must be set in server/.env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
