const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, unique: true },
    team:    { type: String, trim: true, default: "Unaffiliated" },
    avatar:  { type: String, default: null },
    country: { type: String, default: "" },

    // Career totals
    totalKills:     { type: Number, default: 0 },
    totalDeaths:    { type: Number, default: 0 },
    totalAssists:   { type: Number, default: 0 },
    totalHeadshots: { type: Number, default: 0 },
    totalDamage:    { type: Number, default: 0 },
    totalRounds:    { type: Number, default: 0 },
    matchesPlayed:  { type: Number, default: 0 },
    wins:           { type: Number, default: 0 },
    losses:         { type: Number, default: 0 },

    // Simple computed score (0-100) and rank label
    score: { type: Number, default: 0 },
    rank:  { type: String, default: "Rookie" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Virtuals (simple, human-readable) ───────────────────────────────────────
playerSchema.virtual("kd").get(function () {
  const k = this.totalKills || 0;
  const d = this.totalDeaths || 0;
  return d > 0 ? +(k / d).toFixed(2) : +k.toFixed(2);
});

playerSchema.virtual("hsp").get(function () {
  const k = this.totalKills || 0;
  const h = this.totalHeadshots || 0;
  return k > 0 ? +((h / k) * 100).toFixed(1) : 0;
});

playerSchema.virtual("adr").get(function () {
  const r = this.totalRounds || 0;
  return r > 0 ? +((this.totalDamage || 0) / r).toFixed(1) : 0;
});

playerSchema.virtual("winRate").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +(((this.wins || 0) / m) * 100).toFixed(0) : 0;
});

playerSchema.virtual("avgKills").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalKills || 0) / m).toFixed(1) : 0;
});

playerSchema.virtual("avgDeaths").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalDeaths || 0) / m).toFixed(1) : 0;
});

playerSchema.virtual("avgAssists").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalAssists || 0) / m).toFixed(1) : 0;
});

playerSchema.virtual("avgDamage").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalDamage || 0) / m).toFixed(0) : 0;
});

// ─── Score formula ────────────────────────────────────────────────────────────
//
//  Performance Score (per match, then averaged):
//
//    raw = (Kills × 3) + (Assists × 1.5) - (Deaths × 2) + (HS% × 0.3) + (ADR × 0.15)
//
//  Then clamped to 0–100.
//
//  Easy to explain:
//    - Every kill  = +3 pts
//    - Every assist = +1.5 pts
//    - Every death  = -2 pts
//    - HS% and damage give small bonus pts
//

playerSchema.statics.computeScore = function ({ kills=0, deaths=0, assists=0, headshots=0, damage=0, rounds=1 }) {
  if (!rounds || rounds === 0) return 0;

  const hsp = kills > 0 ? (headshots / kills) * 100 : 0;
  const adr = damage / rounds;

  const raw = (kills * 3) + (assists * 1.5) - (deaths * 2) + (hsp * 0.3) + (adr * 0.15);

  return +Math.min(100, Math.max(0, raw)).toFixed(1);
};

// ─── Rank label ───────────────────────────────────────────────────────────────
playerSchema.statics.computeRank = function (score) {
  if (score >= 80) return "Fragmaster";
  if (score >= 65) return "Fragger";
  if (score >= 50) return "Soldier";
  if (score >= 35) return "Fighter";
  return "Rookie";
};

module.exports = mongoose.model("Player", playerSchema);
