"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getPlayers } from "@/lib/api";
import { RANK_CONFIG, RANK_ORDER, getScoreColor } from "@/lib/utils";
import { RankBadge, ScoreDisplay, ScoreBar, PlayerAvatar, RankNum, EmptyState, FilterBtn, Skeleton } from "@/components/UI";
import toast from "react-hot-toast";

export default function LeaderboardPage() {
  const [players, setPlayers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [rankFilter, setRankFilter] = useState("All");
  const [sortField, setSortField]   = useState("score");
  const [sortOrder, setSortOrder]   = useState("desc");
  const [search, setSearch]         = useState("");
  const [isMobile, setIsMobile]     = useState(false);

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
      if (rankFilter !== "All") params.rank = rankFilter;
      const res = await getPlayers(params);
      setPlayers(res.data.data);
    } catch {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  }, [rankFilter, sortField, sortOrder]);

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

  const TD = ({ children, color }) => (
    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: color || "#E8E8F0" }}>
      {children}
    </td>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Header ── */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px, 8vw, 60px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
              LEADERBOARD
            </h1>
            <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
              {players.length} players · ranked by Performance Score
            </p>
          </div>
          <Link href="/add-match">
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              Add Match
            </button>
          </Link>
        </div>
      </div>

      {/* ── Score formula explainer ── */}
      <div className="animate-slide stagger-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1E1E22", borderRadius: 8, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase" }}>Score Formula</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Kill",   val: "+3 pts",    color: "#4ECDC4" },
            { label: "Assist", val: "+1.5 pts",  color: "#A8DADC" },
            { label: "Death",  val: "−2 pts",    color: "#FF4655" },
            { label: "Headshot%",    val: "×0.2 pts",  color: "#FFD700" },
            { label: "Average Damage Round",   val: "×0.05 pts", color: "#FF6B35" },
            { label: "Kill-Death Ratio",   val: "×5 pts", color: "#4ECDC4" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "'JetBrains Mono'" }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RANK_ORDER.map(r => (
            <span key={r} style={{ fontSize: 11, color: RANK_CONFIG[r].color, fontFamily: "'JetBrains Mono'" }}>
              {RANK_CONFIG[r].icon} {r}
            </span>
          ))}
        </div>
      </div>

      {/* ── Podium top 3 ── */}
      {!loading && top3.length >= 3 && (
        <div className="animate-slide stagger-2" style={{ marginBottom: 28 }}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {top3.map((p, i) => {
                const cfg = RANK_CONFIG[p.rank] || RANK_CONFIG["Rookie"];
                return (
                  <Link key={p._id} href={`/player/${p._id}`} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden", borderColor: i === 0 ? cfg.border : undefined }}>
                      {i === 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: cfg.color }} />}
                      <div style={{ fontSize: 24, flexShrink: 0, marginLeft: i === 0 ? 4 : 0 }}>{["🥇","🥈","🥉"][i]}</div>
                      <PlayerAvatar name={p.name} size={42} rank={p.rank} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 1 }}>{p.team || "—"}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center" }}>
                          <RankBadge rank={p.rank} size="xs" />
                          <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{p.kd} K/D</span>
                          <span style={{ fontSize: 11, color: "#FFD700", fontFamily: "'JetBrains Mono'" }}>{p.hsp}% HS</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <ScoreDisplay score={p.score} size="lg" />
                        <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", marginTop: 1 }}>SCORE</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.12fr 1fr", gap: 12, alignItems: "end" }}>
              {[top3[1], top3[0], top3[2]].map((p, i) => {
                const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
                const cfg = RANK_CONFIG[p.rank] || RANK_CONFIG["Rookie"];
                const isFirst = actualRank === 1;
                return (
                  <Link key={p._id} href={`/player/${p._id}`} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: "24px 14px 20px", textAlign: "center", cursor: "pointer", transform: isFirst ? "translateY(-10px)" : "none", borderColor: isFirst ? cfg.border : undefined, position: "relative", overflow: "hidden" }}>
                      {isFirst && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: cfg.color }} />}
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{["🥇","🥈","🥉"][actualRank - 1]}</div>
                      <PlayerAvatar name={p.name} size={isFirst ? 54 : 44} rank={p.rank} />
                      <div style={{ marginTop: 10, fontWeight: 700, fontSize: isFirst ? 16 : 14, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 2 }}>{p.team || "—"}</div>
                      <div style={{ marginTop: 10 }}>
                        <ScoreDisplay score={p.score} size={isFirst ? "xl" : "lg"} />
                        <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", marginTop: 1 }}>SCORE</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                        <RankBadge rank={p.rank} size="sm" />
                      </div>
                      {isFirst && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E22" }}>
                          {[
                            { l: "K/D",    v: p.kd },
                            { l: "HS%",    v: `${p.hsp}%` },
                            { l: "Win%",   v: `${p.winRate}%` },
                          ].map(({ l, v }) => (
                            <div key={l} style={{ textAlign: "center" }}>
                              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#E8E8F0" }}>{v}</div>
                              <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", marginTop: 1 }}>{l}</div>
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

      {/* ── Filters ── */}
      <div className="animate-slide stagger-3" style={{ marginBottom: 14 }}>
        <input className="input" placeholder="🔍  Search player or team..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 10 }} />
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 4, minWidth: "max-content", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Rank</span>
            <FilterBtn label="All" active={rankFilter === "All"} onClick={() => setRankFilter("All")} />
            {RANK_ORDER.map(r => (
              <FilterBtn key={r} label={`${RANK_CONFIG[r].icon} ${r}`} active={rankFilter === r} onClick={() => setRankFilter(r)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Table / Cards ── */}
      <div className="card animate-slide stagger-4" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1E1E22" }}>
                <Skeleton width={24} height={14} />
                <Skeleton width={36} height={36} radius={8} />
                <Skeleton width={110} height={14} />
                <div style={{ marginLeft: "auto" }}><Skeleton width={60} height={14} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No players found" desc="Try adjusting filters or add players"
            action={<Link href="/add-player"><button className="btn-primary">Add Player</button></Link>} />
        ) : isMobile ? (
          /* ── Mobile card list ── */
          <div>
            {filtered.map((p, idx) => (
              <Link key={p._id} href={`/player/${p._id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", display: "flex", alignItems: "center", gap: 12 }}>
                  <RankNum rank={idx + 1} />
                  <PlayerAvatar name={p.name} size={38} rank={p.rank} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                      <RankBadge rank={p.rank} size="xs" />
                      <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{p.kd} K/D</span>
                      <span style={{ fontSize: 11, color: "#FFD700", fontFamily: "'JetBrains Mono'" }}>{p.hsp}% HS</span>
                    </div>
                    <div style={{ marginTop: 5 }}><ScoreBar score={p.score} height={3} /></div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <ScoreDisplay score={p.score} size="md" />
                    <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", marginTop: 1 }}>SCORE</div>
                  </div>
                  <span style={{ color: "#3A3A42", fontSize: 12 }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ── Desktop table ──
             Columns: # | Player | Score | Rank | K/D | Kills | Deaths | Assists | HS% | Matches | W/L | Win%
             HS% = career average (totalHeadshots/totalKills)
             Kills/Deaths/Assists = career totals
          */
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    { label: "#",        field: null },
                    { label: "Player",   field: null },
                    { label: "Score",    field: "score" },
                    { label: "Rank",     field: null },
                    { label: "K/D",      field: null },
                    { label: "Kills",    field: "totalKills" },
                    { label: "Deaths",   field: null },
                    { label: "Assists",  field: null },
                    { label: "HS% avg",  field: null },
                    { label: "Matches",  field: "matchesPlayed" },
                    { label: "W / L",    field: "wins" },
                    { label: "Win%",     field: null },
                  ].map(({ label, field }) => (
                    <th key={label}
                      onClick={field ? () => handleSort(field) : undefined}
                      style={{ padding: "10px 14px", color: field && sortField === field ? "#E8E8F0" : "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap", cursor: field ? "pointer" : "default", userSelect: "none" }}>
                      {label}{field && sortField === field ? (sortOrder === "desc" ? " ↓" : " ↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p._id} style={{ cursor: "pointer" }} onClick={() => window.location.href = `/player/${p._id}`}>
                    <TD><RankNum rank={idx + 1} /></TD>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={p.name} size={32} rank={p.rank} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#E8E8F0" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#7A7A8C" }}>{p.team}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 70 }}>
                        <ScoreDisplay score={p.score} size="sm" />
                        <ScoreBar score={p.score} height={3} />
                      </div>
                    </td>
                    <TD><RankBadge rank={p.rank} size="sm" /></TD>
                    <TD color={getScoreColor(p.kd * 40)}>{p.kd}</TD>
                    <TD color="#4ECDC4">{p.totalKills}</TD>
                    <TD color="#FF4655">{p.totalDeaths}</TD>
                    <TD>{p.totalAssists}</TD>
                    <TD color="#FFD700">{p.hsp}%</TD>
                    <TD>{p.matchesPlayed}</TD>
                    <td style={{ padding: "13px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                      <span style={{ color: "#4ECDC4" }}>{p.wins}</span>
                      <span style={{ color: "#3A3A42" }}>/</span>
                      <span style={{ color: "#FF4655" }}>{p.losses}</span>
                    </td>
                    <TD>{p.winRate}%</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}