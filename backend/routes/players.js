const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Match  = require("../models/Match");

// GET all players — leaderboard
router.get("/", async (req, res) => {
  try {
    const { sort = "score", order = "desc", rank, team } = req.query;
    const filter = {};
    if (rank) filter.rank = rank;
    if (team) filter.team = new RegExp(team, "i");

    const allowed = ["score", "totalKills", "matchesPlayed", "wins", "name"];
    const sortObj = { [allowed.includes(sort) ? sort : "score"]: order === "asc" ? 1 : -1 };

    const players = await Player.find(filter).sort(sortObj);

    const out = players.map(p => ({
      
      _id: p._id,
      name: p.name, team: p.team, country: p.country, avatar: p.avatar,
      matchesPlayed: p.matchesPlayed, wins: p.wins, losses: p.losses,
      score: p.score, rank: p.rank,
      kd: p.kd, hsp: p.hsp, adr: p.adr, winRate: p.winRate,
      avgKills: p.avgKills, avgDeaths: p.avgDeaths,
      avgAssists: p.avgAssists, avgDamage: p.avgDamage,
      totalKills: p.totalKills, totalDeaths: p.totalDeaths,
      totalAssists: p.totalAssists, createdAt: p.createdAt,
    }));

    res.json({ success: true, data: out, count: out.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single player + match history
router.get("/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ success: false, error: "Player not found" });

    const matches = await Match.find({ "playerStats.player": player._id })
      .sort({ date: -1 }).limit(20)
      .select("title map date scoreA scoreB teamA teamB totalRounds playerStats");

    const matchHistory = matches.map(m => {
      const s = m.playerStats.find(s => s.player.toString() === player._id.toString());
      return {
        _id: m._id, title: m.title, map: m.map, date: m.date,
        scoreA: m.scoreA, scoreB: m.scoreB, teamA: m.teamA, teamB: m.teamB,
        kills: s?.kills, deaths: s?.deaths, assists: s?.assists,
        headshots: s?.headshots, damage: s?.damage,
        hsp: s?.hsp, adr: s?.adr, kd: s?.kd,
        score: s?.score, won: s?.won,
      };
    });

    res.json({ success: true, data: { ...player.toObject({ virtuals: true }), matchHistory } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create player
router.post("/", async (req, res) => {
  try {
    const { name, team, country, avatar } = req.body;
    const player = await Player.create({ name, team, country, avatar });
    res.status(201).json({ success: true, data: player });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: "Player name already exists" });
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update player info
router.put("/:id", async (req, res) => {
  try {
    const { name, team, country, avatar } = req.body;
    const player = await Player.findByIdAndUpdate(req.params.id, { name, team, country, avatar }, { new: true, runValidators: true });
    if (!player) return res.status(404).json({ success: false, error: "Player not found" });
    res.json({ success: true, data: player });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE player
router.delete("/:id", async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ success: false, error: "Player not found" });
    res.json({ success: true, message: "Player deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
