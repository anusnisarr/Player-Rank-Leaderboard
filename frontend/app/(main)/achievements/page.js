"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
// import { getPlayers, getPlayer } from "@/lib/api";
import { usePlaygroundApi } from "@/lib/usePlaygroundApi";
import { computeAchievements, achievementStats, ACHIEVEMENTS, RARITY_CONFIG } from "@/lib/achievements";
import { AchievementCard, AchievementSummary, AchievementsGrid } from "@/components/Achievements";
import { PlayerAvatar, RankBadge } from "@/components/UI";
import toast from "react-hot-toast";

export default function AchievementsPage() {
  const { getPlayers , getPlayer, active } = usePlaygroundApi();
  const [players, setPlayers]   = useState([]);
  const [selected, setSelected] = useState(null); // player with full data
  const [loading, setLoading]   = useState(true);
  const [loadingP, setLoadingP] = useState(false);
  const [filter, setFilter]     = useState("all"); // "all" | "unlocked" | "locked" | rarity

  useEffect(() => {
    getPlayers({}).then(r => {
      setPlayers(r.data.data);
      // Auto-select first player
      if (r.data.data.length > 0) selectPlayer(r.data.data[0]._id);
    }).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [active]);

  const selectPlayer = async (id) => {
    setLoadingP(true);
    try {
      const r = await getPlayer(id);
      setSelected(r.data.data);
    } catch { toast.error("Failed to load player"); }
    finally { setLoadingP(false); }
  };

  const achievements = selected
    ? computeAchievements(selected, selected.matchHistory || [])
    : [];

  const stats = selected ? achievementStats(achievements) : null;

  const filtered = achievements.filter(a => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked")   return !a.unlocked;
    if (["legendary","epic","rare","common"].includes(filter)) return a.rarity === filter;
    return true;
  });

  const FilterBtn = ({ label, value, count }) => (
    <button onClick={() => setFilter(value)}
      style={{
        padding: "5px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer",
        fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap",
        fontWeight: filter === value ? 600 : 400,
        color: filter === value ? "#E8E8F0" : "#7A7A8C",
        background: filter === value ? "#1E1E22" : "transparent",
        border: filter === value ? "1px solid #3A3A42" : "1px solid transparent",
      }}>
      {label}{count !== undefined ? ` (${count})` : ""}
    </button>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Header ── */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(28px, 8vw, 56px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
          ACHIEVEMENTS
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
          {ACHIEVEMENTS.length} achievements · earn them by playing and suffering
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }} className="achievements-layout">

        {/* ── Left: player list ── */}
        <div>
          <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Select Player</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {loading ? (
              <div style={{ color: "#7A7A8C", fontSize: 12, padding: 10 }}>Loading...</div>
            ) : players.map(p => {
              const isActive = selected?._id === p._id;
              // Quick achievement count from basic player data
              const quick = computeAchievements(p, []);
              const qStats = achievementStats(quick);
              return (
                <div key={p._id} onClick={() => selectPlayer(p._id)}
                  className="card"
                  style={{
                    padding: "10px 12px", cursor: "pointer",
                    borderColor: isActive ? "#FF4655" : undefined,
                    background: isActive ? "rgba(255,70,85,0.05)" : undefined,
                    transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PlayerAvatar name={p.name} size={30} rank={p.rank} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                        {qStats.unlocked}/{qStats.total} unlocked
                      </div>
                    </div>
                  </div>
                  {/* Mini badge row */}
                  {qStats.legendary > 0 && (
                    <div style={{ marginTop: 6, fontSize: 10, color: RARITY_CONFIG.legendary.color, fontFamily: "'JetBrains Mono'" }}>
                      ✦ {qStats.legendary} Legendary
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: achievements ── */}
        <div>
          {loadingP ? (
            <div style={{ color: "#7A7A8C", fontSize: 13, padding: 40, textAlign: "center" }}>Loading achievements...</div>
          ) : selected ? (
            <>
              {/* Player header */}
              <div className="card" style={{ padding: "16px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <PlayerAvatar name={selected.name} size={48} rank={selected.rank} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: "#E8E8F0", letterSpacing: "0.04em" }}>{selected.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <RankBadge rank={selected.rank} size="sm" />
                      {stats && <AchievementSummary stats={stats} />}
                    </div>
                  </div>
                  <Link href={`/player/${selected._id}`}>
                    <button className="btn-ghost" style={{ fontSize: 11 }}>View Profile →</button>
                  </Link>
                </div>

                {/* Progress bar */}
                {stats && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase" }}>Completion</span>
                      <span style={{ fontSize: 10, color: "#E8E8F0", fontFamily: "'JetBrains Mono'" }}>
                        {Math.round(stats.unlocked / stats.total * 100)}%
                      </span>
                    </div>
                    <div style={{ background: "#1E1E22", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${stats.unlocked / stats.total * 100}%`, height: "100%", background: "linear-gradient(90deg, #4ECDC4, #FFD700)", borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
                <FilterBtn label="All"       value="all"       count={achievements.length} />
                <FilterBtn label="✅ Unlocked" value="unlocked" count={achievements.filter(a=>a.unlocked).length} />
                <FilterBtn label="🔒 Locked"  value="locked"   count={achievements.filter(a=>!a.unlocked).length} />
                <div style={{ width: 1, background: "#1E1E22", margin: "0 4px" }} />
                {["legendary","epic","rare","common"].map(r => (
                  <FilterBtn key={r} label={`${RARITY_CONFIG[r].label}`} value={r} />
                ))}
              </div>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#7A7A8C", fontSize: 13 }}>
                  No achievements in this filter
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {filtered.map(a => <AchievementCard key={a.id} achievement={a} />)}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 60, color: "#7A7A8C" }}>Select a player to see their achievements</div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .achievements-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
