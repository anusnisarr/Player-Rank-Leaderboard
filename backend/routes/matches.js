const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const Player = require("../models/Player");

// Recompute a player's career stats + score after any match change
async function recomputePlayerStats(playerId) {

  const matches = await Match.find({ "playerStats.player": playerId });

  let totalKills = 0, totalDeaths = 0, totalAssists = 0;
  let totalHeadshots = 0, totalDamage = 0, totalRounds = 0;
  let wins = 0, scoreSum = 0;
  const matchesPlayed = matches.length;

  for (const match of matches) {
    const s = match.playerStats.find(s => s.player.toString() === playerId.toString());
    if (!s) continue;

    totalKills += s.kills;
    totalDeaths += s.deaths;
    totalAssists += s.assists;
    totalHeadshots += s.headshots;
    totalDamage += s.damage;
    totalRounds += s.rounds;
    if (s.won) wins++;

    // Per-match score
    const score = Player.computeScore({
      kills: Number(s.kills) || 0,
      deaths: Number(s.deaths) || 0,
      assists: Number(s.assists) || 0,
      headshots: Number(s.headshots) || 0,
      damage: Number(s.damage) || 0,
      kast: Number(s.kast) || 70,
      rounds: Number(s.rounds) || 1,
    });
    scoreSum += score;
  }

  const score = matchesPlayed > 0 ? +(scoreSum / matchesPlayed).toFixed(1) : 0;
  const rank = Player.computeRank(score);

  await Player.findByIdAndUpdate(playerId, {
    totalKills, totalDeaths, totalAssists,
    totalHeadshots, totalDamage, totalRounds,
    matchesPlayed, wins, losses: matchesPlayed - wins,
    score, rank,
  });
}

// GET all matches
router.get("/", async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [matches, total] = await Promise.all([
      Match.find().sort({ date: -1 }).skip(skip).limit(Number(limit))
        .populate("playerStats.player", "name team"),
      Match.countDocuments(),
    ]);
    res.json({ success: true, data: matches, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single match
router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("playerStats.player", "name team avatar country");
    if (!match) return res.status(404).json({ success: false, error: "Match not found" });
    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create match
router.post("/", async (req, res) => {

  try {
    const { title, map, date, teamA, teamB, scoreA, scoreB, totalRounds, playerStats, notes } = req.body;

    if (!playerStats || playerStats.length === 0)
      return res.status(400).json({ success: false, error: "At least one player stat required" });

    // Enrich each player stat with computed fields
    const enriched = playerStats.map((s) => {
      
      const kills = Number(s.kills) || 0;
      const deaths = Number(s.deaths) || 0;
      const assists = Number(s.assists) || 0;
      const headshots = Number(s.headshots) || 0;
      const damage = Number(s.damage) || 0;
      const kast = Number(s.kast) || 70;
      const rounds = Number(totalRounds || s.rounds) || 1;

      const hsp = kills > 0 ? +((headshots / kills) * 100).toFixed(1) : 0;
      const adr = +(damage / rounds).toFixed(1);
      const kd = deaths > 0 ? +(kills / deaths).toFixed(2) : +kills.toFixed(2);
      const score = Player.computeScore({ kills, deaths, assists, headshots, damage, kast, rounds });

      return { ...s, kills, deaths, assists, headshots, damage, kast, rounds, hsp, adr, kd, score };

    });

    const match = await Match.create({ title, map, date, teamA, teamB, scoreA, scoreB, totalRounds, playerStats: enriched, notes });

    // Update all players' career stats
    const playerIds = [...new Set(playerStats.map(s => s.player))];
    await Promise.all(playerIds.map(recomputePlayerStats));

    const populated = await match.populate("playerStats.player", "name team avatar");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE match → recompute all affected players
router.delete("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, error: "Match not found" });
    const playerIds = [...new Set(match.playerStats.map(s => s.player.toString()))];
    await Match.findByIdAndDelete(req.params.id);
    await Promise.all(playerIds.map(recomputePlayerStats));
    res.json({ success: true, message: "Match deleted and stats recalculated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
