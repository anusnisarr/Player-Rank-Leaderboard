"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlayer, deletePlayer } from "@/lib/api";
import { TIER_CONFIG, ROLE_CONFIG, getRatingColor, timeAgo } from "@/lib/utils";
import { TierBadge, RoleBadge, PlayerAvatar, RatingDisplay, StatPill } from "@/components/UI";
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
    getPlayer(id)
      .then((r) => setPlayer(r.data.data))
      .catch(() => toast.error("Player not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete ${player.name}? This won't remove match records.`)) return;
    try {
      await deletePlayer(id);
      toast.success("Player deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#7A7A8C" }}>
        Loading player...
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#7A7A8C" }}>
        Player not found.
      </div>
    );
  }

  const cfg = TIER_CONFIG[player.tier] || TIER_CONFIG.D;
  const roleCfg = ROLE_CONFIG[player.role] || ROLE_CONFIG["Lurker"];

  // Radar data (normalized 0–100)
  const radarData = [
    { stat: "Kills", value: Math.min(100, (player.kpr / 1.2) * 100) },
    { stat: "Survival", value: Math.min(100, ((1 - player.dpr) / 1) * 100) },
    { stat: "Assists", value: Math.min(100, (player.apr / 0.6) * 100) },
    { stat: "HS%", value: Math.min(100, player.hsr) },
    { stat: "ADR", value: Math.min(100, (player.adr / 120) * 100) },
    { stat: "KAST", value: Math.min(100, player.avgKast) },
  ];

  // Match history for chart
  const historyChartData = (player.matchHistory || [])
    .slice()
    .reverse()
    .map((m, i) => ({
      match: i + 1,
      rating: m.rating,
      kd: m.kills && m.deaths ? +(m.kills / Math.max(m.deaths, 1)).toFixed(2) : 0,
      label: m.title?.slice(0, 20),
    }));

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      {/* Player header */}
      <div
        className="card animate-slide stagger-1"
        style={{
          padding: 32,
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Tier accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cfg.color }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          {/* Left: avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <PlayerAvatar name={player.name} size={72} tier={player.tier} />
            <div>
              <h1
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 42,
                  letterSpacing: "0.04em",
                  color: "#E8E8F0",
                  lineHeight: 1,
                }}
              >
                {player.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                {player.team && (
                  <span style={{ fontSize: 14, color: "#A8A8BC" }}>{player.team}</span>
                )}
                {player.country && (
                  <span style={{ fontSize: 14, color: "#7A7A8C" }}>{player.country}</span>
                )}
                <TierBadge tier={player.tier} size="md" />
                <RoleBadge role={player.role} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#7A7A8C" }}>
                {roleCfg.icon} {roleCfg.desc} — Member since {timeAgo(player.createdAt)}
              </div>
            </div>
          </div>

          {/* Right: rating + record */}
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <RatingDisplay rating={player.rating} size="xl" />
              <div style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                Rating
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, color: "#4ECDC4" }}>{player.wins}W</span>
                <span style={{ color: "#3A3A42", margin: "0 4px" }}>–</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, color: "#FF4655" }}>{player.losses}L</span>
              </div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#7A7A8C" }}>
                {player.winRate}% Win rate
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#7A7A8C" }}>
                {player.matchesPlayed} matches played
              </div>
            </div>
          </div>
        </div>

        {/* Key stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: 1,
            marginTop: 28,
            background: "#1E1E22",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {[
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
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "#111113",
                padding: "14px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, fontWeight: 500, color: color || "#E8E8F0" }}>
                {value}
              </div>
              <div style={{ fontSize: 10, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono'", marginTop: 3 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["overview", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#E8E8F0" : "#7A7A8C",
              background: tab === t ? "#1E1E22" : "transparent",
              border: tab === t ? "1px solid #3A3A42" : "1px solid transparent",
              cursor: "pointer",
              textTransform: "capitalize",
              fontFamily: "'DM Sans'",
            }}
          >
            {t}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={handleDelete}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            color: "#FF4655",
            background: "rgba(255,70,85,0.08)",
            border: "1px solid rgba(255,70,85,0.2)",
            cursor: "pointer",
          }}
        >
          Delete Player
        </button>
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="animate-fade" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Radar chart */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 20 }}>
              Performance Radar
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E1E22" />
                <PolarAngleAxis
                  dataKey="stat"
                  tick={{ fill: "#7A7A8C", fontSize: 11, fontFamily: "'JetBrains Mono'" }}
                />
                <Radar
                  name={player.name}
                  dataKey="value"
                  stroke={cfg.color}
                  fill={cfg.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Tier info + role */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 16 }}>
                Tier Breakdown
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <TierBadge tier={player.tier} size="lg" />
                <div>
                  <div style={{ fontWeight: 600, color: cfg.color, fontSize: 16 }}>{cfg.label}</div>
                  <div style={{ fontSize: 13, color: "#7A7A8C" }}>Rating: {player.rating?.toFixed(3)}</div>
                </div>
              </div>
              {/* Tier scale */}
              {["S (1.30+)", "A (1.10–1.29)", "B (0.90–1.09)", "C (0.70–0.89)", "D (<0.70)"].map((t, i) => {
                const tiers = ["S", "A", "B", "C", "D"];
                const tc = TIER_CONFIG[tiers[i]];
                const isActive = player.tier === tiers[i];
                return (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: isActive ? tc.bg : "transparent",
                      border: isActive ? `1px solid ${tc.border}` : "1px solid transparent",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 14, color: tc.color, minWidth: 12 }}>
                      {tiers[i]}
                    </span>
                    <span style={{ fontSize: 12, color: isActive ? "#E8E8F0" : "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                      {t}
                    </span>
                    {isActive && <span style={{ marginLeft: "auto", fontSize: 10, color: tc.color }}>← YOU</span>}
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 16 }}>
                Role Profile
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{roleCfg.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: "#E8E8F0", fontSize: 16 }}>{player.role}</div>
                  <div style={{ fontSize: 13, color: "#7A7A8C" }}>{roleCfg.desc}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#A8A8BC", lineHeight: 1.6 }}>
                {player.role === "Entry Fragger" && "High kill rate, often first to engage. Relies on mechanical skill."}
                {player.role === "AWPer" && "High HS% and ADR suggests primary sniper role. Burst damage specialist."}
                {player.role === "Support" && "High assist rate indicates utility-focused playstyle. Enables teammates."}
                {player.role === "IGL" && "High ADR with moderate KPR — likely an in-game leader making impact plays."}
                {player.role === "Lurker" && "Balanced stats with strategic positioning. Often creates off-angle pressure."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="animate-fade">
          {historyChartData.length > 1 && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A8C", marginBottom: 16 }}>
                Rating Trend
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historyChartData}>
                  <CartesianGrid stroke="#1E1E22" strokeDasharray="3 3" />
                  <XAxis dataKey="match" tick={{ fill: "#7A7A8C", fontSize: 11, fontFamily: "'JetBrains Mono'" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#7A7A8C", fontSize: 11, fontFamily: "'JetBrains Mono'" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#111113",
                      border: "1px solid #1E1E22",
                      borderRadius: 6,
                      color: "#E8E8F0",
                      fontFamily: "'JetBrains Mono'",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="rating" stroke="#FF4655" strokeWidth={2} dot={{ fill: "#FF4655", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card" style={{ overflow: "hidden" }}>
            {(!player.matchHistory || player.matchHistory.length === 0) ? (
              <div style={{ padding: 48, textAlign: "center", color: "#7A7A8C", fontSize: 14 }}>
                No match history yet
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {["Match", "Map", "Date", "Rating", "K", "D", "A", "HS%", "ADR", "KAST", "Result"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {player.matchHistory.map((m) => (
                      <tr key={m._id}>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", maxWidth: 200 }}>
                          <div style={{ fontSize: 13, color: "#E8E8F0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.title}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontSize: 12, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                          {m.map || "—"}
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontSize: 12, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                          {timeAgo(m.date)}
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                          <RatingDisplay rating={m.rating} size="sm" />
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#4ECDC4" }}>{m.kills}</td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#FF4655" }}>{m.deaths}</td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{m.assists}</td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{m.hsr}%</td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{m.adr}</td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{m.kast}%</td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontFamily: "'JetBrains Mono'",
                              background: m.won ? "rgba(78,205,196,0.1)" : "rgba(255,70,85,0.1)",
                              color: m.won ? "#4ECDC4" : "#FF4655",
                              border: `1px solid ${m.won ? "rgba(78,205,196,0.25)" : "rgba(255,70,85,0.25)"}`,
                            }}
                          >
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
    </div>
  );
}
