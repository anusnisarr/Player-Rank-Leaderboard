import express from "express"
import { getAllPlayers, recomputeAllPlayersScores, getAllTeams , getSinglePlayer, createPlayer, updatePlayer, deletePlayer } from "../controllers/players.controllers.js";

const router = express.Router();

// GET all players — leaderboard
router.get("/", getAllPlayers);

router.get("/teams", getAllTeams);

// GET all players Ids
router.get("/recomputeAllScores", recomputeAllPlayersScores);

// GET single player + match history
router.get("/:id", getSinglePlayer);

// POST create player
router.post("/", createPlayer);

// PUT update player info
router.put("/:id", updatePlayer);

// DELETE player
router.delete("/:id", deletePlayer);

export default router;