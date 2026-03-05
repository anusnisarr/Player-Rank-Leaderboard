"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getPlayers } from "@/lib/api";
import { TIER_CONFIG, ROLE_CONFIG } from "@/lib/utils";
import { TierBadge, RoleBadge, PlayerAvatar, RatingDisplay, RankNum, EmptyState, FilterBtn, Skeleton } from "@/components/UI";
import toast from "react-hot-toast";

const TIERS = ["All", "Elite", "Strong", "Solid", "Average", "Developing"];
const ROLES = ["All", "Entry Fragger", "AWPer", "Support", "Lurker", "IGL"];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortField, setSortField] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { sort: sortField, order: sortOrder };
      if (tierFilter !== "All") params.tier = tierFilter;
      if (roleFilter !== "All") params.role = roleFilter;
      const res = await getPlayers(params);
      setPlayers(res.data.data);
    } catch {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  }, [tierFilter, roleFilter, sortField, sortOrder]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortOrder("desc"); }
  };

  const filtered = players.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.team?.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px, 8vw, 64px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
              LEADERBOARD
            </h1>
            <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
              {players.length} players ranked by performance
            </p>
          </div>
          <Link href="/add-match">
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 16px" }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Match
            </button>
          </Link>
        </div>
      </div>

      {/* Podium top 3 */}
      {!loading && top3.length >= 3 && (
        <div className="animate-slide stagger-2" style={{ marginBottom: 28 }}>

          {/* Mobile: horizontal ranked list */}
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[top3[0], top3[1], top3[2]].map((p, i) => {
                const cfg = TIER_CONFIG[p.tier] || TIER_CONFIG.D;
                const medals = ["🥇", "🥈", "🥉"];
                const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                return (
                  <Link key={p._id} href={`/player/${p._id}`} style={{ textDecoration: "none" }}>
                    <div
                      className="card"
                      style={{
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        position: "relative",
                        overflow: "hidden",
                        borderColor: i === 0 ? cfg.border : undefined,
                      }}
                    >
                      {/* Left accent bar for #1 */}
                      {i === 0 && (
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: cfg.color }} />
                      )}

                      {/* Medal */}
                      <div style={{ fontSize: 26, flexShrink: 0, marginLeft: i === 0 ? 6 : 0 }}>
                        {medals[i]}
                      </div>

                      {/* Avatar */}
                      <PlayerAvatar name={p.name} size={42} tier={p.tier} />

                      {/* Name + team */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#7A7A8C", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.team || "—"}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center" }}>
                          <TierBadge tier={p.tier} size="xs" />
                          <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                            {p.role}
                          </span>
                        </div>
                      </div>

                      {/* Right: rating + KD */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <RatingDisplay rating={p.rating} size="md" />
                        <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", marginTop: 1 }}>
                          RATING
                        </div>
                        <div style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", marginTop: 4 }}>
                          {p.kd} <span style={{ color: "#3A3A42" }}>K/D</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          ) : (
            /* Desktop: classic podium layout — 2nd | 1st | 3rd */
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr 1fr",
              gap: 12,
              alignItems: "end",
            }}>
              {[top3[1], top3[0], top3[2]].map((p, i) => {
                const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
                const cfg = TIER_CONFIG[p.tier] || TIER_CONFIG.D;
                const isFirst = actualRank === 1;
                const heights = { 0: "auto", 1: "auto", 2: "auto" };
                return (
                  <Link key={p._id} href={`/player/${p._id}`} style={{ textDecoration: "none" }}>
                    <div
                      className="card"
                      style={{
                        padding: "24px 14px 20px",
                        textAlign: "center",
                        cursor: "pointer",
                        transform: isFirst ? "translateY(-10px)" : "none",
                        borderColor: isFirst ? cfg.border : undefined,
                        position: "relative",
                        overflow: "hidden",
                        transition: "transform 0.2s ease, border-color 0.2s ease",
                      }}
                    >
                      {/* Top accent line for #1 */}
                      {isFirst && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: cfg.color }} />
                      )}

                      {/* Medal */}
                      <div style={{ fontSize: 28, marginBottom: 10 }}>
                        {["🥇", "🥈", "🥉"][actualRank - 1]}
                      </div>

                      {/* Avatar */}
                      <PlayerAvatar name={p.name} size={isFirst ? 52 : 44} tier={p.tier} />

                      {/* Name */}
                      <div style={{ marginTop: 10, fontWeight: 600, fontSize: isFirst ? 15 : 13, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </div>

                      {/* Team */}
                      <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.team || "—"}
                      </div>

                      {/* Rating */}
                      <div style={{ marginTop: 10 }}>
                        <RatingDisplay rating={p.rating} size={isFirst ? "lg" : "md"} />
                        <div style={{ fontSize: 9, color: "#7A7A8C", marginTop: 1, fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em" }}>
                          RATING
                        </div>
                      </div>

                      {/* Badges */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                        <TierBadge tier={p.tier} size="xs" />
                        <RoleBadge role={p.role} />
                      </div>

                      {/* Extra stats for #1 on desktop */}
                      {isFirst && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E22" }}>
                          {[
                            { label: "K/D", val: p.kd },
                            { label: "ADR", val: p.adr },
                            { label: "HS%", val: `${p.hsr}%` },
                          ].map(({ label, val }) => (
                            <div key={label} style={{ textAlign: "center" }}>
                              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#E8E8F0" }}>{val}</div>
                              <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", marginTop: 1 }}>{label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="animate-slide stagger-3" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="🔍  Search player or team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "100%" }}
        />
      </div>

      {/* Filters */}
      <div className="animate-slide stagger-3" style={{ marginBottom: 20 }}>
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 4, minWidth: "max-content" }}>
            <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "center", marginRight: 4 }}>Tier</span>
            {Object.entries(TIER_CONFIG).map(([key, val]) => (
              <FilterBtn key={key} color={val.color} label={key === "All" ? "All" : val.label} active={tierFilter === key} onClick={() => setTierFilter(key)} />
            ))}
            <div style={{ width: 1, background: "#1E1E22", margin: "0 6px" }} />
            <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "center", marginRight: 4 }}>Role</span>
            {ROLES.map((r) => (
              <FilterBtn key={r} label={r === "All" ? "All" : (ROLE_CONFIG[r]?.icon ? `${ROLE_CONFIG[r].icon} ${r.split(" ")[0]}` : r)} active={roleFilter === r} onClick={() => setRoleFilter(r)} />
            ))}
          </div>
        </div>
      </div>

      {/* Sort buttons (mobile) */}
      {isMobile && (
        <div style={{ marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 4, minWidth: "max-content" }}>
            <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", alignSelf: "center", marginRight: 4 }}>Sort</span>
            {[{ f: "rating", l: "Rating" }, { f: "totalKills", l: "Kills" }, { f: "matchesPlayed", l: "Matches" }, { f: "wins", l: "Wins" }].map(({ f, l }) => (
              <FilterBtn key={f} label={`${l}${sortField === f ? (sortOrder === "desc" ? " ↓" : " ↑") : ""}`} active={sortField === f} onClick={() => handleSort(f)} />
            ))}
          </div>
        </div>
      )}

      {/* Table / Cards */}
      <div className="card animate-slide stagger-4" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1E1E22" }}>
                <Skeleton width={20} height={14} />
                <Skeleton width={32} height={32} radius={6} />
                <Skeleton width={100} height={14} />
                <div style={{ marginLeft: "auto" }}><Skeleton width={50} height={14} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No players found" desc="Try adjusting your filters or add some players"
            action={<Link href="/add-player"><button className="btn-primary">Add Player</button></Link>}
          />
        ) : isMobile ? (
          /* Mobile card list */
          <div>
            {filtered.map((player, idx) => (
              <Link key={player._id} href={`/player/${player._id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s" }}
                  onTouchStart={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onTouchEnd={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ minWidth: 24, textAlign: "center" }}>
                    <RankNum rank={idx + 1} />
                  </div>
                  <PlayerAvatar name={player.name} size={38} tier={player.tier} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
                    <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 1, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span>{player.team || "—"}</span>
                      <TierBadge tier={player.tier} size="xs" />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <RatingDisplay rating={player.rating} size="sm" />
                    <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", marginTop: 1 }}>
                      {player.kd} K/D
                    </div>
                  </div>
                  <div style={{ color: "#3A3A42", fontSize: 12, flexShrink: 0 }}>›</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Desktop table */
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    { label: "#", field: null, w: 40 },
                    { label: "Player", field: null },
                    { label: "Rating", field: "rating" },
                    { label: "Tier", field: null },
                    { label: "Role", field: null },
                    { label: "K/D", field: "kd" },
                    { label: "KPR", field: null },
                    { label: "APR", field: null },
                    { label: "ADR", field: null },
                    { label: "HS%", field: null },
                    { label: "KAST", field: null },
                    { label: "M", field: "matchesPlayed" },
                    { label: "W/L", field: "wins" },
                  ].map(({ label, field, w }) => (
                    <th key={label}
                      onClick={field ? () => handleSort(field) : undefined}
                      style={{ padding: "10px 14px", color: field && sortField === field ? "#E8E8F0" : "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap", cursor: field ? "pointer" : "default", width: w, userSelect: "none" }}>
                      {label}{field && sortField === field ? (sortOrder === "desc" ? " ↓" : " ↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((player, idx) => (
                  <tr key={player._id} style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => window.location.href = `/player/${player._id}`}>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}><RankNum rank={idx + 1} /></td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={player.name} size={32} tier={player.tier} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13, color: "#E8E8F0" }}>{player.name}</div>
                          <div style={{ fontSize: 11, color: "#7A7A8C" }}>{player.team}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}><RatingDisplay rating={player.rating} size="sm" /></td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}><TierBadge tier={player.tier} /></td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}><RoleBadge role={player.role} /></td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>{player.kd}</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#A8DADC" }}>{player.kpr}</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#4ECDC4" }}>{player.apr}</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>{player.adr}</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>{player.hsr}%</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>{player.avgKast}%</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>{player.matchesPlayed}</td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 12 }}>
                      <span style={{ color: "#4ECDC4" }}>{player.wins}</span>
                      <span style={{ color: "#3A3A42" }}>/</span>
                      <span style={{ color: "#FF4655" }}>{player.losses}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="animate-slide stagger-5" style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: "#7A7A8C" }}>
          <span style={{ fontFamily: "'JetBrains Mono'", color: "#A8A8BC" }}>Tiers: </span>
          {Object.entries(TIER_CONFIG).map(([key, val]) => (
            <span key={key} style={{ color: val.color, marginRight: 8 }}>{val.label}</span>
          ))}
        </div>
      </div>

      <style>{`
        .podium-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 400px) {
          .podium-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
