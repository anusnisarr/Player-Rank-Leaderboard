import Match from "../models/match.models.js";
import Player from "../models/player.models.js";

// Recompute a player's career stats + score after any match change
export const recomputePlayerStats = async (playerId) => {

  const oldPlayer = await Player.findById(playerId);
  const oldRank   = oldPlayer.rank;

  const matches = await Match.find({ "playerStats.player": playerId });

  const lastMatches = matches
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 5);

  let totalKills = 0, totalDeaths = 0, totalAssists = 0;
  let totalHeadshots = 0, totalDamage = 0, totalRounds = 0;
  let wins = 0, scoreSum = 0, recentScoreSum = 0;

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
    const score = await Player.computeScore({
      kills: Number(s.kills) || 0,
      deaths: Number(s.deaths) || 0,
      assists: Number(s.assists) || 0,
      headshots: Number(s.headshots) || 0,
      damage: Number(s.damage) || 0,
      rounds: Number(s.rounds) || 1,
      won: Boolean(s.won),
    });
    scoreSum += score;
    
    await Match.findOneAndUpdate(
      { _id: match._id, "playerStats.player": playerId },
      { "playerStats.$.score": score }
    );

  }

  //recent 5 matches score sum for rank calculation
for (const match of lastMatches) {
  const s = match.playerStats.find(s => s.player.toString() === playerId.toString());
  if (!s) continue;

//recent 5 matches score sum for rank calculation
  const score = await Player.computeScore({
    kills: Number(s.kills) || 0,
    deaths: Number(s.deaths) || 0,
    assists: Number(s.assists) || 0,
    headshots: Number(s.headshots) || 0,
    damage: Number(s.damage) || 0,
    rounds: Number(s.rounds) || 1,
    won: Boolean(s.won),
  });
  recentScoreSum += score;
}

  // const avgScore = matchesPlayed > 0 ? +(scoreSum / matchesPlayed).toFixed(1) : 0;

  const avgScore = lastMatches.length > 0
  ? +(recentScoreSum / lastMatches.length).toFixed(0)
  : 0;


  const rank = matches.length >= 5 ? Player.computeRank(avgScore) : "Unranked";

  await Player.findByIdAndUpdate(playerId, {
    totalKills, totalDeaths, totalAssists,
    totalHeadshots, totalDamage, totalRounds,
    matchesPlayed, wins, losses: matchesPlayed - wins,
    avgScore: avgScore, score:scoreSum, rank,
  });

  if (rank !== oldRank) {
  const rankOrder = ["Unranked", "Bronze", "Silver", "Gold", "Platinum", "Elite" , "Master"];
  if (rankOrder.indexOf(rank) > rankOrder.indexOf(oldRank)) {
    await sendPushToAll(
      `🏆 Rank Up!`,
      `${oldPlayer.name} just ranked up to ${rank}!`,

      );
    }
  }
}
