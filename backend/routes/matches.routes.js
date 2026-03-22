import express from "express"
import { recomputePlayerStats } from "../utils/recomputePlayerStats.js";
import { getAllMatches, getSingleMatch, createMatch, deleteMatch } from "../controllers/matches.controllers.js";

const router = express.Router();

//matches GET all
router.get("/", getAllMatches);

//matches GET single
router.get("/:id", getSingleMatch);

//matches POST
router.post("/", createMatch);

//matches DELETE
router.delete("/:id", deleteMatch);

export default router;