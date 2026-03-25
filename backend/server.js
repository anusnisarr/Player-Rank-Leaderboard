

import 'dotenv/config'
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

//routes import
import playerRoutes from "./routes/players.routes.js";
import matchRoutes from "./routes/matches.routes.js";
import rawRouter from "./routes/raw.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL}));
app.use(express.json());

app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/raw", rawRouter);

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

 export default app;