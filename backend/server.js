require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const playerRoutes = require("./routes/players");
const matchRoutes = require("./routes/matches");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL}));
app.use(express.json());

app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
