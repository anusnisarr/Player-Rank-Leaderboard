const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const Player = require("../models/Player");

// Helper: recompute and update a player's aggregated stats
async function recomputePlayerStats(playerId) {
  const matches = await Match.find({ "playerStats.player": playerId });

  let totalRounds = 0,
    totalKills = 0,
    totalDeaths = 0,
    totalAssists = 0,
    totalHeadshots = 0,
    totalDamage = 0,
    totalKast = 0,
    wins = 0,
    matchesPlayed = matches.length;

  for (const match of matches) {
    const stat = match.playerStats.find(
      (s) => s.player.toString() === playerId.toString()
    );
    if (!stat) continue;
    totalRounds += stat.rounds;
    totalKills += stat.kills;
    totalDeaths += stat.deaths;
    totalAssists += stat.assists;
    totalHeadshots += stat.headshots;
    totalDamage += stat.damage;
    totalKast += stat.kast;
    if (stat.won) wins++;
  }

  const rating = Player.computeRating({
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    headshots: totalHeadshots,
    damage: totalDamage,
    rounds: totalRounds,
    kast: matchesPlayed > 0 ? totalKast / matchesPlayed : 0,
  });

  const tier = Player.computeTier(rating);
  const role = Player.computeRole({
    kills: totalKills,
    assists: totalAssists,
    headshots: totalHeadshots,
    damage: totalDamage,
    rounds: totalRounds,
  });

  await Player.findByIdAndUpdate(playerId, {
    totalRounds,
    totalKills,
    totalDeaths,
    totalAssists,
    totalHeadshots,
    totalDamage,
    totalKast,
    matchesPlayed,
    wins,
    losses: matchesPlayed - wins,
    rating,
    tier,
    role,
  });
}

// GET all matches
router.get("/", async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [matches, total] = await Promise.all([
      Match.find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("playerStats.player", "name team"),
      Match.countDocuments(),
    ]);

    res.json({ success: true, data: matches, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single match
router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate(
      "playerStats.player",
      "name team avatar country"
    );
    if (!match) return res.status(404).json({ success: false, error: "Match not found" });
    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create match with player stats
router.post("/", async (req, res) => {
  try {
    const { title, map, date, teamA, teamB, scoreA, scoreB, totalRounds, playerStats, notes } =
      req.body;

    if (!playerStats || playerStats.length === 0) {
      return res.status(400).json({ success: false, error: "At least one player stat is required" });
    }

    // Compute per-match stats for each player entry
    const enrichedStats = playerStats.map((s) => {
      const rounds = totalRounds || s.rounds || 1;
      const kpr = +(s.kills / rounds).toFixed(3);
      const dpr = +(s.deaths / rounds).toFixed(3);
      const apr = +(s.assists / rounds).toFixed(3);
      const hsr = s.kills > 0 ? +((s.headshots / s.kills) * 100).toFixed(1) : 0;
      const adr = +(s.damage / rounds).toFixed(1);
      const rating = Player.computeRating({
        kills: s.kills,
        deaths: s.deaths,
        assists: s.assists,
        headshots: s.headshots,
        damage: s.damage,
        rounds,
        kast: s.kast,
      });

      return { ...s, rounds, kpr, dpr, apr, hsr, adr, rating };
    });

    const match = await Match.create({
      title,
      map,
      date,
      teamA,
      teamB,
      scoreA,
      scoreB,
      totalRounds,
      playerStats: enrichedStats,
      notes,
    });

    // Update all players' aggregate stats
    const playerIds = [...new Set(playerStats.map((s) => s.player))];
    await Promise.all(playerIds.map(recomputePlayerStats));

    const populated = await match.populate("playerStats.player", "name team avatar");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE match and recompute stats
router.delete("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, error: "Match not found" });

    const playerIds = [...new Set(match.playerStats.map((s) => s.player.toString()))];
    await Match.findByIdAndDelete(req.params.id);
    await Promise.all(playerIds.map(recomputePlayerStats));

    res.json({ success: true, message: "Match deleted and stats updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
