"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayers, createMatch } from "@/lib/api";
import { MAPS } from "@/lib/utils";
import toast from "react-hot-toast";

const EMPTY_STAT = {
  player: "", kills: "", deaths: "", assists: "",
  hsp: "",      // HS% — typed directly from CS2 scoreboard
  damage: "",
  kastMode: "auto", // "auto" | "manual"
  kastManual: "",
  won: false,
};

const L = { display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 };

// Auto-estimate KAST% from kills/assists/deaths/rounds
function estimateKast(kills, deaths, assists, rounds) {
  if (!rounds || rounds === 0) return 70;
  const k = Number(kills) || 0;
  const d = Number(deaths) || 0;
  const a = Number(assists) || 0;
  const r = Number(rounds);
  // Heuristic: each kill/assist contributes to a round, survival is the rest
  const positiveRounds = Math.min(r, k + a + Math.max(0, r - d));
  const raw = (positiveRounds / r) * 100;
  return Math.min(95, Math.max(30, Math.round(raw)));
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

  const getKast = (s) => s.kastMode === "manual" && s.kastManual !== ""
    ? Number(s.kastManual)
    : estimateKast(s.kills, s.deaths, s.assists, match.totalRounds);

  const getHeadshots = (s) => hspToHeadshots(s.kills, s.hsp);

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
        totalRounds: rounds,
        scoreA: Number(match.scoreA) || 0,
        scoreB: Number(match.scoreB) || 0,
        playerStats: validStats.map((s) => ({
          player: s.player,
          kills: Number(s.kills),
          deaths: Number(s.deaths),
          assists: Number(s.assists),
          headshots: getHeadshots(s),
          damage: Number(s.damage),
          kast: getKast(s),
          rounds,
          won: s.won,
        })),
      });
      toast.success("Match saved! Rankings updated.");
      router.push("/");
    } catch (err) {
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

      {/* CS2 scoreboard cheatsheet */}
      <div className="animate-slide stagger-1" style={{
        background: "rgba(255,70,85,0.05)",
        border: "1px solid rgba(255,70,85,0.15)",
        borderRadius: 8,
        padding: "14px 16px",
        marginBottom: 20,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 18, flexShrink: 0 }}>💡</div>
        <div style={{ fontSize: 13, color: "#A8A8BC", lineHeight: 1.7 }}>
          <span style={{ color: "#E8E8F0", fontWeight: 600 }}>Copy from CS2 scoreboard: </span>
          <span style={{ fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>K</span> → Kills &nbsp;·&nbsp;
          <span style={{ fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>D</span> → Deaths &nbsp;·&nbsp;
          <span style={{ fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>A</span> → Assists &nbsp;·&nbsp;
          <span style={{ fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>HS%</span> → enter as-is &nbsp;·&nbsp;
          <span style={{ fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>DMG</span> → Damage
          <br />
          <span style={{ color: "#7A7A8C", fontSize: 12 }}>Headshots & KAST% are calculated automatically. You can override KAST% manually if needed.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

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
            const kast = getKast(stat);
            const hasPreview = stat.kills !== "" && match.totalRounds;
            const rounds = Number(match.totalRounds) || 1;

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

                {/* Auto-computed fields */}
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#0A0A0B", borderRadius: 6, border: "1px solid #1E1E22" }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: "#3A3A42", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    Auto-calculated
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>

                    {/* Headshots auto */}
                    <div>
                      <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Headshots</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 500,
                          color: stat.kills && stat.hsp ? "#E8E8F0" : "#3A3A42",
                        }}>
                          {stat.kills && stat.hsp !== "" ? hs : "—"}
                        </div>
                        {stat.kills && stat.hsp !== "" && (
                          <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
                            ({stat.kills} × {stat.hsp}%)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, background: "#1E1E22", alignSelf: "stretch" }} />

                    {/* KAST% */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                        KAST%
                        <span style={{ marginLeft: 6, color: "#3A3A42", textTransform: "none", letterSpacing: 0 }}>
                          {stat.kastMode === "auto" ? "(estimated)" : "(manual)"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 500, color: "#A8DADC", minWidth: 40 }}>
                          {kast}%
                        </div>

                        {/* Toggle auto/manual */}
                        <div style={{ display: "flex", gap: 4 }}>
                          <button type="button"
                            onClick={() => setStat(idx, "kastMode", "auto")}
                            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono'", cursor: "pointer", background: stat.kastMode === "auto" ? "rgba(168,218,220,0.12)" : "transparent", color: stat.kastMode === "auto" ? "#A8DADC" : "#3A3A42", border: `1px solid ${stat.kastMode === "auto" ? "rgba(168,218,220,0.3)" : "#1E1E22"}`, transition: "all 0.15s" }}>
                            Auto
                          </button>
                          <button type="button"
                            onClick={() => setStat(idx, "kastMode", "manual")}
                            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono'", cursor: "pointer", background: stat.kastMode === "manual" ? "rgba(168,218,220,0.12)" : "transparent", color: stat.kastMode === "manual" ? "#A8DADC" : "#3A3A42", border: `1px solid ${stat.kastMode === "manual" ? "rgba(168,218,220,0.3)" : "#1E1E22"}`, transition: "all 0.15s" }}>
                            Manual
                          </button>
                        </div>

                        {stat.kastMode === "manual" && (
                          <input
                            className="input"
                            type="number" min="0" max="100"
                            placeholder="e.g. 74"
                            value={stat.kastManual}
                            onChange={(e) => setStat(idx, "kastManual", e.target.value)}
                            style={{ width: 80, fontFamily: "'JetBrains Mono'", textAlign: "center", padding: "5px 8px", fontSize: 13 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live preview bar */}
                {hasPreview && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1E1E22", display: "flex", gap: 18, flexWrap: "wrap" }}>
                    {[
                      { label: "K/D", val: stat.deaths > 0 ? (Number(stat.kills) / Number(stat.deaths)).toFixed(2) : "∞" },
                      { label: "KPR", val: (Number(stat.kills) / rounds).toFixed(2) },
                      { label: "ADR", val: (Number(stat.damage) / rounds).toFixed(1) },
                      { label: "Rating ≈", val: (() => {
                          const k = Number(stat.kills); const d = Number(stat.deaths); const a = Number(stat.assists);
                          const dmg = Number(stat.damage); const h = hs;
                          if (!k && !d) return "—";
                          const kpr = k / rounds; const surv = (rounds - d) / rounds;
                          const kastR = kast / 100; const apr = a / rounds / 0.3;
                          const hsR = k > 0 ? (h / k) / 0.45 : 0; const adrR = dmg / rounds / 75;
                          const r = kpr/0.679*0.38 + surv*0.22 + kastR*0.22 + apr*0.1 + hsR*0.04 + adrR*0.04;
                          return r.toFixed(2);
                        })(),
                        highlight: true
                      },
                    ].map(({ label, val, highlight }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 500, color: highlight ? "#FF4655" : "#A8DADC" }}>{val}</div>
                        <div style={{ fontSize: 9, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono'", marginTop: 1 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
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
