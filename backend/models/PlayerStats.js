import mongoose from "mongoose";

// Stores stats for a specific player in a specific playground
// One document per player per playground
const playerStatsSchema = new mongoose.Schema({
  player:     { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  playground: { type: mongoose.Schema.Types.ObjectId, ref: "Playground", required: true },

  // Career totals within this playground
  totalKills:     { type: Number, default: 0 },
  totalDeaths:    { type: Number, default: 0 },
  totalAssists:   { type: Number, default: 0 },
  totalHeadshots: { type: Number, default: 0 },
  totalDamage:    { type: Number, default: 0 },
  totalRounds:    { type: Number, default: 0 },
  matchesPlayed:  { type: Number, default: 0 },
  wins:           { type: Number, default: 0 },
  losses:         { type: Number, default: 0 },

  // Computed
  score: { type: Number, default: 0 },
  rank:  { type: String, default: "Rookie" },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// Compound index — one stats doc per player per playground
playerStatsSchema.index({ player: 1, playground: 1 }, { unique: true });

// Virtuals
playerStatsSchema.virtual("kd").get(function () {
  const k = this.totalKills || 0, d = this.totalDeaths || 0;
  return d > 0 ? +(k / d).toFixed(2) : +k.toFixed(2);
});
playerStatsSchema.virtual("hsp").get(function () {
  const k = this.totalKills || 0, h = this.totalHeadshots || 0;
  return k > 0 ? +((h / k) * 100).toFixed(1) : 0;
});
playerStatsSchema.virtual("adr").get(function () {
  const r = this.totalRounds || 0;
  return r > 0 ? +((this.totalDamage || 0) / r).toFixed(1) : 0;
});
playerStatsSchema.virtual("winRate").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +(((this.wins || 0) / m) * 100).toFixed(0) : 0;
});
playerStatsSchema.virtual("avgKills").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalKills || 0) / m).toFixed(1) : 0;
});
playerStatsSchema.virtual("avgDeaths").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalDeaths || 0) / m).toFixed(1) : 0;
});
playerStatsSchema.virtual("avgAssists").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalAssists || 0) / m).toFixed(1) : 0;
});
playerStatsSchema.virtual("avgDamage").get(function () {
  const m = this.matchesPlayed || 0;
  return m > 0 ? +((this.totalDamage || 0) / m).toFixed(0) : 0;
});

export default mongoose.model("PlayerStats", playerStatsSchema);
