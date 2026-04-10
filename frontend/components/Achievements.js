"use client";
import { RARITY_CONFIG } from "@/lib/achievements";

// ── Single achievement card ───────────────────────────────────────────────────
export function AchievementCard({ achievement, size = "md" }) {
  const { unlocked, icon, name, desc, flavor, rarity } = achievement;
  const cfg = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  if (size === "sm") {
    return (
      <div title={`${name} — ${desc}\n"${flavor}"`}
        style={{
          width: 44, height: 44, borderRadius: 10,
          background: unlocked ? cfg.bg : "#0A0A0B",
          border: `1.5px solid ${unlocked ? cfg.border : "#1E1E22"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, cursor: "default",
          filter: unlocked ? "none" : "grayscale(1) opacity(0.3)",
          transition: "all 0.2s",
          flexShrink: 0,
        }}>
        {icon}
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 14px",
      borderRadius: 10,
      background: unlocked ? cfg.bg : "#0A0A0B",
      border: `1px solid ${unlocked ? cfg.border : "#1E1E22"}`,
      filter: unlocked ? "none" : "grayscale(1) opacity(0.4)",
      transition: "all 0.2s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Legendary shimmer */}
      {unlocked && rarity === "legendary" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: unlocked ? "#E8E8F0" : "#7A7A8C" }}>{name}</span>
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              {rarity}
            </span>
          </div>
          <div style={{ fontSize: 11, color: unlocked ? "#A8A8BC" : "#3A3A42", marginBottom: unlocked ? 6 : 0 }}>{desc}</div>
          {unlocked && (
            <div style={{ fontSize: 11, color: cfg.color, fontStyle: "italic", lineHeight: 1.5 }}>"{flavor}"</div>
          )}
          {!unlocked && (
            <div style={{ fontSize: 10, color: "#3A3A42", marginTop: 2 }}>🔒 Locked</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Achievement summary bar ───────────────────────────────────────────────────
export function AchievementSummary({ stats }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#E8E8F0", fontWeight: 600 }}>
        {stats.unlocked}<span style={{ color: "#3A3A42" }}>/{stats.total}</span>
      </div>
      {[
        { label: "Legendary", count: stats.legendary, color: RARITY_CONFIG.legendary.color },
        { label: "Epic",      count: stats.epic,      color: RARITY_CONFIG.epic.color },
        { label: "Rare",      count: stats.rare,      color: RARITY_CONFIG.rare.color },
        { label: "Common",    count: stats.common,    color: RARITY_CONFIG.common.color },
      ].map(({ label, count, color }) => count > 0 && (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 600, color }}>{count}</span>
          <span style={{ fontSize: 10, color: "#7A7A8C" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Full achievements grid ────────────────────────────────────────────────────
export function AchievementsGrid({ achievements }) {
  const order    = ["legendary", "epic", "rare", "common"];
  const unlocked = achievements.filter(a => a.unlocked);
  const locked   = achievements.filter(a => !a.unlocked);

  const sorted = [
    ...order.flatMap(r => unlocked.filter(a => a.rarity === r)),
    ...order.flatMap(r => locked.filter(a => a.rarity === r)),
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
      {sorted.map(a => <AchievementCard key={a.id} achievement={a} />)}
    </div>
  );
}
