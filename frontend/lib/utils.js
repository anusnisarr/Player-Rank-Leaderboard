// ─── Rank config — simple, friend-group friendly ─────────────────────────────
export const RANK_CONFIG = {
  "Fragmaster": { color: "#FFD700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.35)", icon: "💀", min: 80 },
  "Fragger":    { color: "#FF6B35", bg: "rgba(255,107,53,0.12)", border: "rgba(255,107,53,0.35)", icon: "🔥", min: 65 },
  "Soldier":    { color: "#4ECDC4", bg: "rgba(78,205,196,0.12)", border: "rgba(78,205,196,0.35)", icon: "⚡", min: 50 },
  "Fighter":    { color: "#A8DADC", bg: "rgba(168,218,220,0.12)", border: "rgba(168,218,220,0.35)", icon: "🛡️", min: 35 },
  "Rookie":     { color: "#6C757D", bg: "rgba(108,117,125,0.12)", border: "rgba(108,117,125,0.35)", icon: "🌱", min: 0  },
};

export const RANK_ORDER = ["Fragmaster", "Fragger", "Soldier", "Fighter", "Rookie"];

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
  if (score >= 80) return "#FFD700";
  if (score >= 65) return "#FF6B35";
  if (score >= 50) return "#4ECDC4";
  if (score >= 35) return "#A8DADC";
  return "#6C757D";
}

// Score bar width %
export function getScoreBar(score) {
  return Math.min(100, Math.max(0, score));
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
