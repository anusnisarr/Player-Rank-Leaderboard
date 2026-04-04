import express from "express"
import { getAllMatches, getSingleMatch, createMatch, deleteMatch } from "../controllers/matches.controllers.js";
import { authMiddleware } from "../middleware/auth.moiddleware.js";


const router = express.Router();
router.use(authMiddleware);
//matches GET all
router.get("/", getAllMatches);

//matches GET single
router.get("/:id", getSingleMatch);

//matches POST
router.post("/", createMatch);

//matches DELETE
router.delete("/:id", deleteMatch);

export default router;