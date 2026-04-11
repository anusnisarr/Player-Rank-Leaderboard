import Playground   from "../models/Playground.js";
import PlayerStats  from "../models/PlayerStats.js";
import Player from "../models/player.models.js";
import Match  from "../models/match.models.js";
import bcrypt from "bcrypt";

// ── Generate unique 6-char code ───────────────────────────────────────────────
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    if (i === 3) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. "ALF-7X2"
}

async function uniqueCode() {
  let code, exists;
  do {
    code  = generateCode();
    exists = await Playground.findOne({ code });
  } while (exists);
  return code;
}

// ── Score formula ─────────────────────────────────────────────────────────────
function computeScore({ kills=0, deaths=0, assists=0, headshots=0, damage=0, rounds=1 }) {
  if (!rounds) return 0;
  const hsp = kills > 0 ? (headshots / kills) * 100 : 0;
  const adr  = damage / rounds;
  const raw  = (kills * 3) + (assists * 1.5) - (deaths * 2) + (hsp * 0.3) + (adr * 0.15);
  return +Math.min(100, Math.max(0, raw)).toFixed(1);
}

function computeRank(score) {
  if (score >= 80) return "Fragmaster";
  if (score >= 65) return "Fragger";
  if (score >= 50) return "Soldier";
  if (score >= 35) return "Fighter";
  return "Rookie";
}

// ── POST /api/playgrounds — Create ───────────────────────────────────────────
export const createPlayground = async (req, res) => {
  try {
    const { name, password, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "Name is required" });

    const code   = await uniqueCode();
    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const playground = await Playground.create({
      name: name.trim(),
      code,
      password: hashed,
      description: description?.trim() || "",
      owner:   req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({ success: true, data: playground });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── POST /api/playgrounds/join — Join by code ────────────────────────────────
export const joinPlayground = async (req, res) => {
  try {
    const { code, password } = req.body;
    if (!code) return res.status(400).json({ success: false, error: "Code is required" });

    const playground = await Playground.findOne({ code: code.toUpperCase().trim() });
    if (!playground) return res.status(404).json({ success: false, error: "Playground not found — check the code" });

    // Password check
    if (playground.password) {
      if (!password) return res.status(401).json({ success: false, error: "This playground is password protected" });
      const match = await bcrypt.compare(password, playground.password);
      if (!match) return res.status(401).json({ success: false, error: "Wrong password" });
    }

    // Already a member?
    if (playground.members.includes(req.user.id)) {
      return res.json({ success: true, data: playground, message: "Already a member" });
    }

    playground.members.push(req.user.id);
    await playground.save();

    res.json({ success: true, data: playground });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── GET /api/playgrounds/mine — My playgrounds ───────────────────────────────
export const getMyPlaygrounds = async (req, res) => {
  try {
    const playgrounds = await Playground.find({ members: req.user.id })
      .populate("owner", "username")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: playgrounds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── GET /api/playgrounds/:id — Single playground details ─────────────────────
export const getPlayground = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id)
      .populate("owner", "username")
      .populate("members", "username")
      .populate("pendingMembers", "username");

    if (!playground) return res.status(404).json({ success: false, error: "Not found" });

    // Must be a member to view
    const isMember = playground.members.some(m => m._id.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ success: false, error: "You are not a member of this playground" });

    res.json({ success: true, data: playground });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── GET /api/playgrounds/:id/leaderboard ─────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await PlayerStats.find({ playground: id })
      .populate("player", "name team country avatar")
      .sort({ score: -1 });

    const data = stats.map(s => ({
      _id:          s.player._id,
      name:         s.player.name,
      team:         s.player.team,
      country:      s.player.country,
      score:        s.score,
      rank:         s.rank,
      kd:           s.kd,
      hsp:          s.hsp,
      adr:          s.adr,
      winRate:      s.winRate,
      avgKills:     s.avgKills,
      avgDeaths:    s.avgDeaths,
      avgAssists:   s.avgAssists,
      avgDamage:    s.avgDamage,
      totalKills:   s.totalKills,
      totalDeaths:  s.totalDeaths,
      totalAssists: s.totalAssists,
      matchesPlayed: s.matchesPlayed,
      wins:         s.wins,
      losses:       s.losses,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── DELETE /api/playgrounds/:id/leave ────────────────────────────────────────
export const leavePlayground = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) return res.status(404).json({ success: false, error: "Not found" });

    if (playground.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: "Owner cannot leave — delete the playground instead" });
    }

    playground.members = playground.members.filter(m => m.toString() !== req.user.id);
    await playground.save();

    res.json({ success: true, message: "Left playground" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── DELETE /api/playgrounds/:id ──────────────────────────────────────────────
export const deletePlayground = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) return res.status(404).json({ success: false, error: "Not found" });
    if (playground.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Only the owner can delete this playground" });
    }

    await Playground.findByIdAndDelete(req.params.id);
    await PlayerStats.deleteMany({ playground: req.params.id });

    res.json({ success: true, message: "Playground deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Recompute player stats for a playground (called after match saved) ────────
export const recomputePlaygroundStats = async (playerId, playgroundId) => {
  const matches = await Match.find({
    playground: playgroundId,
    "playerStats.player": playerId,
  });

  let totalKills=0, totalDeaths=0, totalAssists=0;
  let totalHeadshots=0, totalDamage=0, totalRounds=0;
  let wins=0, scoreSum=0;
  const matchesPlayed = matches.length;

  for (const match of matches) {
    const s = match.playerStats.find(s => s.player.toString() === playerId.toString());
    if (!s) continue;
    totalKills     += s.kills;
    totalDeaths    += s.deaths;
    totalAssists   += s.assists;
    totalHeadshots += s.headshots;
    totalDamage    += s.damage;
    totalRounds    += s.rounds;
    if (s.won) wins++;
    scoreSum += computeScore({
      kills: Number(s.kills)||0, deaths: Number(s.deaths)||0,
      assists: Number(s.assists)||0, headshots: Number(s.headshots)||0,
      damage: Number(s.damage)||0, rounds: Number(s.rounds)||1,
    });
  }

  const score = matchesPlayed > 0 ? +(scoreSum / matchesPlayed).toFixed(1) : 0;
  const rank  = computeRank(score);

  await PlayerStats.findOneAndUpdate(
    { player: playerId, playground: playgroundId },
    { totalKills, totalDeaths, totalAssists, totalHeadshots, totalDamage, totalRounds, matchesPlayed, wins, losses: matchesPlayed - wins, score, rank },
    { upsert: true, new: true }
  );
};

// POST /api/playgrounds/request — request to join
export const requestJoin = async (req, res) => {
  try {
    const { code, password } = req.body;
    const playground = await Playground.findOne({ code: code.toUpperCase().trim() });
    if (!playground) return res.status(404).json({ success: false, error: "Playground not found" });

    if (playground.password) {
      if (!password) return res.status(401).json({ success: false, error: "Password required" });
      const match = await bcrypt.compare(password, playground.password);
      if (!match) return res.status(401).json({ success: false, error: "Wrong password" });
    }

    if (playground.members.includes(req.user.id))
      return res.json({ success: true, message: "Already a member" });

    if (playground.pendingMembers.includes(req.user.id))
      return res.json({ success: true, message: "Request already pending" });

    playground.pendingMembers.push(req.user.id);
    await playground.save();

    res.json({ success: true, message: "Join request sent — waiting for admin approval" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/playgrounds/:id/approve/:userId — owner approves
export const approveMember = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) return res.status(404).json({ success: false, error: "Not found" });
    if (playground.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, error: "Only owner can approve" });

    const userId = req.params.userId;
    playground.pendingMembers = playground.pendingMembers.filter(m => m.toString() !== userId);
    if (!playground.members.includes(userId)) playground.members.push(userId);
    await playground.save();

    res.json({ success: true, message: "Member approved" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/playgrounds/:id/reject/:userId — owner rejects
export const rejectMember = async (req, res) => {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) return res.status(404).json({ success: false, error: "Not found" });
    if (playground.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, error: "Only owner can reject" });

    playground.pendingMembers = playground.pendingMembers.filter(m => m.toString() !== req.params.userId);
    await playground.save();

    res.json({ success: true, message: "Member rejected" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};