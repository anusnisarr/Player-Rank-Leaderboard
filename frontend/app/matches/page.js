"use client";
import { useState, useEffect } from "react";
import { getMatches, deleteMatch } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { RatingDisplay } from "@/components/UI";
import Link from "next/link";
import toast from "react-hot-toast";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchMatches = async () => {
    try {
      const r = await getMatches({ limit: 50 });
      setMatches(r.data.data);
    } catch {
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete match "${title}"? Player stats will be recalculated.`)) return;
    try {
      await deleteMatch(id);
      toast.success("Match deleted");
      fetchMatches();
    } catch {
      toast.error("Failed to delete match");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <div className="animate-slide stagger-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
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
            MATCH HISTORY
          </h1>
          <p style={{ color: "#7A7A8C", fontSize: 14, marginTop: 6 }}>
            {matches.length} matches recorded
          </p>
        </div>
        <Link href="/add-match">
          <button className="btn-primary">+ Add Match</button>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#7A7A8C", padding: 80 }}>Loading matches...</div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
          <div style={{ fontSize: 16, color: "#E8E8F0", marginBottom: 6 }}>No matches yet</div>
          <div style={{ fontSize: 14, color: "#7A7A8C", marginBottom: 24 }}>Record your first match to start tracking stats</div>
          <Link href="/add-match">
            <button className="btn-primary">Add First Match</button>
          </Link>
        </div>
      ) : (
        <div className="animate-slide stagger-2" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {matches.map((match) => {
            const isExpanded = expanded === match._id;
            const mvp = match.playerStats?.reduce(
              (best, curr) => (!best || curr.rating > best.rating ? curr : best),
              null
            );

            return (
              <div key={match._id} className="card" style={{ overflow: "hidden" }}>
                {/* Match header */}
                <div
                  style={{
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                  onClick={() => setExpanded(isExpanded ? null : match._id)}
                >
                  {/* Map icon */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "#1E1E22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🗺️
                  </div>

                  {/* Title & meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#7A7A8C", marginTop: 2, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {match.map && <span>{match.map}</span>}
                      <span>{timeAgo(match.date)}</span>
                      <span>{match.playerStats?.length || 0} players</span>
                    </div>
                  </div>

                  {/* Score */}
                  {(match.teamA || match.teamB) && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "6px 14px",
                        background: "#0A0A0B",
                        borderRadius: 6,
                        border: "1px solid #1E1E22",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono'",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#E8E8F0",
                        }}
                      >
                        {match.scoreA} : {match.scoreB}
                      </div>
                      <div style={{ fontSize: 10, color: "#7A7A8C", marginTop: 1 }}>
                        {match.teamA} vs {match.teamB}
                      </div>
                    </div>
                  )}

                  {/* MVP */}
                  {mvp?.player && (
                    <div style={{ fontSize: 12, color: "#7A7A8C", textAlign: "right" }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono'", marginBottom: 2, color: "#FFD700" }}>
                        MVP
                      </div>
                      <div style={{ color: "#E8E8F0", fontWeight: 500 }}>
                        {mvp.player?.name || "—"}
                      </div>
                      <RatingDisplay rating={mvp.rating} size="sm" />
                    </div>
                  )}

                  {/* Expand chevron */}
                  <div
                    style={{
                      color: "#3A3A42",
                      fontSize: 16,
                      transform: isExpanded ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ▾
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(match._id, match.title); }}
                    style={{
                      background: "rgba(255,70,85,0.08)",
                      border: "1px solid rgba(255,70,85,0.2)",
                      borderRadius: 5,
                      color: "#FF4655",
                      cursor: "pointer",
                      padding: "4px 10px",
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono'",
                    }}
                  >
                    DEL
                  </button>
                </div>

                {/* Expanded stats */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1E1E22", overflowX: "auto" }}>
                    <table className="data-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          {["Player", "Rating", "K", "D", "A", "K/D", "HS%", "ADR", "KAST", "Result"].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "9px 16px",
                                color: "#7A7A8C",
                                fontFamily: "'JetBrains Mono'",
                                fontSize: 10,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                borderBottom: "1px solid #1E1E22",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...(match.playerStats || [])]
                          .sort((a, b) => b.rating - a.rating)
                          .map((s, i) => (
                            <tr key={i} style={{ background: i === 0 ? "rgba(255,215,0,0.03)" : undefined }}>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                                <div style={{ fontWeight: i === 0 ? 600 : 400, color: "#E8E8F0", display: "flex", alignItems: "center", gap: 6 }}>
                                  {i === 0 && <span title="MVP" style={{ fontSize: 12 }}>⭐</span>}
                                  <Link href={`/player/${s.player?._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                    {s.player?.name || "Unknown"}
                                  </Link>
                                </div>
                                {s.player?.team && (
                                  <div style={{ fontSize: 11, color: "#7A7A8C" }}>{s.player.team}</div>
                                )}
                              </td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                                <RatingDisplay rating={s.rating} size="sm" />
                              </td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#4ECDC4" }}>{s.kills}</td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>{s.deaths}</td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{s.assists}</td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>
                                {s.deaths > 0 ? (s.kills / s.deaths).toFixed(2) : s.kills.toFixed(2)}
                              </td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{s.hsr?.toFixed(0)}%</td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{s.adr?.toFixed(0)}</td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{s.kast}%</td>
                              <td style={{ padding: "10px 16px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontFamily: "'JetBrains Mono'",
                                    background: s.won ? "rgba(78,205,196,0.1)" : "rgba(255,70,85,0.1)",
                                    color: s.won ? "#4ECDC4" : "#FF4655",
                                    border: `1px solid ${s.won ? "rgba(78,205,196,0.25)" : "rgba(255,70,85,0.25)"}`,
                                  }}
                                >
                                  {s.won ? "W" : "L"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {match.notes && (
                      <div style={{ padding: "12px 24px", borderTop: "1px solid #1E1E22", fontSize: 13, color: "#7A7A8C", fontStyle: "italic" }}>
                        📝 {match.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
