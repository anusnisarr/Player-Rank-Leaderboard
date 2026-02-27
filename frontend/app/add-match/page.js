"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayers, createMatch } from "@/lib/api";
import { MAPS } from "@/lib/utils";
import toast from "react-hot-toast";

const EMPTY_STAT = {
  player: "",
  kills: "",
  deaths: "",
  assists: "",
  headshots: "",
  damage: "",
  kast: "",
  won: false,
};

const StatInput = ({ label, value, onChange, hint, max }) => (
  <div>
    <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
      {label}
      {hint && <span style={{ marginLeft: 4, color: "#3A3A42" }}>({hint})</span>}
    </label>
    <input
      className="input"
      type="number"
      min="0"
      max={max}
      step="1"
      placeholder="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ fontFamily: "'JetBrains Mono'", textAlign: "center" }}
    />
  </div>
);

export default function AddMatchPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [match, setMatch] = useState({
    title: "",
    map: "",
    date: new Date().toISOString().slice(0, 10),
    teamA: "",
    teamB: "",
    scoreA: "",
    scoreB: "",
    totalRounds: "",
    notes: "",
  });

  const [stats, setStats] = useState([{ ...EMPTY_STAT }]);

  useEffect(() => {
    getPlayers()
      .then((r) => setPlayers(r.data.data))
      .catch(() => toast.error("Failed to load players"))
      .finally(() => setLoadingPlayers(false));
  }, []);

  const setMatchField = (k, v) => setMatch((m) => ({ ...m, [k]: v }));

  const setStat = (idx, key, val) => {
    setStats((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: val };
      return updated;
    });
  };

  const addPlayer = () => setStats((s) => [...s, { ...EMPTY_STAT }]);
  const removePlayer = (idx) => setStats((s) => s.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!match.title.trim()) return toast.error("Match title is required");
    if (!match.totalRounds || Number(match.totalRounds) < 1) return toast.error("Total rounds required");

    const validStats = stats.filter((s) => s.player);
    if (validStats.length === 0) return toast.error("Add at least one player's stats");

    for (const s of validStats) {
      if (s.kills === "" || s.deaths === "" || s.assists === "" || s.headshots === "" || s.damage === "" || s.kast === "") {
        return toast.error("Fill in all stats for each player");
      }
      if (Number(s.kast) > 100) return toast.error("KAST% cannot exceed 100");
      if (Number(s.headshots) > Number(s.kills)) return toast.error("Headshots cannot exceed kills");
    }

    try {
      setSubmitting(true);
      const payload = {
        ...match,
        totalRounds: Number(match.totalRounds),
        scoreA: Number(match.scoreA) || 0,
        scoreB: Number(match.scoreB) || 0,
        playerStats: validStats.map((s) => ({
          player: s.player,
          kills: Number(s.kills),
          deaths: Number(s.deaths),
          assists: Number(s.assists),
          headshots: Number(s.headshots),
          damage: Number(s.damage),
          kast: Number(s.kast),
          rounds: Number(match.totalRounds),
          won: s.won,
        })),
      };
      await createMatch(payload);
      toast.success("Match added! Stats updated.");
      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add match");
    } finally {
      setSubmitting(false);
    }
  };

  const availablePlayers = (currentIdx) =>
    players.filter(
      (p) =>
        !stats.some((s, i) => i !== currentIdx && s.player === p._id) ||
        stats[currentIdx].player === p._id
    );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 52,
            letterSpacing: "0.04em",
            color: "#E8E8F0",
            lineHeight: 1,
          }}
        >
          ADD MATCH
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 14, marginTop: 6 }}>
          Enter match details and per-player statistics
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Match info */}
        <div className="card animate-slide stagger-2" style={{ padding: 28, marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#FF4655",
              marginBottom: 20,
            }}
          >
            — Match Info
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
                Match Title *
              </label>
              <input
                className="input"
                placeholder="e.g. ESL Pro League S18 — Grand Final"
                value={match.title}
                onChange={(e) => setMatchField("title", e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Map</label>
              <select
                className="input"
                value={match.map}
                onChange={(e) => setMatchField("map", e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="">Select map</option>
                {MAPS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Date</label>
              <input
                className="input"
                type="date"
                value={match.date}
                onChange={(e) => setMatchField("date", e.target.value)}
              />
            </div>
          </div>

          {/* Teams and score */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 12, alignItems: "end", marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Team A</label>
              <input className="input" placeholder="Team Alpha" value={match.teamA} onChange={(e) => setMatchField("teamA", e.target.value)} />
            </div>
            <div style={{ paddingBottom: 10, textAlign: "center" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Score A</label>
                <input className="input" type="number" min="0" max="30" placeholder="0" value={match.scoreA} onChange={(e) => setMatchField("scoreA", e.target.value)} style={{ width: 70, textAlign: "center", fontFamily: "'JetBrains Mono'" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
              <span style={{ color: "#3A3A42", fontFamily: "'JetBrains Mono'", fontSize: 20 }}>:</span>
            </div>
            <div style={{ paddingBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Score B</label>
              <input className="input" type="number" min="0" max="30" placeholder="0" value={match.scoreB} onChange={(e) => setMatchField("scoreB", e.target.value)} style={{ width: 70, textAlign: "center", fontFamily: "'JetBrains Mono'" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Team B</label>
              <input className="input" placeholder="Team Beta" value={match.teamB} onChange={(e) => setMatchField("teamB", e.target.value)} />
            </div>
          </div>

          <div style={{ maxWidth: 200 }}>
            <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
              Total Rounds *
            </label>
            <input
              className="input"
              type="number"
              min="1"
              max="60"
              placeholder="24"
              value={match.totalRounds}
              onChange={(e) => setMatchField("totalRounds", e.target.value)}
              style={{ fontFamily: "'JetBrains Mono'" }}
              required
            />
          </div>
        </div>

        {/* Player stats */}
        <div className="animate-slide stagger-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655" }}>
              — Player Statistics
            </div>
            <button
              type="button"
              onClick={addPlayer}
              className="btn-ghost"
              style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add Player
            </button>
          </div>

          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="card"
              style={{ padding: 24, marginBottom: 16, position: "relative" }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <select
                  className="input"
                  value={stat.player}
                  onChange={(e) => setStat(idx, "player", e.target.value)}
                  style={{ maxWidth: 280, cursor: "pointer" }}
                  required
                >
                  <option value="">Select player...</option>
                  {availablePlayers(idx).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.team ? `(${p.team})` : ""}
                    </option>
                  ))}
                </select>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Won toggle */}
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: stat.won ? "#4ECDC4" : "#7A7A8C" }}>
                    <div
                      onClick={() => setStat(idx, "won", !stat.won)}
                      style={{
                        width: 36,
                        height: 20,
                        borderRadius: 10,
                        background: stat.won ? "#4ECDC4" : "#1E1E22",
                        border: `1px solid ${stat.won ? "#4ECDC4" : "#3A3A42"}`,
                        position: "relative",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: stat.won ? 18 : 2,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "white",
                          transition: "left 0.2s ease",
                        }}
                      />
                    </div>
                    {stat.won ? "Won" : "Lost"}
                  </label>

                  {stats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(idx)}
                      style={{
                        background: "rgba(255,70,85,0.1)",
                        border: "1px solid rgba(255,70,85,0.2)",
                        borderRadius: 6,
                        color: "#FF4655",
                        cursor: "pointer",
                        padding: "4px 10px",
                        fontSize: 12,
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
                <StatInput label="Kills" value={stat.kills} onChange={(v) => setStat(idx, "kills", v)} max={60} />
                <StatInput label="Deaths" value={stat.deaths} onChange={(v) => setStat(idx, "deaths", v)} max={60} />
                <StatInput label="Assists" value={stat.assists} onChange={(v) => setStat(idx, "assists", v)} max={60} />
                <StatInput label="Headshots" value={stat.headshots} onChange={(v) => setStat(idx, "headshots", v)} hint="≤ kills" max={60} />
                <StatInput label="Damage" value={stat.damage} onChange={(v) => setStat(idx, "damage", v)} max={9999} />
                <StatInput label="KAST %" value={stat.kast} onChange={(v) => setStat(idx, "kast", v)} hint="0–100" max={100} />
              </div>

              {/* Live preview */}
              {stat.kills !== "" && match.totalRounds && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #1E1E22",
                    display: "flex",
                    gap: 24,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "KPR", val: (Number(stat.kills) / Number(match.totalRounds)).toFixed(2) },
                    { label: "DPR", val: (Number(stat.deaths) / Number(match.totalRounds)).toFixed(2) },
                    { label: "APR", val: (Number(stat.assists) / Number(match.totalRounds)).toFixed(2) },
                    { label: "HS%", val: stat.kills > 0 ? ((Number(stat.headshots) / Number(stat.kills)) * 100).toFixed(0) + "%" : "0%" },
                    { label: "ADR", val: (Number(stat.damage) / Number(match.totalRounds)).toFixed(1) },
                    { label: "K/D", val: stat.deaths > 0 ? (Number(stat.kills) / Number(stat.deaths)).toFixed(2) : Number(stat.kills).toFixed(2) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 500, color: "#A8DADC" }}>{val}</div>
                      <div style={{ fontSize: 10, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono'", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card animate-slide stagger-4" style={{ padding: 24, marginTop: 8 }}>
          <label style={{ display: "block", fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Notes (optional)
          </label>
          <textarea
            className="input"
            placeholder="Match context, highlights, notes..."
            value={match.notes}
            onChange={(e) => setMatchField("notes", e.target.value)}
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ flex: 1, fontSize: 15, padding: "12px 24px" }}
          >
            {submitting ? "Saving match..." : "Save Match & Update Rankings"}
          </button>
        </div>
      </form>
    </div>
  );
}
