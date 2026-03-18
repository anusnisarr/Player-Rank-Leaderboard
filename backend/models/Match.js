const mongoose = require("mongoose");

const matchStatSchema = new mongoose.Schema({
  player:     { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  kills:      { type: Number, required: true, min: 0 },
  deaths:     { type: Number, required: true, min: 0 },
  assists:    { type: Number, required: true, min: 0 },
  headshots:  { type: Number, required: true, min: 0 },
  damage:     { type: Number, required: true, min: 0 },
  rounds:     { type: Number, required: true, min: 1 },
  won:        { type: Boolean, default: false },
  // computed per match
  hsp:   { type: Number, default: 0 },  // headshot %
  adr:   { type: Number, default: 0 },  // avg damage per round
  kd:    { type: Number, default: 0 },  // kill/death ratio
  score: { type: Number, default: 0 },  // performance score 0-100
});

const matchSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    map:         { type: String, default: "" },
    date:        { type: Date, default: Date.now },
    teamA:       { type: String, default: "" },
    teamB:       { type: String, default: "" },
    scoreA:      { type: Number, default: 0 },
    scoreB:      { type: Number, default: 0 },
    totalRounds: { type: Number, required: true, min: 1 },
    playerStats: [matchStatSchema],
    notes:       { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
