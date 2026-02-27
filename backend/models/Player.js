const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
      unique: true,
    },
    team: {
      type: String,
      trim: true,
      default: "Unaffiliated",
    },
    avatar: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: "Unknown",
    },
    // Aggregated career stats
    totalRounds: { type: Number, default: 0 },
    totalKills: { type: Number, default: 0 },
    totalDeaths: { type: Number, default: 0 },
    totalAssists: { type: Number, default: 0 },
    totalHeadshots: { type: Number, default: 0 },
    totalDamage: { type: Number, default: 0 },
    totalKast: { type: Number, default: 0 }, // sum of KAST% per match
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    // Computed rating (cached)
    rating: { type: Number, default: 0 },
    tier: { type: String, default: "D" },
    role: { type: String, default: "Lurker" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
playerSchema.virtual("kd").get(function () {
  return this.totalDeaths > 0
    ? +(this.totalKills / this.totalDeaths).toFixed(2)
    : this.totalKills;
});

playerSchema.virtual("kpr").get(function () {
  return this.totalRounds > 0
    ? +(this.totalKills / this.totalRounds).toFixed(2)
    : 0;
});

playerSchema.virtual("dpr").get(function () {
  return this.totalRounds > 0
    ? +(this.totalDeaths / this.totalRounds).toFixed(2)
    : 0;
});

playerSchema.virtual("apr").get(function () {
  return this.totalRounds > 0
    ? +(this.totalAssists / this.totalRounds).toFixed(2)
    : 0;
});

playerSchema.virtual("hsr").get(function () {
  return this.totalKills > 0
    ? +((this.totalHeadshots / this.totalKills) * 100).toFixed(1)
    : 0;
});

playerSchema.virtual("adr").get(function () {
  return this.totalRounds > 0
    ? +(this.totalDamage / this.totalRounds).toFixed(1)
    : 0;
});

playerSchema.virtual("avgKast").get(function () {
  return this.matchesPlayed > 0
    ? +(this.totalKast / this.matchesPlayed).toFixed(1)
    : 0;
});

playerSchema.virtual("winRate").get(function () {
  return this.matchesPlayed > 0
    ? +((this.wins / this.matchesPlayed) * 100).toFixed(1)
    : 0;
});

// Static method to compute rating
playerSchema.statics.computeRating = function (stats) {
  const { kills, deaths, assists, headshots, damage, rounds, kast } = stats;
  if (!rounds || rounds === 0) return 0;

  const kpr = kills / rounds;
  const survivalRating = (rounds - deaths) / rounds;
  const aprRating = assists / rounds / 0.3;
  const hsrRating = kills > 0 ? (headshots / kills) / 0.45 : 0;
  const adrRating = damage / rounds / 75;
  const kastRating = kast / 100;

  const killRating = kpr / 0.679;

  const rating =
    killRating * 0.38 +
    survivalRating * 0.22 +
    kastRating * 0.22 +
    aprRating * 0.1 +
    hsrRating * 0.04 +
    adrRating * 0.04;

  return +rating.toFixed(3);
};

// Static method to determine tier
playerSchema.statics.computeTier = function (rating) {
  if (rating >= 1.3) return "S";
  if (rating >= 1.1) return "A";
  if (rating >= 0.9) return "B";
  if (rating >= 0.7) return "C";
  return "D";
};

// Static method to determine role
playerSchema.statics.computeRole = function (stats) {
  const { kills, assists, headshots, damage, rounds } = stats;
  if (!rounds || rounds === 0) return "Lurker";

  const kpr = kills / rounds;
  const apr = assists / rounds;
  const hsr = kills > 0 ? (headshots / kills) * 100 : 0;
  const adr = damage / rounds;

  if (hsr > 55 && adr > 90) return "AWPer";
  if (kpr > 0.82 && apr < 0.28) return "Entry Fragger";
  if (apr > 0.45) return "Support";
  if (adr > 82 && kpr < 0.68) return "IGL";
  return "Lurker";
};

module.exports = mongoose.model("Player", playerSchema);
