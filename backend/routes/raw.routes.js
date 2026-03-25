import express from "express";
const router   = express.Router();
import rawEvent from "../models/rawEvents.models.js";
import 'dotenv/config'


// POST /api/raw
// Exe sends every log line here — just save it, no processing
router.post("/", async (req, res) => {
  try {
    const event = await RawEvent.create({
      type:   req.body.type   || "unknown",
      raw:    req.body.raw    || "",
      data:   req.body,
      source: req.ip,
    });
    console.log(`[RAW] ${event.type} — ${event.raw}`);
    res.json({ success: true, id: event._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/raw
// See everything that came in — for debugging
router.get("/", async (req, res) => {
  try {
    const events = await RawEvent.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;