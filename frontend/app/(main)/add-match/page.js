"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayers, createMatch } from "@/lib/api";
import { MAPS, getScoreColor } from "@/lib/utils";
import ImportMatch from "@/components/ImportMatch.js";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";



const EMPTY_STAT = {
  player: "", kills: "", deaths: "", assists: "",
  hsp: "",      // HS% — typed directly from CS2 scoreboard
  damage: "",
  won: false,
};

const L = { display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 };

// Auto-estimate KAST% from kills/assists/deaths/rounds
function estimateScore(kills = 0, deaths = 0, assists = 0, headshots = 0, damage = 0, won = false) {

  // const adr = damage / rounds;
  const damage_normalized = damage / 100;
  const winBonus = won ? 10 : 0;

  const raw = (kills * 3) + (assists * 1.5) - (deaths * 2) + (headshots * 1) + (damage_normalized * 0.5) + winBonus;

  return Math.max(0, Number(raw.toFixed(1)));
}

// Convert HS% → headshot count
function hspToHeadshots(kills, hsp) {
  const k = Number(kills) || 0;
  const h = Number(hsp) || 0;
  return Math.round(k * h / 100);
}

function StatBox({ label, value, onChange, max, step = "1", suffix = "" }) {
  return (
    <div>
      <label style={L}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="input"
          type="number"
          min="0"
          max={max}
          step={step}
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            fontFamily: "'JetBrains Mono'",
            textAlign: "center",
            padding: suffix ? "10px 24px 10px 6px" : "10px 6px",
            fontSize: 15,
          }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", pointerEvents: "none" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AddMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playgroundId = searchParams.get("playground");
  const [players, setPlayers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [match, setMatch] = useState({
    title: "", map: "",
    date: new Date().toISOString().slice(0, 10),
    teamA: "", teamB: "", scoreA: "", scoreB: "",
    totalRounds: "", notes: "",
  });
  const [stats, setStats] = useState([{ ...EMPTY_STAT }]);

  useEffect(() => {
    getPlayers().then((r) => setPlayers(r.data.data)).catch(() => toast.error("Failed to load players"));
  }, []);

  const setMatchField = (k, v) => setMatch((m) => ({ ...m, [k]: v }));
  const setStat = (idx, key, val) => setStats((prev) => {
    const u = [...prev];
    u[idx] = { ...u[idx], [key]: val };
    return u;
  });
  const addPlayer = () => setStats((s) => [...s, { ...EMPTY_STAT }]);
  const removePlayer = (idx) => setStats((s) => s.filter((_, i) => i !== idx));


  const getHeadshots = (s) => hspToHeadshots(s.kills, s.hsp);

  const getScore = (s) => {
    const score = estimateScore(s.kills, s.deaths, s.assists, getHeadshots(s), s.damage, s.won);
    return score;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!match.title.trim()) return toast.error("Match title is required");
    if (!match.totalRounds || Number(match.totalRounds) < 1) return toast.error("Total rounds required");

    const validStats = stats.filter((s) => s.player);
    if (validStats.length === 0) return toast.error("Add at least one player's stats");

    for (const s of validStats) {
      if ([s.kills, s.deaths, s.assists, s.damage].some(v => v === "")) return toast.error("Fill in K / D / A / DMG for each player");
      if (s.hsp === "") return toast.error("Fill in HS% for each player");
      if (Number(s.hsp) > 100) return toast.error("HS% cannot exceed 100");
    }

    try {
      setSubmitting(true);
      const rounds = Number(match.totalRounds);
      await createMatch({
        ...match,
        playground: playgroundId,
        totalRounds: rounds,
        scoreA: Number(match.scoreA) || 0,
        scoreB: Number(match.scoreB) || 0,
        playerStats: validStats.map((s) => ({
          player: s.player,
          kills: Number(s.kills),
          deaths: Number(s.deaths),
          assists: Number(s.assists),
          headshots: getHeadshots(s),
          hsp: Number(s.hsp),
          damage: Number(s.damage),
          rounds,
          won: s.won,
        })),
      });
      toast.success("Match saved! Rankings updated.");
      router.push("/");
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.error || "Failed to add match");
    } finally {
      setSubmitting(false);
    }
  };

  const availablePlayers = (currentIdx) =>
    players.filter((p) => !stats.some((s, i) => i !== currentIdx && s.player === p._id) || stats[currentIdx].player === p._id);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>

      {/* Header */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px, 8vw, 52px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
          ADD MATCH
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
          Copy stats directly from the CS2 scoreboard
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        <ImportMatch
          existingPlayers={players}
          onImport={(importedPlayers) => {
            // Map imported rows to your stats format
            const newStats = importedPlayers
              .filter(r => r.matched)
              .map(r => ({
                player: r.matched._id,
                kills: r.kills,
                deaths: r.deaths,
                assists: r.assists,
                hsp: r.hsp,
                damage: r.damage,
                won: r.won,
                kastMode: "auto",
                kastManual: "",
              }));
            setStats(newStats);
            toast.success(`Imported ${newStats.length} players!`);
          }}
        />

        {/* Match info */}
        <div className="card animate-slide stagger-2" style={{ padding: "20px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655", marginBottom: 16 }}>
            — Match Info
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={L}>Match Title *</label>
              <input className="input" placeholder="e.g. Ranked · Mirage · 27 May" value={match.title} onChange={(e) => setMatchField("title", e.target.value)} required />
            </div>

            <div className="two-col-grid">
              <div>
                <label style={L}>Map</label>
                <select className="input" value={match.map} onChange={(e) => setMatchField("map", e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Select map</option>
                  {MAPS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={L}>Date</label>
                <input className="input" type="date" value={match.date} onChange={(e) => setMatchField("date", e.target.value)} />
              </div>
            </div>

            {/* Score row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto 1fr", gap: 8, alignItems: "end" }}>
              <div>
                <label style={L}>Team A</label>
                <input className="input" placeholder="Team Alpha" value={match.teamA} onChange={(e) => setMatchField("teamA", e.target.value)} />
              </div>
              <div>
                <label style={L}>Score A</label>
                <input className="input" type="number" min="0" max="30" placeholder="0" value={match.scoreA} onChange={(e) => setMatchField("scoreA", e.target.value)} style={{ width: 58, textAlign: "center", fontFamily: "'JetBrains Mono'" }} />
              </div>
              <div style={{ paddingBottom: 11, color: "#3A3A42", fontFamily: "'JetBrains Mono'", fontSize: 18, alignSelf: "end", textAlign: "center", minWidth: 14 }}>:</div>
              <div>
                <label style={L}>Score B</label>
                <input className="input" type="number" min="0" max="30" placeholder="0" value={match.scoreB} onChange={(e) => setMatchField("scoreB", e.target.value)} style={{ width: 58, textAlign: "center", fontFamily: "'JetBrains Mono'" }} />
              </div>
              <div>
                <label style={L}>Team B</label>
                <input className="input" placeholder="Team Beta" value={match.teamB} onChange={(e) => setMatchField("teamB", e.target.value)} />
              </div>
            </div>

            <div style={{ maxWidth: 180 }}>
              <label style={L}>Total Rounds *</label>
              <input className="input" type="number" min="1" max="60" placeholder="24" value={match.totalRounds} onChange={(e) => setMatchField("totalRounds", e.target.value)} style={{ fontFamily: "'JetBrains Mono'" }} required />
            </div>
          </div>
        </div>

        {/* Player stats */}
        <div className="animate-slide stagger-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655" }}>
              — Player Stats
            </div>
            <button type="button" onClick={addPlayer} className="btn-ghost" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Add Player
            </button>
          </div>

          {stats.map((stat, idx) => {

            const hs = getHeadshots(stat);
            const score = getScore(stat);



            return (
              <div key={idx} className="card" style={{ padding: "16px", marginBottom: 12 }}>

                {/* Player select + won toggle */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                  <select className="input" value={stat.player} onChange={(e) => setStat(idx, "player", e.target.value)} style={{ flex: 1, minWidth: 160, cursor: "pointer" }} required>
                    <option value="">Select player...</option>
                    {availablePlayers(idx).map((p) => (
                      <option key={p._id} value={p._id}>{p.name}{p.team ? ` (${p.team})` : ""}</option>
                    ))}
                  </select>

                  {/* Won toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div onClick={() => setStat(idx, "won", !stat.won)}
                      style={{ width: 34, height: 18, borderRadius: 9, background: stat.won ? "#4ECDC4" : "#1E1E22", border: `1px solid ${stat.won ? "#4ECDC4" : "#3A3A42"}`, position: "relative", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 2, left: stat.won ? 16 : 2, width: 12, height: 12, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                    </div>
                    <span style={{ fontSize: 12, color: stat.won ? "#4ECDC4" : "#7A7A8C", whiteSpace: "nowrap" }}>{stat.won ? "Won" : "Lost"}</span>
                  </div>

                  {stats.length > 1 && (
                    <button type="button" onClick={() => removePlayer(idx)}
                      style={{ background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.2)", borderRadius: 5, color: "#FF4655", cursor: "pointer", padding: "4px 8px", fontSize: 11, flexShrink: 0 }}>
                      Remove
                    </button>
                  )}
                </div>

                {/* Column headers that mirror CS2 scoreboard */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", flex: 1 }}>
                    ← copy directly from CS2 scoreboard
                  </div>
                </div>

                {/* Main stats: K D A HS% DMG — exactly matching CS2 */}
                <div className="cs2-stats-grid">
                  <StatBox label="K — Kills" value={stat.kills} onChange={(v) => setStat(idx, "kills", v)} max={60} />
                  <StatBox label="D — Deaths" value={stat.deaths} onChange={(v) => setStat(idx, "deaths", v)} max={60} />
                  <StatBox label="A — Assists" value={stat.assists} onChange={(v) => setStat(idx, "assists", v)} max={60} />
                  <StatBox label="HS%" value={stat.hsp} onChange={(v) => setStat(idx, "hsp", v)} max={100} step="1" suffix="%" />
                  <StatBox label="DMG — Damage" value={stat.damage} onChange={(v) => setStat(idx, "damage", v)} max={99999} />
                </div>

                {/* Auto-calculated section */}
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#0A0A0B", borderRadius: 6, border: "1px solid #1E1E22" }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: "#3A3A42", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    Auto-calculated
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>

                    {/* Headshots */}
                    <div>
                      <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Headshots</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 500, color: stat.kills && stat.hsp !== "" ? "#E8E8F0" : "#3A3A42" }}>
                          {stat.kills && stat.hsp !== "" ? hs : "—"}
                        </div>
                        {stat.kills && stat.hsp !== "" && (
                          <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                            ({stat.kills} × {stat.hsp}%)
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ width: 1, background: "#1E1E22", alignSelf: "stretch" }} />

                    {/* Live Score */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                        Est. Score
                      </div>
                      {stat.kills !== "" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 28, fontWeight: 700, color: getScoreColor(score) }}>
                            {score}
                          </div>
                          <div style={{ flex: 1, maxWidth: 140 }}>
                            {/* Progress bar */}
                            <div style={{ background: "#1E1E22", borderRadius: 3, overflow: "hidden", height: 4 }}>
                              <div style={{ width: `${Math.min(100, score)}%`, height: "100%", background: getScoreColor(score), borderRadius: 3, transition: "width 0.3s ease" }} />
                            </div>
                            {/* Rank label */}
                            <div style={{ marginTop: 4, fontSize: 10, fontFamily: "'JetBrains Mono'", color: getScoreColor(score) }}>
                              {score <= 40 ? "Bronze" :
                                score <= 55 ? "Silver" :
                                  score <= 70 ? "Gold" :
                                    score <= 85 ? "Platinum" :
                                      score <= 100 ? "Fighter" : "Master"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, color: "#3A3A42" }}>
                          — <span style={{ fontSize: 11 }}>fill in stats above</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="card" style={{ padding: 16, marginTop: 8 }}>
          <label style={L}>Notes (optional)</label>
          <textarea className="input" placeholder="Match context, highlights..." value={match.notes} onChange={(e) => setMatchField("notes", e.target.value)} rows={2} style={{ resize: "vertical" }} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, fontSize: 14, padding: "12px 16px" }}>
            {submitting ? "Saving..." : "Save Match & Update Rankings"}
          </button>
        </div>

      </form>

      <style>{`
        .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cs2-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        @media (max-width: 540px) {
          .cs2-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 400px) {
          .two-col-grid { grid-template-columns: 1fr; }
          .cs2-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}
