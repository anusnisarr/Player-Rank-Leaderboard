"use client";
import { useState, useEffect } from "react";
import { getMatches, deleteMatch } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { ScoreDisplay } from "@/components/UI";
import Link from "next/link";
import toast from "react-hot-toast";
import { sortMatchesByDateAndTime } from "@/lib/utils";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchMatches = async () => {
    try { const r = await getMatches({ limit: 50 }); setMatches(r.data.data); }
    catch { toast.error("Failed to load matches"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleDelete = async (id, title) => {
    alert("You are not authorized to delete!");
  };
  // const handleDelete = async (id, title) => {
  //   if (!confirm(`Delete "${title}"? Stats will be recalculated.`)) return;
  //   try { await deleteMatch(id); toast.success("Match deleted"); fetchMatches(); }
  //   catch { toast.error("Failed to delete match"); }
  // };

  const combineDateTime = (match) => {
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

  const sortedMatches = sortMatchesByDateAndTime(matches);


  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <div className="animate-slide stagger-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px, 8vw, 64px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>MATCH HISTORY</h1>
          <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>{matches.length} matches recorded</p>
        </div>
        <Link href="/add-match">
          <button className="btn-primary" style={{ fontSize: 13, padding: "9px 16px" }}>+ Add Match</button>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#7A7A8C", padding: 60 }}>Loading matches...</div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
          <div style={{ fontSize: 15, color: "#E8E8F0", marginBottom: 6 }}>No matches yet</div>
          <div style={{ fontSize: 13, color: "#7A7A8C", marginBottom: 20 }}>Record your first match to start tracking stats</div>
          <Link href="/add-match"><button className="btn-primary">Add First Match</button></Link>
        </div>
      ) : (
        <div className="animate-slide stagger-2" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sortedMatches.map((match) => {
            const isExpanded = expanded === match._id;
            const mvp = match.playerStats?.reduce((best, curr) => (!best || curr.score > best.score ? curr : best), null);

            return (
              <div key={match._id} className="card" style={{ overflow: "hidden" }}>
                {/* Match header */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flexWrap: "wrap" }}
                  onClick={() => setExpanded(isExpanded ? null : match._id)}>

                  <div style={{ width: 36, height: 36, borderRadius: 7, background: "#1E1E22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🗺️</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{match.title}</div>
                    <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {match.map && <span>{match.map}</span>}
                      <span>{timeAgo(match.date)}</span>
                      <span>{match.playerStats?.length || 0} players</span>
                    </div>
                  </div>

                  {/* Score - hide on very small */}
                  {(match.teamA || match.teamB) && (
                    <div className="score-badge" style={{ textAlign: "center", padding: "5px 10px", background: "#0A0A0B", borderRadius: 5, border: "1px solid #1E1E22", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 500, color: "#E8E8F0" }}>{match.scoreA}:{match.scoreB}</div>
                      <div style={{ fontSize: 9, color: "#7A7A8C" }}>{(match.teamA || "A").slice(0, 6)} v {(match.teamB || "B").slice(0, 6)}</div>
                    </div>
                  )}

                  {/* MVP */}
                  {mvp?.player && (
                    <div className="mvp-badge" style={{ fontSize: 11, color: "#7A7A8C", textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono'", color: "#FFD700" }}>MVP</div>
                      <div style={{ color: "#E8E8F0", fontWeight: 500, fontSize: 12 }}>{mvp.player?.name || "—"}</div>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ color: "#3A3A42", fontSize: 14, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(match._id, match.title); }}
                      style={{ background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.18)", borderRadius: 4, color: "#FF4655", cursor: "pointer", padding: "3px 8px", fontSize: 10, fontFamily: "'JetBrains Mono'" }}>
                      DEL
                    </button>
                  </div>
                </div>

                {/* Expanded stats */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1E1E22", overflowX: "auto" }}>
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          {["Player", "Score", "K", "D", "A", "ADR", "Result"].map((h) => (
                            <th key={h} style={{ padding: "8px 12px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...(match.playerStats || [])].sort((a, b) => b.score - a.score).map((s, i) => (
                          <tr key={i} style={{ background: i === 0 ? "rgba(255,215,0,0.03)" : undefined }}>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                              <div style={{ fontWeight: i === 0 ? 600 : 400, color: "#E8E8F0", display: "flex", alignItems: "center", gap: 5 }}>
                                {i === 0 && <span style={{ fontSize: 11 }}>⭐</span>}
                                <Link href={`/player/${s.player?._id}`} style={{ color: "inherit", textDecoration: "none" }}>{s.player?.name || "Unknown"}</Link>
                              </div>
                              {s.player?.team && <div style={{ fontSize: 10, color: "#7A7A8C" }}>{s.player.team}</div>}
                            </td>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}><ScoreDisplay score={s.score} size="sm" /></td>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#4ECDC4" }}>{s.kills}</td>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>{s.deaths}</td>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{s.assists}</td>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{s.adr?.toFixed(0)}</td>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                              <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono'", background: s.won ? "rgba(78,205,196,0.1)" : "rgba(255,70,85,0.1)", color: s.won ? "#4ECDC4" : "#FF4655", border: `1px solid ${s.won ? "rgba(78,205,196,0.25)" : "rgba(255,70,85,0.25)"}` }}>
                                {s.won ? "W" : "L"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {match.notes && <div style={{ padding: "10px 16px", borderTop: "1px solid #1E1E22", fontSize: 12, color: "#7A7A8C", fontStyle: "italic" }}>📝 {match.notes}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .score-badge { display: none !important; }
          .mvp-badge { display: none !important; }
        }
      `}</style>
    </div>
  );
}
