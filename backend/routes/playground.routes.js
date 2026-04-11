import express from "express";
import { authMiddleware } from "../middleware/auth.moiddleware.js";
import {
  createPlayground,
  joinPlayground,
  getMyPlaygrounds,
  getPlayground,
  getLeaderboard,
  leavePlayground,
  deletePlayground,
  requestJoin,
  approveMember,
  rejectMember
} from "../controllers/playground.controllers.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

router.post("/", createPlayground);
router.post("/join", joinPlayground);
router.get("/mine", getMyPlaygrounds);
router.get("/:id", getPlayground);
router.get("/:id/leaderboard", getLeaderboard);
router.delete("/:id/leave", leavePlayground);
router.delete("/:id", deletePlayground);
router.post("/request", requestJoin);
router.post("/:id/approve/:userId", approveMember);
router.post("/:id/reject/:userId", rejectMember);

export default router;
