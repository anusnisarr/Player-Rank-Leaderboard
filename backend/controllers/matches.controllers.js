import express from "express"
import Match from "../models/match.models.js";
import { sendPushToAll } from "./notifications.controllers.js";
import Player from "../models/player.models.js";
import { recomputePlayerStats } from "../utils/recomputePlayerStats.js";

// GET all matches
const getAllMatches = async (req, res) => {
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
};

// GET single match
const getSingleMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("playerStats.player", "name team avatar country");
    if (!match) return res.status(404).json({ success: false, error: "Match not found" });
    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST create match
const createMatch = async (req, res) => {

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
      const hsp = Number(s.hsp) || 0;
      const damage = Number(s.damage) || 0;
      const kast = Number(s.kast) || 70;
      const rounds = Number(totalRounds || s.rounds) || 1;
      const won = Boolean(s.won);

      const adr = +(damage / rounds).toFixed(1);
      const kd = deaths > 0 ? +(kills / deaths).toFixed(2) : +kills.toFixed(2);
      const score = Player.computeScore({ kills, deaths, assists, hsp, damage, rounds , won });

      return { ...s, kills, deaths, assists, headshots, damage, kast, rounds, adr, kd, score };

    });

    const match = await Match.create({ title, map, date, teamA, teamB, scoreA, scoreB, totalRounds, playerStats: enriched, notes });

    // Update all players' career stats
    const playerIds = [...new Set(playerStats.map(s => s.player))];
    await Promise.all(playerIds.map(recomputePlayerStats));

    // 🔔 Send notification to everyone
    await sendPushToAll(
      "🎮 New Match Added!",
      `${match.title} — rankings have been updated. Check the leaderboard!`,
      "/"
    );


    const populated = await match.populate("playerStats.player", "name team avatar");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE match → recompute all affected players
const deleteMatch = async (req, res) => {
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
};

export { getAllMatches, getSingleMatch, createMatch, deleteMatch };