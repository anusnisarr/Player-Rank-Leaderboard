import mongoose from "mongoose";

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
    rank:  { type: String, default: "Bronze" },
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

playerSchema.virtual("avgScore").get(function () {
  const mp = this.matchesPlayed || 0;
  const s = this.score || 0;
  return mp > 0 ? +(s / mp).toFixed(1) : 0;
});


playerSchema.statics.computeScore = function ({ kills=0, deaths=0, assists=0, headshots=0, hsp=0, damage=0, rounds=1, won=false }) {
  if (!rounds || rounds === 0) return 0;

  const kd = kills / deaths
  const adr = damage / rounds;
  const adr_normalized = adr / 100;
  const winBonus = won ? 10 : 0;

  const raw = (kills * 3) + (assists * 1.5) - (deaths * 2) + (headshots * 1) + (adr_normalized * 0.5) + (kd * 5) + winBonus;

  return Number(raw.toFixed(1));
};

// ─── Rank label ───────────────────────────────────────────────────────────────
playerSchema.statics.computeRank = function (score) {
  if (score <= 40) return "Bronze";
  if (score <= 55) return "Silver";
  if (score <= 70) return "Gold";
  if (score <= 85) return "Platinum";
  if (score <= 100) return "Elite";
  return "Master";
};

export default mongoose.model("Player", playerSchema);
