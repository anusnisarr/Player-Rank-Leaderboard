export const TIER_CONFIG = {
  All : { color: "#E8E8F0", bg: "#1E1E22",  border: "#3A3A42", label: "All" },
  Elite: { color: "#FFD700", bg: "rgba(255,215,0,0.1)", border: "rgba(255,215,0,0.3)", label: "Elite" },
  Strong: { color: "#FF6B35", bg: "rgba(255,107,53,0.1)", border: "rgba(255,107,53,0.3)", label: "Strong" },
  Solid: { color: "#4ECDC4", bg: "rgba(78,205,196,0.1)", border: "rgba(78,205,196,0.3)", label: "Solid" },
  Average: { color: "#A8DADC", bg: "rgba(168,218,220,0.1)", border: "rgba(168,218,220,0.3)", label: "Average" },
  S: { color: "#6C757D", bg: "rgba(108,117,125,0.1)", border: "rgba(108,117,125,0.3)", label: "Developing" },
};

export const ROLE_CONFIG = {
  "Entry Fragger": { icon: "⚡", desc: "First in, high risk" },
  "Support": { icon: "🛡️", desc: "Team utility & assists" },
  "AWPer": { icon: "🎯", desc: "High-impact sniper" },
  "Lurker": { icon: "👤", desc: "Flanker & rotator" },
  "IGL": { icon: "🧠", desc: "In-game leader" },
};

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

export function formatRating(r) {
  return typeof r === "number" ? r.toFixed(2) : "0.00";
}

export function getRatingColor(rating) {
  if (rating >= 1.3) return "#FFD700";
  if (rating >= 1.1) return "#FF6B35";
  if (rating >= 0.9) return "#4ECDC4";
  if (rating >= 0.7) return "#A8DADC";
  return "#6C757D";
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}
