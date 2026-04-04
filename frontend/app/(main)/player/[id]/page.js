"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlayer, deletePlayer } from "@/lib/api";
import { RANK_CONFIG, RANK_ORDER, getScoreColor, timeAgo } from "@/lib/utils";
import { RankBadge, ScoreDisplay, ScoreBar, PlayerAvatar } from "@/components/UI";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { sortMatchesByDateAndTime } from "@/lib/utils";

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    getPlayer(id).then(r => setPlayer(r.data.data)).catch(() => toast.error("Player not found")).finally(() => setLoading(false));
    
    
  }, [id]);

  if (loading) return <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 16px", textAlign: "center", color: "#7A7A8C" }}>Loading...</div>;
  if (!player)  return <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 16px", textAlign: "center", color: "#7A7A8C" }}>Player not found.</div>;

  const cfg = RANK_CONFIG[player.rank] || RANK_CONFIG["Unranked"];

  // Radar: simple 0-100 normalized stats any friend can understand
  const radarData = [
    { stat: "Kills",    value: Math.min(100, (player.avgKills / 25) * 100) },
    { stat: "Survival", value: Math.min(100, Math.max(0, 100 - (player.avgDeaths / 20) * 100)) },
    { stat: "Assists",  value: Math.min(100, (player.avgAssists / 10) * 100) },
    { stat: "HS%",      value: Math.min(100, player.hsp) },
    { stat: "Damage",   value: Math.min(100, (player.adr / 150) * 100) },
    { stat: "Wins",     value: Math.min(100, player.winRate) },
  ];

  const historyChart = (player.matchHistory || []).slice().reverse().map((m, i) => ({
    match: i + 1,
    score: m.score,
    kills: m.kills,
  }));

 const handleDelete = async () => {
  
  const result = await Swal.fire({
    title: "Enter PIN to Delete!",
    input: "password",
    inputPlaceholder: "Enter PIN",
    showCancelButton: true,
    confirmButtonText: "Delete",
  });

  if (!result.isConfirmed) return;

  const enteredPin = result.value;
  const correctPin = process.env.NEXT_PUBLIC_SECRET_DELETE_PIN;

  if (enteredPin !== correctPin) {
    toast.error("Invalid PIN");
    return;
  }

  try {
    await deletePlayer(id);
    toast.success("Player deleted");
    router.push("/");
  } catch (err) {
    toast.error("Failed to delete");
  }
};
   
  // const handleDelete = async () => {
  //   if (!confirm(`Delete ${player.name}?`)) return;
  //   try { await deletePlayer(id); toast.success("Player deleted"); router.push("/"); }
  //   catch { toast.error("Failed to delete"); }
  // };

    // Stat cell helper
  
  const Stat = ({ label, value, color, sub }) => (
    <div style={{ background: "#111113", padding: "14px 10px", textAlign: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, fontWeight: 600, color: color || "#E8E8F0" }}>{value ?? "—"}</div>
      {sub && <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#4ECDC4", marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: 9, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono'", marginTop: 4 }}>{label}</div>
    </div>
  );

  const sortedMatcheHistory = sortMatchesByDateAndTime(player.matchHistory || []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Profile header ── */}
      <div className="card animate-slide stagger-1" style={{ padding: "20px 16px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cfg?.color }} />
 
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <PlayerAvatar name={player.name} size={64} rank={player.rank} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(26px, 6vw, 40px)", color: "#E8E8F0", lineHeight: 1, letterSpacing: "0.04em" }}>
                {player.name}
              </h1>
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                {player.team    && <span style={{ fontSize: 13, color: "#A8A8BC" }}>{player.team}</span>}
                {player.country && <span style={{ fontSize: 13, color: "#7A7A8C" }}>{player.country}</span>}
              </div>
              <div style={{ marginTop: 8 }}><RankBadge rank={player.rank} size="md" /></div>
            </div>
          </div>
 
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <ScoreDisplay score={player.score} size="xl" />
            <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
              Performance Score
            </div>
            {/* <div style={{ marginTop: 8, width: 130, marginLeft: "auto" }}>
              <ScoreBar score={player.score} height={5} />
            </div> */}
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, marginTop: 8 }}>
              <span style={{ color: "#4ECDC4" }}>{player.wins}W</span>
              <span style={{ color: "#3A3A42", margin: "0 4px" }}>–</span>
              <span style={{ color: "#FF4655" }}>{player.losses}L</span>
              <span style={{ color: "#7A7A8C", fontSize: 11, marginLeft: 6 }}>{player.winRate}% WR</span>
            </div>
          </div>
        </div>
 
      {/* ── Career Totals ── */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Career Totals</div>
        <div className="stats-grid-6" style={{ gap: 1, background: "#1E1E22", borderRadius: 7, overflow: "hidden" }}>
          <Stat label="Kills"      value={player.totalKills}      color="#4ECDC4" />
          <Stat label="Deaths"     value={player.totalDeaths}     color="#FF4655" />
          <Stat label="Assists"    value={player.totalAssists} />
          <Stat label="Headshots"  value={player.totalHeadshots}  color="#4ECDC4" />
          <Stat label="Damage"     value={player.totalDamage}     color="#FF6B35" />
          <Stat label="Matches"    value={player.matchesPlayed} />
        </div>
      </div>

      {/* ── Per Match Averages ── */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Per Match Averages</div>
        <div className="stats-grid-6" style={{ gap: 1, background: "#1E1E22", borderRadius: 7, overflow: "hidden" }}>
          <Stat label="Avg Kills"   value={player.avgKills}   color="#4ECDC4" />
          <Stat label="Avg Deaths"  value={player.avgDeaths}  color="#FF4655" />
          <Stat label="Avg Assists" value={player.avgAssists} />
          <Stat label="HS%"         value={`${player.hsp}%`}  color="#FFD700" />
          <Stat label="K/D"         value={player.kd}         color={getScoreColor((player.kd || 0) * 40)} />
          <Stat label="Avg Score"   value={player.avgScore}   color={getScoreColor((player.avgScore || 0) * 40)} />
        </div>
      </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["overview", "history"].map(t => (
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

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="animate-fade overview-grid">
          {/* Radar */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7A7A8C", marginBottom: 14 }}>Skill Radar</div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E1E22" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#7A7A8C", fontSize: 11, fontFamily: "'JetBrains Mono'" }} />
                <Radar dataKey="value" stroke={cfg?.color} fill={cfg?.color} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Rank breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7A7A8C", marginBottom: 14 }}>Rank</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{cfg?.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: cfg?.color }}>{player.rank}</div>
                  <div style={{ fontSize: 12, color: "#7A7A8C" }}>Avg Score: {player.avgScore} / 100</div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <ScoreBar score={player.avgScore} height={6} showLabel />
              </div>
              {/* Rank ladder */}
              {RANK_ORDER.map(r => {
                const rc = RANK_CONFIG[r];
                const next = RANK_ORDER[RANK_ORDER.indexOf(r) - 1];
                const isActive = player.rank === r;
                return (
                  <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, background: isActive ? rc.bg : "transparent", border: isActive ? `1px solid ${rc.border}` : "1px solid transparent", marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{rc.icon}</span>
                    <span style={{ fontWeight: 600, color: rc.color, fontSize: 13, minWidth: 90 }}>{r}</span>
                    <span style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{rc.scoreRange}</span>
                    {isActive && <span style={{ marginLeft: "auto", fontSize: 10, color: rc.color }}>← YOU</span>}
                  </div>
                );
              })}
            </div>

            {/* Score breakdown */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7A7A8C", marginBottom: 14 }}>How Score Works</div>
              {[
                { icon: "💚", text: `${player.totalKills} total kills × 3`, pts: `+${(player.totalKills * 3).toFixed(1)}`, color: "#4ECDC4" },
                { icon: "💛", text: `${player.totalAssists} total assists × 1.5`, pts: `+${(player.totalAssists * 1.5).toFixed(1)}`, color: "#A8DADC" },
                { icon: "❤️", text: `${player.totalDeaths} total deaths × 2`, pts: `-${(player.totalDeaths * 2).toFixed(1)}`, color: "#FF4655" },
                { icon: "🎯", text: `${player.totalHeadshots} headshot × 1`, pts: `+${(player.totalHeadshots * 1).toFixed(1)}`, color: "#FFD700" },
                { icon: "🎯", text: `${(player.totalDamage / 100).toFixed(1)} damage × 0.5`, pts: `+${((player.totalDamage / 100) * 0.5).toFixed(1)}`, color: "#FFD700" },
                { icon: "🎯", text: `${(player.wins).toFixed(1)} wins × 10`, pts: `+${(player.wins * 10).toFixed(1)}`, color: "#FFD700" }
              ].map(({ icon, text, pts, color }) => (
                <div key={text} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1E1E22" }}>
                  <div style={{ fontSize: 13, color: "#A8A8BC" }}>{icon} {text}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 600, color }}>{pts}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 0" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E8F0" }}>Avg Score</div>
                <ScoreDisplay score={player.score} size="md" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Match History ── */}
      {tab === "history" && (
        <div className="animate-fade">
          {historyChart.length > 1 && (
            <div className="card" style={{ padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7A7A8C", marginBottom: 14 }}>Score Trend</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={historyChart}>
                  <CartesianGrid stroke="#1E1E22" strokeDasharray="3 3" />
                  <XAxis dataKey="match" tick={{ fill: "#7A7A8C", fontSize: 10, fontFamily: "'JetBrains Mono'" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#7A7A8C", fontSize: 10, fontFamily: "'JetBrains Mono'" }} width={30} />
                  <Tooltip contentStyle={{ background: "#111113", border: "1px solid #1E1E22", borderRadius: 5, color: "#E8E8F0", fontFamily: "'JetBrains Mono'", fontSize: 11 }} />
                  <Line type="monotone" dataKey="score" stroke={cfg?.color} strokeWidth={2} dot={{ fill: cfg?.color, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card" style={{ overflow: "hidden" }}>
            {(!player.matchHistory || player.matchHistory.length === 0) ? (
              <div style={{ padding: 40, textAlign: "center", color: "#7A7A8C" }}>No match history yet</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Match", "Score", "K", "D", "A", "HS%","HEADSHOTS", "DAMAGE / 100", "Result"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMatcheHistory.map(m => (
                      <tr key={m._id}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", maxWidth: 140 }}>
                          <div style={{ fontSize: 12, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                          <div style={{ fontSize: 10, color: "#7A7A8C", marginTop: 1 }}>{timeAgo(m.date)}</div>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <ScoreDisplay score={m.score} size="sm" />
                            <ScoreBar score={m.score} height={3} />
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#4ECDC4" }}>{m.kills}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>{m.deaths}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{m.assists}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{m.hsp?.toFixed(0)}%</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{m.headshots}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{(m.damage / 100).toFixed(0)}</td>
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
        .stats-row { grid-template-columns: repeat(4, 1fr) !important; }
        @media (max-width: 600px) {
          .overview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <style>{`
  .stats-grid-6 {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
  }
  @media (max-width: 600px) {
    .stats-grid-6 {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .overview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 600px) {
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }
`}</style>
    </div>
  );
}
