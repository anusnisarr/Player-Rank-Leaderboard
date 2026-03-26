"use client";
import { useState, useEffect } from "react";
import { getPlayers } from "@/lib/api";
import { RANK_CONFIG, getScoreColor } from "@/lib/utils";
import { RankBadge, PlayerAvatar, ScoreDisplay } from "@/components/UI";
import toast from "react-hot-toast";

// ── Balance algorithm ─────────────────────────────────────────────────────────
// Sort players by score desc, then snake-draft into two teams
// e.g. scores [90,80,70,60,50,40,30] → T1:[90,70,50,30] T2:[80,60,40]
function balanceTeams(players) {
  const sorted = [...players].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
  const t1 = [], t2 = [];
  sorted.forEach((p, i) => {
    // Snake draft: 0→T1, 1→T2, 2→T2, 3→T1, 4→T1, 5→T2 ...
    const round = Math.floor(i / 2);
    if (round % 2 === 0) {
      i % 2 === 0 ? t1.push(p) : t2.push(p);
    } else {
      i % 2 === 0 ? t2.push(p) : t1.push(p);
    }
  });
  return [t1, t2];
}

function teamAvgScore(team) {
  if (!team.length) return 0;
  return +(team.reduce((s, p) => s + (p.avgScore || 0), 0) / team.length).toFixed(1);
}

// ── Fun narrations ────────────────────────────────────────────────────────────
const NARRATIONS = {
  2:  "Two players walk into a server... this isn't a match, it's a therapy session. 1v1 and someone's crying by round 5.",
  3:  "3 players, 2 teams. Someone's playing 1v2. We call that 'character building'. Others call it 'suffering'.",
  4:  "Classic 2v2. Pure chaos. Every round feels personal. Someone WILL uninstall today.",
  5:  "5 players, 3v2. The team of 2 either goes god mode or rage quits in 8 minutes flat.",
  6:  "6 players, 3v3. This is peak friend group CS2. Someone will definitely blame the team.",
  7:  "7 players, 4v3. The team of 3 has nothing to lose and everything to prove. Fear them.",
  8:  "8 players, 4v4. Full squads, balanced chaos. This is where friendships are tested.",
  9:  "9 players, 5v4. Someone gets the extra teammate. They'll still find a way to lose.",
  10: "10 players, 5v5. Full competitive experience. At least 3 people will go AFK by half time.",
};

const BALANCE_COMMENTS = [
  "Teams are so balanced even the universe is confused.",
  "Fair? Yes. Fun? Absolutely. Someone losing their mind? Guaranteed.",
  "The algorithm has spoken. No complaints allowed. (They'll complain anyway.)",
  "Balanced by science, destroyed by skill issues.",
  "Both teams have equal potential to throw. Good luck.",
];

const ROASTS = {
  topFragger:   (name) => `${name} is carrying the fate of their team. No pressure. 😅`,
  bottomFeeder: (name) => `${name} is there for 'moral support'. Classic. 🪑`,
  sameRank:     ()     => "Both teams have the same average rank. This one's gonna hurt.",
  bigGap:       (diff) => `One team averages ${diff} more points. Vegas has already picked a winner.`,
};

export default function TeamRandomizerPage() {
  const [allPlayers, setAllPlayers]   = useState([]);
  const [selected, setSelected]       = useState([]);
  const [teams, setTeams]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [narration, setNarration]     = useState("");
  const [roast, setRoast]             = useState("");
  const [genCount, setGenCount]       = useState(0);

  useEffect(() => {
    getPlayers({}).then(r => setAllPlayers(r.data.data)).catch(() => toast.error("Failed to load players")).finally(() => setLoading(false));
  }, []);

  const togglePlayer = (p) => {
    setTeams(null);
    setSelected(prev =>
      prev.find(s => s._id === p._id)
        ? prev.filter(s => s._id !== p._id)
        : [...prev, p]
    );
  };

  const generateTeams = () => {
    if (selected.length < 2) return toast.error("Select at least 2 players");
    setGenerating(true);

    setTimeout(() => {
      const [t1, t2] = balanceTeams(selected);
      setTeams([t1, t2]);
      setGenCount(c => c + 1);

      // Narration
      const n = NARRATIONS[selected.length] || `${selected.length} players locked in. The algorithm has balanced your fates. Good luck.`;
      setNarration(n);

      // Roast/comment
      const avg1 = teamAvgScore(t1);
      const avg2 = teamAvgScore(t2);
      const diff = Math.abs(avg1 - avg2).toFixed(1);
      const allSorted = [...selected].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
      const top = allSorted[0];
      const bot = allSorted[allSorted.length - 1];

      let r = "";
      if (diff < 3) r = ROASTS.sameRank();
      else if (diff > 15) r = ROASTS.bigGap(diff);
      else r = BALANCE_COMMENTS[Math.floor(Math.random() * BALANCE_COMMENTS.length)];

      // Add top/bottom roast occasionally
      if (Math.random() > 0.5) r += " " + ROASTS.topFragger(top?.name);
      else r += " " + ROASTS.bottomFeeder(bot?.name);

      setRoast(r);
      setGenerating(false);
    }, 800);
  };

  const reset = () => { setTeams(null); setSelected([]); setNarration(""); setRoast(""); };

  const TeamCard = ({ team, name, color, icon }) => {
    const avg = teamAvgScore(team);
    return (
      <div className="card" style={{ padding: 0, overflow: "hidden", border: `1px solid ${color}25` }}>
        {/* Header */}
        <div style={{ background: `${color}15`, borderBottom: `1px solid ${color}25`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color, letterSpacing: "0.06em" }}>{name}</div>
              <div style={{ fontSize: 11, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>{team.length} players</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 700, color }}>{avg}</div>
            <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg Score</div>
          </div>
        </div>

        {/* Players */}
        <div>
          {team.map((p, i) => {
            const cfg = RANK_CONFIG[p.rank] || RANK_CONFIG["Unranked"];
            return (
              <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < team.length - 1 ? "1px solid #1E1E22" : "none" }}>
                <div style={{ fontSize: 11, color: "#3A3A42", fontFamily: "'JetBrains Mono'", minWidth: 16 }}>#{i + 1}</div>
                <PlayerAvatar name={p.name} size={34} rank={p.rank} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <RankBadge rank={p.rank} size="xs" />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <ScoreDisplay score={p.avgScore} size="sm" />
                  <div style={{ fontSize: 9, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", marginTop: 1 }}>
                    {p.kd} K/D
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer avg bar */}
        <div style={{ padding: "10px 18px", background: "#0A0A0B", borderTop: "1px solid #1E1E22" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase" }}>Team Strength</span>
            <span style={{ fontSize: 10, color, fontFamily: "'JetBrains Mono'" }}>{avg}/100</span>
          </div>
          <div style={{ background: "#1E1E22", borderRadius: 3, height: 4, overflow: "hidden" }}>
            <div style={{ width: `${avg}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Header ── */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px, 8vw, 56px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
          TEAM RANDOMIZER
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
          Select players → generate balanced teams · no excuses after this
        </p>
      </div>

      {/* ── Player selector ── */}
      <div className="card animate-slide stagger-2" style={{ padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655" }}>
            — Select Players
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#7A7A8C", fontFamily: "'JetBrains Mono'" }}>
              {selected.length} selected
            </span>
            {selected.length > 0 && (
              <button onClick={reset} className="btn-ghost" style={{ fontSize: 11, padding: "3px 10px" }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ color: "#7A7A8C", fontSize: 13, textAlign: "center", padding: 20 }}>Loading players...</div>
        ) : allPlayers.length === 0 ? (
          <div style={{ color: "#7A7A8C", fontSize: 13, textAlign: "center", padding: 20 }}>No players found. Add some players first.</div>
        ) : (
          <div className="player-selector" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {allPlayers.map(p => {
              const isSelected = selected.find(s => s._id === p._id);
              const cfg = RANK_CONFIG[p.rank] || RANK_CONFIG["Unranked"];
              return (
                <div key={p._id} onClick={() => togglePlayer(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${isSelected ? cfg?.border : "#1E1E22"}`,
                    background: isSelected ? cfg?.bg : "#0A0A0B",
                    transition: "all 0.15s ease",
                    userSelect: "none",
                  }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${isSelected ? cfg?.color : "#3A3A42"}`,
                    background: isSelected ? cfg?.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isSelected && <span style={{ fontSize: 10, color: "#000", fontWeight: 700 }}>✓</span>}
                  </div>
                  <PlayerAvatar name={p.name} size={30} rank={p.rank} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#E8E8F0" : "#A8A8BC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 10, color: cfg?.color, fontFamily: "'JetBrains Mono'" }}>
                      {cfg?.icon} {p.avgScore} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Generate button ── */}
      <div className="animate-slide stagger-3" style={{ marginBottom: 20 }}>
        <button
          onClick={generateTeams}
          disabled={selected.length < 2 || generating}
          className="btn-primary"
          style={{ width: "100%", padding: "14px 20px", fontSize: 15, fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {generating ? (
            <>⚙️ Balancing the universe...</>
          ) : teams ? (
            <>🔀 Regenerate Teams {genCount > 1 ? `(${genCount}x)` : ""}</>
          ) : (
            <>⚡ Generate Balanced Teams</>
          )}
        </button>
        {selected.length < 2 && (
          <div style={{ textAlign: "center", fontSize: 12, color: "#3A3A42", marginTop: 8, fontFamily: "'JetBrains Mono'" }}>
            Select at least 2 players to generate teams
          </div>
        )}
      </div>

      {/* ── Narration box ── */}
      {teams && narration && (
        <div className="animate-slide" style={{ background: "rgba(255,70,85,0.05)", border: "1px solid rgba(255,70,85,0.15)", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#FF4655", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            🎙 Match Commentary
          </div>
          <div style={{ fontSize: 14, color: "#E8E8F0", lineHeight: 1.6 }}>{narration}</div>
          {roast && (
            <div style={{ fontSize: 12, color: "#7A7A8C", marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>
              "{roast}"
            </div>
          )}
        </div>
      )}

      {/* ── Teams ── */}
      {teams && (
        <div className="animate-slide teams-grid">
          <TeamCard team={teams[0]} name="TEAM ALPHA" color="#4ECDC4" icon="🔵" />
          <TeamCard team={teams[1]} name="TEAM BRAVO" color="#FF6B35" icon="🔴" />
        </div>
      )}

      {/* ── Balance reason ── */}
      {teams && (
        <div className="card animate-slide" style={{ padding: "14px 16px", marginTop: 14 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7A7A8C", marginBottom: 12 }}>
            ⚖️ Why These Teams Are Fair
          </div>
          <div style={{ fontSize: 13, color: "#A8A8BC", lineHeight: 1.7 }}>
            Players were sorted by Average Score and distributed using a <span style={{ color: "#E8E8F0", fontWeight: 600 }}>snake draft</span> — the best player goes to Team Alpha, second best to Bravo, third to Bravo, fourth to Alpha, and so on. This ensures no team gets two top players in a row.
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Team Alpha Avg", value: teamAvgScore(teams[0]), color: "#4ECDC4" },
              { label: "Team Bravo Avg", value: teamAvgScore(teams[1]), color: "#FF6B35" },
              { label: "Score Difference", value: Math.abs(teamAvgScore(teams[0]) - teamAvgScore(teams[1])).toFixed(1), color: "#FFD700" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 600, color }}>{value}</div>
                <div style={{ fontSize: 10, color: "#7A7A8C", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono'", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    <style>{`
      .teams-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 600px) {
        .teams-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .player-selector {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
    </div>
  );
}
