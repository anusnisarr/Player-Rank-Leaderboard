import jwt from "jsonwebtoken";
import User from "../models/auth.models.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;

  
  // const authHeader = req.headers.authorization;
  // const token = authHeader?.startsWith("Bearer ") 
  //   ? authHeader.split(" ")[1] 
  //   : req.cookies?.accessToken; // fallback for local dev

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("player");
    req.user = {
      id: decoded.id,
      playerId: user.player,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};