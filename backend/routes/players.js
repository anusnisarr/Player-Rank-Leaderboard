const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Match = require("../models/Match");

// GET all players (leaderboard)
router.get("/", async (req, res) => {
  try {
    const { sort = "rating", order = "desc", tier, role, team } = req.query;

    const filter = {};
    if (tier) filter.tier = tier;
    if (role) filter.role = role;
    if (team) filter.team = new RegExp(team, "i");

    const sortObj = {};
    const allowedSorts = ["rating", "totalKills", "matchesPlayed", "wins", "name"];
    sortObj[allowedSorts.includes(sort) ? sort : "rating"] =
      order === "asc" ? 1 : -1;

    const players = await Player.find(filter)
      .sort(sortObj)
      .select(
        "name team country avatar totalRounds totalKills totalDeaths totalAssists totalHeadshots totalDamage totalKast matchesPlayed wins losses rating tier role createdAt"
      );

    const playersWithVirtuals = players.map((p) => ({
      _id: p._id,
      name: p.name,
      team: p.team,
      country: p.country,
      avatar: p.avatar,
      matchesPlayed: p.matchesPlayed,
      wins: p.wins,
      losses: p.losses,
      rating: p.rating,
      tier: p.tier,
      role: p.role,
      kd: p.kd,
      kpr: p.kpr,
      dpr: p.dpr,
      apr: p.apr,
      hsr: p.hsr,
      adr: p.adr,
      avgKast: p.avgKast,
      winRate: p.winRate,
      totalKills: p.totalKills,
      totalDeaths: p.totalDeaths,
      totalAssists: p.totalAssists,
      createdAt: p.createdAt,
    }));

    res.json({ success: true, data: playersWithVirtuals, count: playersWithVirtuals.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single player with match history
router.get("/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ success: false, error: "Player not found" });

    const matches = await Match.find({ "playerStats.player": player._id })
      .sort({ date: -1 })
      .limit(20)
      .select("title map date scoreA scoreB teamA teamB totalRounds playerStats");

    const matchHistory = matches.map((m) => {
      const pStat = m.playerStats.find(
        (s) => s.player.toString() === player._id.toString()
      );
      return {
        _id: m._id,
        title: m.title,
        map: m.map,
        date: m.date,
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        teamA: m.teamA,
        teamB: m.teamB,
        totalRounds: m.totalRounds,
        kills: pStat?.kills,
        deaths: pStat?.deaths,
        assists: pStat?.assists,
        headshots: pStat?.headshots,
        damage: pStat?.damage,
        kast: pStat?.kast,
        won: pStat?.won,
        rating: pStat?.rating,
        kpr: pStat?.kpr,
        dpr: pStat?.dpr,
        hsr: pStat?.hsr,
        adr: pStat?.adr,
      };
    });

    res.json({
      success: true,
      data: {
        ...player.toObject({ virtuals: true }),
        matchHistory,
      },
    });
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
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Player name already exists" });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update player info
router.put("/:id", async (req, res) => {
  try {
    const { name, team, country, avatar } = req.body;
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { name, team, country, avatar },
      { new: true, runValidators: true }
    );
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
