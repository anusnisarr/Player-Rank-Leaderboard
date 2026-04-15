import express from "express"
import * as auth  from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middleware/auth.moiddleware.js";

const router = express.Router();



//Login POST
router.get("/me", authMiddleware ,  auth.getMe);
router.post("/login", auth.loginUser);
router.post("/logout", auth.logoutUser);
router.post("/register", auth.registerUser);


export default router;