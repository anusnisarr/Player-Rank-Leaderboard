import express from "express"
import {getPlaygroundStats, getAllPlayers, recomputeAllPlayersScores, getAllTeams , getSinglePlayer, createPlayer, updatePlayer, deletePlayer } from "../controllers/players.controllers.js";
import { authMiddleware } from "../middleware/auth.moiddleware.js";
const router = express.Router();

// GET all players — leaderboard
router.get("/", authMiddleware, getAllPlayers);

router.get("/teams", authMiddleware, getAllTeams);

// GET all players Ids
router.get("/recomputeAllScores", recomputeAllPlayersScores);

// GET single player + match history
router.get("/:id", authMiddleware, getSinglePlayer);

// POST create player
router.post("/", authMiddleware, createPlayer);

// PUT update player info
router.put("/:id", authMiddleware, updatePlayer);

// DELETE player
router.delete("/:id", authMiddleware,deletePlayer);

router.get("/:id/playground-stats", authMiddleware, getPlaygroundStats);

export default router;