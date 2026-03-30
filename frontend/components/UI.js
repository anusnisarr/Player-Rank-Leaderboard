"use client";
import { RANK_CONFIG, getRankProgress, getScoreColor, getInitials } from "@/lib/utils";

// Rank badge — shows icon + label
export function RankBadge({ rank, size = "sm" }) {
  const cfg = RANK_CONFIG[rank] || RANK_CONFIG["Unranked"];
  const sizes = {
    xs: { fontSize: 10, padding: "1px 6px", gap: 3 },
    sm: { fontSize: 12, padding: "3px 9px", gap: 4 },
    md: { fontSize: 14, padding: "5px 12px", gap: 5 },
    lg: { fontSize: 18, padding: "7px 16px", gap: 6 },
  };
  const s = sizes[size] || sizes.sm;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: s.gap,
      background: cfg?.bg, border: `1px solid ${cfg?.border}`,
      borderRadius: 6, color: cfg?.color, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif", padding: s.padding, fontSize: s.fontSize,
      whiteSpace: "nowrap",
    }}>
      <span>{cfg?.icon}</span>
      <span>{rank}</span>
    </span>
  );
}

// Score display — big number with color
export function ScoreDisplay({ score, size = "md" }) {
  const color = getScoreColor(score);
  const sizes = { sm: 16, md: 22, lg: 32, xl: 44 };
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: sizes[size] || 22,
      fontWeight: 600, color,
      letterSpacing: "-0.02em",
    }}>
      {typeof score === "number" ? score.toFixed(0) : "0"}
    </span>
  );
}

// 
export function ScoreBar({ score, height = 4, showLabel = false }) {
  const { currentRank, nextRank, max, progress } = getRankProgress(score);
  const cfg = RANK_CONFIG[currentRank] || RANK_CONFIG["Unranked"];
  const nextCfg = nextRank ? RANK_CONFIG[nextRank] : null;

  return (
    <div>
      <div style={{ background: "#1E1E22", borderRadius: height, overflow: "hidden", height, position: "relative" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: cfg.color, borderRadius: height, transition: "width 0.5s ease" }} />
      </div>
{showLabel && (
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
    <span style={{ fontSize: 9, color: cfg.color, fontFamily: "'JetBrains Mono'", letterSpacing: "0.05em" }}>
      {cfg.icon} {currentRank}
    </span>
    {nextRank ? (
      <span style={{ fontSize: 9, color: "#A8A8BC", fontFamily: "'JetBrains Mono'" }}>
        {Math.round(progress)}% →{" "}
        <span style={{ color: nextCfg.color }}>{nextCfg.icon} {nextRank}</span>
      </span>
    ) : (
      <span style={{ fontSize: 9, color: cfg.color, fontFamily: "'JetBrains Mono'" }}>MAX RANK 👑</span>
    )}
  </div>
)}
    </div>
  );
}

// Player avatar — initials with rank color
export function PlayerAvatar({ name, size = 36, rank="Not Ranked" }) {
  const cfg = RANK_CONFIG[rank] || RANK_CONFIG["Unranked"];
  
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: cfg?.bg, border: `1.5px solid ${cfg?.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: size * 0.34, fontWeight: 600, color: cfg?.color, flexShrink: 0,
    }}>
      {getInitials(name || "??")}
    </div>
  );
}

// Rank number #1 #2 #3
export function RankNum({ rank }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const colors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
      color: colors[rank] || "#7A7A8C", minWidth: 28, display: "inline-block", textAlign: "center",
    }}>
      {medals[rank] || `#${rank}`}
    </span>
  );
}

// Stat chip — label + value inline
export function StatChip({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 40 }}>
      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 500, color: color || "#E8E8F0" }}>
        {value}
      </span>
      <span style={{ fontSize: 9, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'JetBrains Mono'", marginTop: 1 }}>
        {label}
      </span>
    </div>
  );
}

// Loading skeleton
export function Skeleton({ width = "100%", height = 16, radius = 4 }) {
  return (
    <div style={{ width, height, borderRadius: radius, background: "#1E1E22", flexShrink: 0 }} />
  );
}

// Empty state
export function EmptyState({ title, desc, action }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", color: "#7A7A8C" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E8F0", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: 20 }}>{desc}</div>
      {action}
    </div>
  );
}

// Filter pill button
export function FilterBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 5, fontSize: 12,
      fontWeight: active ? 600 : 400,
      color: active ? "#E8E8F0" : "#7A7A8C",
      background: active ? "#1E1E22" : "transparent",
      border: active ? "1px solid #3A3A42" : "1px solid transparent",
      cursor: "pointer", transition: "all 0.15s ease",
      fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}
