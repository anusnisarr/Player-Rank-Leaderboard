import 'dotenv/config'
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser"

//routes import
import playerRoutes from "./routes/players.routes.js";
import matchRoutes from "./routes/matches.routes.js";
import authRoutes from "./routes/auth.routes.js";
import rawRouter from "./routes/raw.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors({ origin: process.env.FRONTEND_URL , credentials: true}));
app.use(express.json());
app.use(cookieParser());

//api routes
app.use("/api/notifications", notificationsRouter);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/raw", rawRouter);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("✅ Connected to MongoDB");
  }).catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

 export default app;