"use client";
import { TIER_CONFIG, ROLE_CONFIG, getInitials, getRatingColor } from "@/lib/utils";

// Tier badge
export function TierBadge({ tier, size = "sm" }) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.D;
  const sizes = {
    xs: { fontSize: 10, padding: "1px 6px", minWidth: 22 },
    sm: { fontSize: 12, padding: "2px 8px", minWidth: 28 },
    md: { fontSize: 16, padding: "4px 12px", minWidth: 36 },
    lg: { fontSize: 24, padding: "8px 16px", minWidth: 52 },
  };
  const s = sizes[size] || sizes.sm;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 4,
        color: cfg.color,
        fontFamily: "'Bebas Neue', cursive",
        letterSpacing: "0.08em",
        fontWeight: 700,
        ...s,
      }}
    >
      {tier}
    </span>
  );
}

// Role badge
export function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || { icon: "👤", desc: "" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 4,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: 12,
        color: "#A8A8BC",
        whiteSpace: "nowrap",
      }}
    >
      <span>{cfg.icon}</span>
      <span>{role}</span>
    </span>
  );
}

// Player avatar
export function PlayerAvatar({ name, size = 36, tier }) {
  const initials = getInitials(name || "??");
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.D;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: size * 0.35,
        fontWeight: 500,
        color: cfg.color,
        flexShrink: 0,
        letterSpacing: "0.04em",
      }}
    >
      {initials}
    </div>
  );
}

// Stat pill
export function StatPill({ label, value, highlight }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 15,
          fontWeight: 500,
          color: highlight || "#E8E8F0",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#7A7A8C",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "'JetBrains Mono', monospace",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// Rating display
export function RatingDisplay({ rating, size = "md" }) {
  const color = getRatingColor(rating);
  const sizes = { sm: 16, md: 22, lg: 32, xl: 42 };
  const fs = sizes[size] || 22;
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: fs,
        fontWeight: 500,
        color,
        letterSpacing: "-0.02em",
      }}
    >
      {typeof rating === "number" ? rating.toFixed(2) : "0.00"}
    </span>
  );
}

// Loading skeleton
export function Skeleton({ width = "100%", height = 16, radius = 4 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1E1E22 25%, #2A2A2E 50%, #1E1E22 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// Rank number
export function RankNum({ rank }) {
  const colors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const color = colors[rank] || "#7A7A8C";
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        fontWeight: 500,
        color,
        minWidth: 24,
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
    </span>
  );
}

// Empty state
export function EmptyState({ title, desc, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
        color: "#7A7A8C",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: "#E8E8F0", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, marginBottom: 24 }}>{desc}</div>
      {action}
    </div>
  );
}

// Filter button
export function FilterBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: 5,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? "#E8E8F0" : "#7A7A8C",
        background: active ? "#1E1E22" : "transparent",
        border: active ? "1px solid #3A3A42" : "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// Sortable column header
export function SortHeader({ label, field, sortField, sortOrder, onSort }) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        color: active ? "#E8E8F0" : "#7A7A8C",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "10px 16px",
        textAlign: "left",
        borderBottom: "1px solid #1E1E22",
        whiteSpace: "nowrap",
        transition: "color 0.15s ease",
      }}
    >
      {label}
      {active && (
        <span style={{ marginLeft: 4, opacity: 0.7 }}>
          {sortOrder === "desc" ? "↓" : "↑"}
        </span>
      )}
    </th>
  );
}
