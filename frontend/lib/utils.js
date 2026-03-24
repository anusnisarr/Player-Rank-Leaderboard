// ─── Rank config — simple, friend-group friendly ─────────────────────────────
export const RANK_CONFIG = {
  "Bronze": { color: "#CD7F32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.35)", icon: "🥉", scoreRange : "0 - 40 score" },
  "Silver": { color: "#C0C0C0", bg: "rgba(192,192,192,0.12)", border: "rgba(192,192,192,0.35)", icon: "🥈", scoreRange : "40 - 55 score" },
  "Gold": { color: "#FFD700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.35)", icon: "🥇", scoreRange : "55 - 70 score" },
  "Platinum": { color: "#FF6B35", bg: "rgba(255,107,53,0.12)", border: "rgba(255,107,53,0.35)", icon: "🔥", scoreRange : "70 - 85 score" },
  "Elite": { color: "#FFD700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.35)", icon: "💀",  scoreRange : "85 - 100 score" },
  "Master": { color: "#FFD700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.35)", icon: "👑",  scoreRange : "100+ score " },
};

// export const RANK_ORDER = ["Fragmaster", "Fragger", "Soldier", "Fighter", "Bronze"];
export const RANK_ORDER = ["Bronze", "Silver", "Gold", "Platinum", "Elite" , "Master"];

export const MAPS = [
  "Mirage", "Dust 2", "Inferno", "Nuke", "Overpass",
  "Ancient", "Anubis", "Vertigo", "Cache", "Train",
];

export const COUNTRIES = [
  "🇦🇺 Australia", "🇧🇷 Brazil", "🇨🇦 Canada", "🇩🇰 Denmark",
  "🇫🇷 France", "🇩🇪 Germany", "🇵🇱 Poland", "🇷🇺 Russia",
  "🇸🇪 Sweden", "🇺🇸 United States", "🇵🇰 Pakistan", "🇬🇧 United Kingdom",
  "🇳🇱 Netherlands", "🇫🇮 Finland", "🇨🇿 Czech Republic", "Other",
];

// Score → color
export function getScoreColor(score) {
  if (score >= 260) return "#FFD700";
  if (score >= 190) return "#FF6B35";
  if (score >= 130) return "#4ECDC4";
  if (score >= 80) return "#A8DADC";
  if (score >= 40) return "#C0C0C0";
  return "#6C757D";
}

// Score bar width %
export function getScoreBar(score) {  
  return Math.min(111, Math.max(0, score));
}

// Returns { current, next, min, max, progress }
export function getRankProgress(score) {
  const order = ["Bronze", "Silver", "Gold", "Platinum", "Elite", "Master"];
  const mins   = { Bronze: 0, Silver: 40, Gold: 55, Platinum: 70, Elite: 85, Master: 100 };

  const currentRank = order.findLast(r => score >= mins[r]) || "Bronze";
  const currentIdx  = order.indexOf(currentRank);
  const nextRank    = order[currentIdx + 1] || null;

  const min      = mins[currentRank];
  const max      = nextRank ? mins[nextRank] : 100;
  const progress = nextRank
    ? Math.min(100, ((score - min) / (max - min)) * 100)
    : 100; // already at max rank

  return { currentRank, nextRank, min, max, progress, score };
}

export function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// Per-match score preview (same formula as backend)
export function calcMatchScore({ kills, deaths, assists, headshots, damage, rounds }) {
  if (!rounds || rounds === 0) return 0;
  const hsp = kills > 0 ? (headshots / kills) * 100 : 0;
  const adr = damage / rounds;
  const raw = (kills * 3) + (assists * 1.5) - (deaths * 2) + (hsp * 0.3) + (adr * 0.15);
  return +Math.min(100, Math.max(0, (raw / 100) * 100)).toFixed(1);
}

 export const combineDateTime = (match) => {
    const base = new Date(match.date);
    const time = new Date(match.createdAt);

    base.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds()
    );

    return base;
  }

 export const sortMatchesByDateAndTime = (matches) => {
    return matches.sort((a, b) => combineDateTime(b) - combineDateTime(a));
  }