import express from "express";
import * as notificationsController from "../controllers/notifications.controllers.js";
const router = express.Router();

// POST /api/notifications/subscribe
// Frontend calls this to save the subscription
router.post("/subscribe", notificationsController.subscribe);
router.post("/send-all", notificationsController.sendNotification);
router.post("/test", notificationsController.testNotification);

export default router;