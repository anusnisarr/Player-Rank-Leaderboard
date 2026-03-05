"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlayer, deletePlayer } from "@/lib/api";
import { TIER_CONFIG, ROLE_CONFIG, getRatingColor, timeAgo } from "@/lib/utils";
import { TierBadge, RoleBadge, PlayerAvatar, RatingDisplay } from "@/components/UI";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import toast from "react-hot-toast";

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    getPlayer(id).then((r) => setPlayer(r.data.data)).catch(() => toast.error("Player not found")).finally(() => setLoading(false));
  }, [id]);

  // const handleDelete = async () => {
  //   if (!confirm(`Delete ${player.name}?`)) return;
  //   try { await deletePlayer(id); toast.success("Player deleted"); router.push("/"); }
  //   catch { toast.error("Failed to delete"); }
  // };

  const handleDelete = async () => {
     toast.error("You are not authorized to delete players!"); 
  };

  if (loading) return <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 16px", textAlign: "center", color: "#7A7A8C" }}>Loading...</div>;
  if (!player) return <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 16px", textAlign: "center", color: "#7A7A8C" }}>Player not found.</div>;

  const cfg = TIER_CONFIG[player.tier] || TIER_CONFIG.D;
  const roleCfg = ROLE_CONFIG[player.role] || { icon: "👤", desc: "" };

  const radarData = [
    { stat: "Kills", value: Math.min(100, (player.kpr / 1.2) * 100) },
    { stat: "Survival", value: Math.min(100, ((1 - player.dpr)) * 100) },
    { stat: "Assists", value: Math.min(100, (player.apr / 0.6) * 100) },
    { stat: "HS%", value: Math.min(100, player.hsr) },
    { stat: "ADR", value: Math.min(100, (player.adr / 120) * 100) },
    { stat: "KAST", value: Math.min(100, player.avgKast) },
  ];

  const historyChartData = (player.matchHistory || []).slice().reverse().map((m, i) => ({ match: i + 1, rating: m.rating, label: m.title?.slice(0, 16) }));

  const keyStats = [
    { label: "K/D", value: player.kd, color: getRatingColor(player.kd * 0.7) },
    { label: "KPR", value: player.kpr },
    { label: "DPR", value: player.dpr, color: player.dpr > 0.8 ? "#FF4655" : undefined },
    { label: "APR", value: player.apr, color: "#4ECDC4" },
    { label: "ADR", value: player.adr },
    { label: "HS%", value: `${player.hsr}%` },
    { label: "KAST%", value: `${player.avgKast}%` },
    { label: "Kills", value: player.totalKills },
    { label: "Deaths", value: player.totalDeaths },
    { label: "Assists", value: player.totalAssists },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
      {/* Header card */}
      <div className="card animate-slide stagger-1" style={{ padding: "20px 16px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cfg.color }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <PlayerAvatar name={player.name} size={60} tier={player.tier} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(28px, 6vw, 42px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {player.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                {player.team && <span style={{ fontSize: 13, color: "#A8A8BC" }}>{player.team}</span>}
                <TierBadge tier={player.tier} size="sm" />
                <RoleBadge role={player.role} />
              </div>
              {player.country && <div style={{ fontSize: 12, color: "#7A7A8C", marginTop: 4 }}>{player.country}</div>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}>
              <RatingDisplay rating={player.rating} size="xl" />
              <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Rating</div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 14 }}>
                <span style={{ color: "#4ECDC4" }}>{player.wins}W</span>
                <span style={{ color: "#3A3A42", margin: "0 3px" }}>–</span>
                <span style={{ color: "#FF4655" }}>{player.losses}L</span>
              </div>
              <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 2 }}>{player.winRate}% WR</div>
              <div style={{ fontSize: 11, color: "#7A7A8C" }}>{player.matchesPlayed} matches</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, marginTop: 16, background: "#1E1E22", borderRadius: 6, overflow: "hidden" }} className="stats-row">
          {keyStats.slice(0, 10).map(({ label, value, color }) => (
            <div key={label} style={{ background: "#111113", padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 500, color: color || "#E8E8F0" }}>{value}</div>
              <div style={{ fontSize: 9, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono'", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["overview", "history"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "7px 14px", borderRadius: 6, fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? "#E8E8F0" : "#7A7A8C", background: tab === t ? "#1E1E22" : "transparent", border: tab === t ? "1px solid #3A3A42" : "1px solid transparent", cursor: "pointer", textTransform: "capitalize", fontFamily: "'DM Sans'" }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={handleDelete} style={{ padding: "6px 12px", borderRadius: 5, fontSize: 12, color: "#FF4655", background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", cursor: "pointer" }}>
          Delete
        </button>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="animate-fade overview-grid">
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 16 }}>Performance Radar</div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E1E22" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#7A7A8C", fontSize: 10, fontFamily: "'JetBrains Mono'" }} />
                <Radar name={player.name} dataKey="value" stroke={cfg.color} fill={cfg.color} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 14 }}>Tier</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <TierBadge tier={player.tier} size="lg" />
                <div>
                  <div style={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</div>
                  <div style={{ fontSize: 12, color: "#7A7A8C" }}>{player.rating?.toFixed(3)} rating</div>
                </div>
              </div>
              {["Elite", "Strong", "Solid", "Average", "Developing"].map((t) => {
                const tc = TIER_CONFIG[t];
                const isActive = player.tier === t;
                const labels = { S: "1.30+", A: "1.10–1.29", B: "0.90–1.09", C: "0.70–0.89", D: "<0.70" };
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 5, background: isActive ? tc.bg : "transparent", border: isActive ? `1px solid ${tc.border}` : "1px solid transparent", marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: tc.color, minWidth: 12 }}>{t}</span>
                    <span style={{ fontSize: 11, color: isActive ? "#E8E8F0" : "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{labels[t]}</span>
                    {isActive && <span style={{ marginLeft: "auto", fontSize: 10, color: tc.color }}>← YOU</span>}
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 12 }}>Role</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{roleCfg.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: "#E8E8F0" }}>{player.role}</div>
                  <div style={{ fontSize: 12, color: "#7A7A8C" }}>{roleCfg.desc}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="animate-fade">
          {historyChartData.length > 1 && (
            <div className="card" style={{ padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 14 }}>Rating Trend</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={historyChartData}>
                  <CartesianGrid stroke="#1E1E22" strokeDasharray="3 3" />
                  <XAxis dataKey="match" tick={{ fill: "#7A7A8C", fontSize: 10, fontFamily: "'JetBrains Mono'" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#7A7A8C", fontSize: 10, fontFamily: "'JetBrains Mono'" }} width={36} />
                  <Tooltip contentStyle={{ background: "#111113", border: "1px solid #1E1E22", borderRadius: 5, color: "#E8E8F0", fontFamily: "'JetBrains Mono'", fontSize: 11 }} />
                  <Line type="monotone" dataKey="rating" stroke="#FF4655" strokeWidth={2} dot={{ fill: "#FF4655", r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card" style={{ overflow: "hidden" }}>
            {(!player.matchHistory || player.matchHistory.length === 0) ? (
              <div style={{ padding: 40, textAlign: "center", color: "#7A7A8C", fontSize: 14 }}>No match history yet</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Match", "Map", "Date", "Rating", "K", "D", "A", "ADR", "Result"].map((h) => (
                        <th key={h} style={{ padding: "9px 12px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {player.matchHistory.map((m) => (
                      <tr key={m._id}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", maxWidth: 140 }}>
                          <div style={{ fontSize: 12, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{m.map || "—"}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap" }}>{timeAgo(m.date)}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}><RatingDisplay rating={m.rating} size="sm" /></td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#4ECDC4" }}>{m.kills}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>{m.deaths}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{m.assists}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{m.adr}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                          <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono'", background: m.won ? "rgba(78,205,196,0.1)" : "rgba(255,70,85,0.1)", color: m.won ? "#4ECDC4" : "#FF4655", border: `1px solid ${m.won ? "rgba(78,205,196,0.25)" : "rgba(255,70,85,0.25)"}` }}>
                            {m.won ? "W" : "L"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .stats-row { grid-template-columns: repeat(5, 1fr) !important; }
        @media (max-width: 640px) {
          .overview-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: repeat(5, 1fr) !important; }
        }
        @media (max-width: 400px) {
          .stats-row { grid-template-columns: repeat(5, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
