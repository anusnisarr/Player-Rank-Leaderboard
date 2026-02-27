"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getPlayers } from "@/lib/api";
import { TIER_CONFIG, ROLE_CONFIG, formatRating } from "@/lib/utils";
import {
  TierBadge, RoleBadge, PlayerAvatar, RatingDisplay,
  RankNum, EmptyState, FilterBtn, SortHeader, Skeleton
} from "@/components/UI";
import toast from "react-hot-toast";

const TIERS = ["All", "S", "A", "B", "C", "D"];
const ROLES = ["All", "Entry Fragger", "AWPer", "Support", "Lurker", "IGL"];
const SORTS = [
  { field: "rating", label: "Rating" },
  { field: "totalKills", label: "Kills" },
  { field: "matchesPlayed", label: "Matches" },
  { field: "wins", label: "Wins" },
];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortField, setSortField] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");

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

  // Top 3 for hero section
  const top3 = filtered.slice(0, 3);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(40px, 6vw, 64px)",
                letterSpacing: "0.04em",
                color: "#E8E8F0",
                lineHeight: 1,
              }}
            >
              LEADERBOARD
            </h1>
            <p style={{ color: "#7A7A8C", fontSize: 14, marginTop: 6 }}>
              {players.length} players ranked by performance
            </p>
          </div>
          <Link href="/add-match">
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Match
            </button>
          </Link>
        </div>
      </div>

      {/* Podium - top 3 */}
      {!loading && top3.length >= 3 && (
        <div
          className="animate-slide stagger-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr 1fr",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[top3[1], top3[0], top3[2]].map((p, i) => {
            const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const cfg = TIER_CONFIG[p.tier] || TIER_CONFIG.D;
            const isFirst = actualRank === 1;
            return (
              <Link key={p._id} href={`/player/${p._id}`} style={{ textDecoration: "none" }}>
                <div
                  className="card"
                  style={{
                    padding: "24px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transform: isFirst ? "translateY(-8px)" : "none",
                    borderColor: isFirst ? cfg.border : undefined,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {isFirst && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: cfg.color,
                      }}
                    />
                  )}
                  <div style={{ fontSize: 28, marginBottom: 12 }}>
                    {["🥇", "🥈", "🥉"][actualRank - 1]}
                  </div>
                  <PlayerAvatar name={p.name} size={52} tier={p.tier} />
                  <div style={{ marginTop: 12, fontWeight: 600, fontSize: 15, color: "#E8E8F0" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#7A7A8C", marginTop: 2 }}>{p.team}</div>
                  <div style={{ marginTop: 12 }}>
                    <RatingDisplay rating={p.rating} size="lg" />
                    <div style={{ fontSize: 10, color: "#7A7A8C", marginTop: 2, fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em" }}>
                      RATING
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                    <TierBadge tier={p.tier} />
                    <RoleBadge role={p.role} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Filters + search */}
      <div
        className="animate-slide stagger-3"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <input
          className="input"
          placeholder="Search player or team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TIERS.map((t) => (
            <FilterBtn
              key={t}
              label={t === "All" ? "All Tiers" : `Tier ${t}`}
              active={tierFilter === t}
              onClick={() => setTierFilter(t)}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ROLES.map((r) => (
            <FilterBtn
              key={r}
              label={r === "All" ? "All Roles" : `${ROLE_CONFIG[r]?.icon || ""} ${r}`}
              active={roleFilter === r}
              onClick={() => setRoleFilter(r)}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card animate-slide stagger-4" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1E1E22" }}>
                <Skeleton width={24} height={16} />
                <Skeleton width={36} height={36} radius={8} />
                <Skeleton width={120} height={16} />
                <Skeleton width={60} height={16} />
                <Skeleton width={40} height={16} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No players found"
            desc="Try adjusting your filters or add some players"
            action={
              <Link href="/add-player">
                <button className="btn-primary">Add Player</button>
              </Link>
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22", width: 40 }}>
                    #
                  </th>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>
                    Player
                  </th>
                  <SortHeader label="Rating" field="rating" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>Tier</th>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>Role</th>
                  <SortHeader label="K/D" field="kd" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>KPR</th>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>APR</th>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>ADR</th>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>HS%</th>
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>KAST</th>
                  <SortHeader label="Matches" field="matchesPlayed" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                  <th style={{ padding: "10px 16px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1E1E22" }}>W/L</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player, idx) => (
                  <tr
                    key={player._id}
                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => window.location.href = `/player/${player._id}`}
                  >
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <RankNum rank={idx + 1} />
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={player.name} size={34} tier={player.tier} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14, color: "#E8E8F0" }}>{player.name}</div>
                          <div style={{ fontSize: 12, color: "#7A7A8C" }}>{player.team}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <RatingDisplay rating={player.rating} size="sm" />
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <TierBadge tier={player.tier} />
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <RoleBadge role={player.role} />
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      {player.kd}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#A8DADC" }}>
                      {player.kpr}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#4ECDC4" }}>
                      {player.apr}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      {player.adr}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      {player.hsr}%
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      {player.avgKast}%
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      {player.matchesPlayed}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      <span style={{ color: "#4ECDC4" }}>{player.wins}</span>
                      <span style={{ color: "#3A3A42" }}> / </span>
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
      <div
        className="animate-slide stagger-5"
        style={{ marginTop: 32, display: "flex", gap: 24, flexWrap: "wrap" }}
      >
        <div style={{ fontSize: 12, color: "#7A7A8C" }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 500, color: "#A8A8BC" }}>Tier Legend: </span>
          {Object.entries(TIER_CONFIG).map(([key, val]) => (
            <span key={key} style={{ color: val.color, marginRight: 12 }}>
              {key} ({val.label})
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#7A7A8C" }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 500, color: "#A8A8BC" }}>Rating: </span>
          Rating 2.0 formula (kills, survival, KAST, assists, HS%, ADR)
        </div>
      </div>
    </div>
  );
}
