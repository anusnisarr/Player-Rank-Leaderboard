const mongoose = require("mongoose");

const matchStatSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  kills: { type: Number, required: true, min: 0 },
  deaths: { type: Number, required: true, min: 0 },
  assists: { type: Number, required: true, min: 0 },
  headshots: { type: Number, required: true, min: 0 },
  damage: { type: Number, required: true, min: 0 },
  kast: { type: Number, required: true, min: 0, max: 100 }, // percentage
  rounds: { type: Number, required: true, min: 1 },
  won: { type: Boolean, default: false },
  // Per-match computed
  rating: { type: Number, default: 0 },
  kpr: { type: Number, default: 0 },
  dpr: { type: Number, default: 0 },
  apr: { type: Number, default: 0 },
  hsr: { type: Number, default: 0 },
  adr: { type: Number, default: 0 },
});

const matchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    map: { type: String, default: "Unknown" },
    date: { type: Date, default: Date.now },
    teamA: { type: String, default: "Team A" },
    teamB: { type: String, default: "Team B" },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    totalRounds: { type: Number, required: true, min: 1 },
    playerStats: [matchStatSchema],
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
