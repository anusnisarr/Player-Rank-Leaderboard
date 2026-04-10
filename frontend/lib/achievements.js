// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS ENGINE
// Each achievement has:
//   id, icon, name, desc, flavor — the fun tooltip/roast text
//   rarity: "common" | "rare" | "epic" | "legendary"
//   check(player, matchHistory) → true/false
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [

  // ── Kills & Damage ──────────────────────────────────────────────────────────
  {
    id: "first_blood",
    icon: "🩸",
    name: "First Blood",
    desc: "Play your first match",
    flavor: "Everyone starts somewhere. Even you.",
    rarity: "common",
    check: (p) => p.matchesPlayed >= 1,
  },
  {
    id: "century",
    icon: "💯",
    name: "Century Club",
    desc: "Get 100 total kills",
    flavor: "100 kills. That's 100 people who had a bad day because of you.",
    rarity: "common",
    check: (p) => p.totalKills >= 100,
  },
  {
    id: "killing_machine",
    icon: "🤖",
    name: "Killing Machine",
    desc: "Get 500 total kills",
    flavor: "At this point you might want to seek help. Or a sponsor.",
    rarity: "rare",
    check: (p) => p.totalKills >= 500,
  },
  {
    id: "war_criminal",
    icon: "☠️",
    name: "War Criminal",
    desc: "Get 1000 total kills",
    flavor: "1000 kills. You have been reported to the Hague.",
    rarity: "epic",
    check: (p) => p.totalKills >= 1000,
  },
  {
    id: "headhunter",
    icon: "🎯",
    name: "Headhunter",
    desc: "Achieve 50%+ HS% career average",
    flavor: "Half your kills are headshots. The other half are accidents.",
    rarity: "rare",
    check: (p) => p.matchesPlayed >= 3 && (p.hsp || 0) >= 50,
  },
  {
    id: "laser_beam",
    icon: "🔫",
    name: "Laser Beam",
    desc: "Achieve 70%+ HS% career average",
    flavor: "You only aim for the head. Therapists call this 'tunnel vision'.",
    rarity: "epic",
    check: (p) => p.matchesPlayed >= 3 && (p.hsp || 0) >= 70,
  },
  {
    id: "demolition_man",
    icon: "💥",
    name: "Demolition Man",
    desc: "Deal 10,000 total damage",
    flavor: "10k damage dealt. That's approximately 40 people vaporized.",
    rarity: "rare",
    check: (p) => p.totalDamage >= 10000,
  },
  {
    id: "nuke",
    icon: "☢️",
    name: "Tactical Nuke",
    desc: "Deal 50,000 total damage",
    flavor: "You have caused more structural damage than a natural disaster.",
    rarity: "legendary",
    check: (p) => p.totalDamage >= 50000,
  },

  // ── Deaths & Suffering ──────────────────────────────────────────────────────
  {
    id: "bullet_sponge",
    icon: "🧽",
    name: "Bullet Sponge",
    desc: "Die 200 times total",
    flavor: "200 deaths. You're not a player, you're a spawn point.",
    rarity: "common",
    check: (p) => p.totalDeaths >= 200,
  },
  {
    id: "respawn_addict",
    icon: "👻",
    name: "Respawn Addict",
    desc: "Die 500 times total",
    flavor: "500 deaths. Scientists studying your playstyle call it 'bold strategy'.",
    rarity: "rare",
    check: (p) => p.totalDeaths >= 500,
  },
  {
    id: "kd_god",
    icon: "👑",
    name: "K/D God",
    desc: "Maintain 2.0+ K/D ratio",
    flavor: "2.0 K/D. You kill twice as many as you die. Statistically terrifying.",
    rarity: "epic",
    check: (p) => p.matchesPlayed >= 5 && (p.kd || 0) >= 2.0,
  },
  {
    id: "survivalist",
    icon: "🪖",
    name: "Survivalist",
    desc: "Maintain 1.5+ K/D ratio",
    flavor: "You die less than you kill. A rare trait in this friend group.",
    rarity: "rare",
    check: (p) => p.matchesPlayed >= 3 && (p.kd || 0) >= 1.5,
  },

  // ── Assists & Support ───────────────────────────────────────────────────────
  {
    id: "wingman",
    icon: "🤝",
    name: "Wingman",
    desc: "Get 100 total assists",
    flavor: "100 assists. You help others get kills while your own stats cry.",
    rarity: "common",
    check: (p) => p.totalAssists >= 100,
  },
  {
    id: "support_god",
    icon: "🛡️",
    name: "Support God",
    desc: "Get 300 total assists",
    flavor: "300 assists. You're the most helpful person on the server. No one will remember you.",
    rarity: "rare",
    check: (p) => p.totalAssists >= 300,
  },

  // ── Wins & Consistency ──────────────────────────────────────────────────────
  {
    id: "winner",
    icon: "🏆",
    name: "Winner",
    desc: "Win 10 matches",
    flavor: "10 wins. You've tasted victory enough to be dangerous.",
    rarity: "common",
    check: (p) => p.wins >= 10,
  },
  {
    id: "champion",
    icon: "🥇",
    name: "Champion",
    desc: "Win 50 matches",
    flavor: "50 wins. At this point the lobby fears your name in the list.",
    rarity: "epic",
    check: (p) => p.wins >= 50,
  },
  {
    id: "clutch_master",
    icon: "😤",
    name: "Clutch Master",
    desc: "Achieve 60%+ win rate (min 10 matches)",
    flavor: "60% win rate. You win more than you lose. Statistically suspicious.",
    rarity: "rare",
    check: (p) => p.matchesPlayed >= 10 && (p.winRate || 0) >= 60,
  },
  {
    id: "undefeatable",
    icon: "💎",
    name: "Undefeatable",
    desc: "Achieve 70%+ win rate (min 15 matches)",
    flavor: "70% win rate. Either you're incredible or your friends are bad. Probably both.",
    rarity: "legendary",
    check: (p) => p.matchesPlayed >= 15 && (p.winRate || 0) >= 70,
  },
  {
    id: "veteran",
    icon: "🎖️",
    name: "Veteran",
    desc: "Play 25 matches",
    flavor: "25 matches. You're officially committed to this madness.",
    rarity: "common",
    check: (p) => p.matchesPlayed >= 25,
  },
  {
    id: "grinder",
    icon: "⚙️",
    name: "Grinder",
    desc: "Play 50 matches",
    flavor: "50 matches. You could've learned a new skill. You chose this.",
    rarity: "rare",
    check: (p) => p.matchesPlayed >= 50,
  },

  // ── Score & Rank ────────────────────────────────────────────────────────────
  {
    id: "ranked_up",
    icon: "📈",
    name: "Ranked Up",
    desc: "Reach Fighter rank",
    flavor: "You escaped Rookie. The rest of the journey is uphill.",
    rarity: "common",
    check: (p) => ["Fighter","Soldier","Fragger","Fragmaster"].includes(p.rank),
  },
  {
    id: "soldier",
    icon: "⚡",
    name: "Battle Hardened",
    desc: "Reach Soldier rank",
    flavor: "Soldier rank. You're no longer the worst one in the lobby. Probably.",
    rarity: "common",
    check: (p) => ["Soldier","Fragger","Fragmaster"].includes(p.rank),
  },
  {
    id: "fragger",
    icon: "🔥",
    name: "Full Send",
    desc: "Reach Fragger rank",
    flavor: "Fragger. You go in first and somehow come out alive. Chaotic.",
    rarity: "rare",
    check: (p) => ["Fragger","Fragmaster"].includes(p.rank),
  },
  {
    id: "fragmaster",
    icon: "💀",
    name: "Fragmaster",
    desc: "Reach Fragmaster rank",
    flavor: "FRAGMASTER. You have achieved what others only dream of. Bow.",
    rarity: "legendary",
    check: (p) => p.rank === "Fragmaster",
  },

  // ── Special & Funny ─────────────────────────────────────────────────────────
  {
    id: "consistent",
    icon: "📊",
    name: "Mr. Consistent",
    desc: "Score between 40-60 for 5+ matches",
    flavor: "Perfectly average. Every. Single. Time. It's actually impressive.",
    rarity: "rare",
    check: (p, history) => {
      if (!history || history.length < 5) return false;
      const mid = history.filter(m => (m.score || 0) >= 40 && (m.score || 0) <= 60);
      return mid.length >= 5;
    },
  },
  {
    id: "comeback_kid",
    icon: "🔄",
    name: "Comeback Kid",
    desc: "Win a match after losing 3 in a row",
    flavor: "Lost 3, won 1. You don't quit. You're either brave or in denial.",
    rarity: "epic",
    check: (p, history) => {
      if (!history || history.length < 4) return false;
      for (let i = 3; i < history.length; i++) {
        const last3 = history.slice(i - 3, i);
        if (last3.every(m => !m.won) && history[i].won) return true;
      }
      return false;
    },
  },
  {
    id: "on_fire",
    icon: "🌋",
    name: "On Fire",
    desc: "Score 70+ in 3 consecutive matches",
    flavor: "Three high-score matches in a row. You're either in the zone or everyone else is AFK.",
    rarity: "epic",
    check: (p, history) => {
      if (!history || history.length < 3) return false;
      for (let i = 2; i < history.length; i++) {
        if (history[i].score >= 70 && history[i-1].score >= 70 && history[i-2].score >= 70) return true;
      }
      return false;
    },
  },
  {
    id: "participation",
    icon: "🎀",
    name: "Participation Award",
    desc: "Score under 20 in a match",
    flavor: "Under 20 pts. Hey, you showed up! That counts for something. (It doesn't.)",
    rarity: "common",
    check: (p, history) => history?.some(m => (m.score || 0) < 20),
  },
  {
    id: "unkillable",
    icon: "🧟",
    name: "Unkillable",
    desc: "Win a match with 0 deaths",
    flavor: "Zero deaths in a win. You are a ghost. A menace. A legend.",
    rarity: "legendary",
    check: (p, history) => history?.some(m => m.deaths === 0 && m.won),
  },
  {
    id: "sacrifice",
    icon: "✝️",
    name: "The Sacrifice",
    desc: "Die more than 20 times in one match",
    flavor: "20+ deaths in a match. You didn't play the game, you donated your body to science.",
    rarity: "rare",
    check: (p, history) => history?.some(m => (m.deaths || 0) >= 20),
  },
];

// RARITY config
export const RARITY_CONFIG = {
  common:    { color: "#A8A8BC", bg: "rgba(168,168,188,0.08)", border: "rgba(168,168,188,0.2)",  label: "Common"    },
  rare:      { color: "#4ECDC4", bg: "rgba(78,205,196,0.08)",  border: "rgba(78,205,196,0.2)",   label: "Rare"      },
  epic:      { color: "#FF6B35", bg: "rgba(255,107,53,0.08)",  border: "rgba(255,107,53,0.2)",   label: "Epic"      },
  legendary: { color: "#FFD700", bg: "rgba(255,215,0,0.08)",   border: "rgba(255,215,0,0.3)",    label: "Legendary" },
};

// ── Compute which achievements a player has unlocked ─────────────────────────
export function computeAchievements(player, matchHistory = []) {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: a.check(player, matchHistory),
  }));
}

// ── Count by rarity ──────────────────────────────────────────────────────────
export function achievementStats(achievements) {
  const unlocked = achievements.filter(a => a.unlocked);
  return {
    total:     achievements.length,
    unlocked:  unlocked.length,
    legendary: unlocked.filter(a => a.rarity === "legendary").length,
    epic:      unlocked.filter(a => a.rarity === "epic").length,
    rare:      unlocked.filter(a => a.rarity === "rare").length,
    common:    unlocked.filter(a => a.rarity === "common").length,
  };
}
