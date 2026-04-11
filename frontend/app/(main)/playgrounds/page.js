"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

const RANK_COLORS = {
  Fragmaster: "#FFD700", Fragger: "#FF6B35",
  Soldier: "#4ECDC4", Fighter: "#A8DADC", Rookie: "#6C757D",
};
const RANK_ICONS = {
  Fragmaster: "💀", Fragger: "🔥", Soldier: "⚡", Fighter: "🛡️", Rookie: "🌱",
};

export default function PlaygroundsPage() {
  const router = useRouter();
  const [playgrounds, setPlaygrounds] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mode, setMode]               = useState(null); // "create" | "join"
  const [selected, setSelected]       = useState(null); // viewing leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb]     = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({ name: "", password: "", description: "" });
  // Join form
  const [joinForm, setJoinForm]     = useState({ code: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPlaygrounds(); }, []);

  const fetchPlaygrounds = async () => {
    try {
      const res = await api.get("/playgrounds/mine");
      setPlaygrounds(res.data.data);
      // Auto-select first
      if (res.data.data.length > 0 && !selected) {
        selectPlayground(res.data.data[0]);
      }
    } catch { toast.error("Failed to load playgrounds"); }
    finally { setLoading(false); }
  };

  const selectPlayground = async (pg) => {
    setSelected(pg);
    setMode(null);
    setLoadingLb(true);
    try {
      const res = await api.get(`/playgrounds/${pg._id}/leaderboard`);
      setLeaderboard(res.data.data);
    } catch { toast.error("Failed to load leaderboard"); }
    finally { setLoadingLb(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return toast.error("Name is required");
    setSubmitting(true);
    try {
      const res = await api.post("/playgrounds", createForm);
      toast.success(`Playground created! Code: ${res.data.data.code}`);
      setCreateForm({ name: "", password: "", description: "" });
      setMode(null);
      await fetchPlaygrounds();
      selectPlayground(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create");
    } finally { setSubmitting(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinForm.code.trim()) return toast.error("Enter a code");
    setSubmitting(true);
    try {
      const res = await api.post("/playgrounds/join", joinForm);
      toast.success("Join request sent! Waiting for admin approval.");
      setJoinForm({ code: "", password: "" });
      setMode(null);
      await fetchPlaygrounds();
      selectPlayground(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join");
    } finally { setSubmitting(false); }
  };

  const handleLeave = async (id) => {
    if (!confirm("Leave this playground?")) return;
    try {
      await api.delete(`/playgrounds/${id}/leave`);
      toast.success("Left playground");
      setSelected(null);
      setLeaderboard([]);
      fetchPlaygrounds();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this playground? All stats will be lost.")) return;
    try {
      await api.delete(`/playgrounds/${id}`);
      toast.success("Playground deleted");
      setSelected(null);
      setLeaderboard([]);
      fetchPlaygrounds();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const approveMember = async (pgId, userId) => {
  try {
    await api.post(`/playgrounds/${pgId}/approve/${userId}`);
    toast.success("Member approved!");
    selectPlayground(selected); // refresh
  } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
};

const rejectMember = async (pgId, userId) => {
  try {
    await api.post(`/playgrounds/${pgId}/reject/${userId}`);
    toast.success("Request rejected");
    selectPlayground(selected);
  } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
};

  const L = { fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", boxSizing: "border-box", background: "#0A0A0B", border: "1px solid #1E1E22", borderRadius: 7, padding: "10px 14px", color: "#E8E8F0", fontSize: 13, outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Header ── */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(28px, 8vw, 52px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
          PLAYGROUNDS
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
          Private lobbies with their own leaderboards — invite your squad, track separately
        </p>
      </div>

      {selected?.pendingMembers?.length > 0 && (
  <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 7 }}>
    <div style={{ fontSize: 11, color: "#FFD700", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
      ⏳ Pending Requests ({selected.pendingMembers.length})
    </div>
    {selected?.pendingMembers?.map(u => (
      <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1E1E22" }}>
        <span style={{ fontSize: 13, color: "#E8E8F0" }}>{u.username}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => approveMember(selected._id, u._id)}
            style={{ padding: "4px 12px", borderRadius: 5, fontSize: 11, background: "rgba(78,205,196,0.1)", color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.3)", cursor: "pointer" }}>
            ✓ Approve
          </button>
          <button onClick={() => rejectMember(selected._id, u._id)}
            style={{ padding: "4px 12px", borderRadius: 5, fontSize: 11, background: "rgba(255,70,85,0.08)", color: "#FF4655", border: "1px solid rgba(255,70,85,0.2)", cursor: "pointer" }}>
            ✕ Reject
          </button>
        </div>
      </div>
    ))}
  </div>
)}

      <div className="pg-layout">

        {/* ── Left sidebar ── */}
        <div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button onClick={() => setMode(mode === "create" ? null : "create")}
              style={{ flex: 1, padding: "9px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: mode === "create" ? "rgba(255,70,85,0.15)" : "transparent", color: mode === "create" ? "#FF4655" : "#7A7A8C", border: `1px solid ${mode === "create" ? "rgba(255,70,85,0.4)" : "#1E1E22"}`, transition: "all 0.15s" }}>
              + Create
            </button>
            <button onClick={() => setMode(mode === "join" ? null : "join")}
              style={{ flex: 1, padding: "9px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: mode === "join" ? "rgba(78,205,196,0.1)" : "transparent", color: mode === "join" ? "#4ECDC4" : "#7A7A8C", border: `1px solid ${mode === "join" ? "rgba(78,205,196,0.3)" : "#1E1E22"}`, transition: "all 0.15s" }}>
              ↗ Join
            </button>
          </div>

          {/* Create form */}
          {mode === "create" && (
            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#FF4655", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Create Playground</div>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 12 }}>
                  <label style={L}>Name *</label>
                  <input style={inputStyle} placeholder="Office Squad" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={L}>Description (optional)</label>
                  <input style={inputStyle} placeholder="Our competitive group" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={L}>Password (optional)</label>
                  <input style={inputStyle} type="password" placeholder="Leave empty for open" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <button type="submit" disabled={submitting}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, background: "#FF4655", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em" }}>
                  {submitting ? "Creating..." : "Create →"}
                </button>
              </form>
            </div>
          )}

          {/* Join form */}
          {mode === "join" && (
            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#4ECDC4", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Join Playground</div>
              <form onSubmit={handleJoin}>
                <div style={{ marginBottom: 12 }}>
                  <label style={L}>Playground Code *</label>
                  <input style={{ ...inputStyle, fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 15 }} placeholder="ALF-7X2" value={joinForm.code} onChange={e => setJoinForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={L}>Password (if required)</label>
                  <input style={inputStyle} type="password" placeholder="Leave empty if none" value={joinForm.password} onChange={e => setJoinForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <button type="submit" disabled={submitting}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, background: "#4ECDC4", color: "#000", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em" }}>
                  {submitting ? "Requesting..." : "Request to Join →"}
                </button>
              </form>
            </div>
          )}

          {/* My playgrounds list */}
          <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            My Playgrounds
          </div>
          {loading ? (
            <div style={{ color: "#7A7A8C", fontSize: 12, padding: 10 }}>Loading...</div>
          ) : playgrounds.length === 0 ? (
            <div style={{ color: "#3A3A42", fontSize: 12, padding: "20px 10px", textAlign: "center", lineHeight: 1.8 }}>
              No playgrounds yet.<br />Create one or join with a code.
            </div>
          ) : playgrounds.map(pg => {
            const isActive = selected?._id === pg._id;
            const isOwner  = pg.owner?._id === pg.owner?._id; // simplified
            return (
              <div key={pg._id} onClick={() => selectPlayground(pg)}
                className="card"
                style={{ padding: "12px 14px", marginBottom: 8, cursor: "pointer", borderColor: isActive ? "#FF4655" : undefined, background: isActive ? "rgba(255,70,85,0.04)" : undefined, transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.name}</div>
                    <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", marginTop: 3, letterSpacing: "0.06em" }}>{pg.code}</div>
                    {pg.password && <div style={{ fontSize: 10, color: "#3A3A42", marginTop: 2 }}>🔒 Password protected</div>}
                  </div>
                  <div style={{ fontSize: 11, color: "#3A3A42", flexShrink: 0, marginLeft: 8 }}>
                    {pg.members?.length || 0} members
                  </div>
                </div>
                {pg.description && (
                  <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.description}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Right: leaderboard ── */}
        <div>
          {!selected ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#3A3A42" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
              <div style={{ fontSize: 14, color: "#7A7A8C" }}>Select a playground to view its leaderboard</div>
            </div>
          ) : (
            <>
              {/* Playground header */}
              <div className="card" style={{ padding: "16px 18px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #FF4655, #FF6B35)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "#E8E8F0", letterSpacing: "0.06em", margin: 0 }}>{selected.name}</h2>
                    {selected.description && <div style={{ fontSize: 12, color: "#7A7A8C", marginTop: 2 }}>{selected.description}</div>}
                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em" }}>Code</span>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: "#FF4655", letterSpacing: "0.1em" }}>{selected.code}</span>
                        <button onClick={() => { navigator.clipboard.writeText(selected.code); toast.success("Code copied!"); }}
                          style={{ fontSize: 10, color: "#7A7A8C", background: "#1E1E22", border: "none", borderRadius: 4, padding: "2px 7px", cursor: "pointer" }}>
                          Copy
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: "#7A7A8C" }}>{selected.members?.length || 0} members</div>
                      {selected.password && <div style={{ fontSize: 11, color: "#3A3A42" }}>🔒 Protected</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => router.push(`/add-match?playground=${selected._id}`)}
                      className="btn-primary" style={{ fontSize: 12, padding: "8px 14px" }}>
                      + Add Match
                    </button>
                    <button onClick={() => handleLeave(selected._id)}
                      style={{ fontSize: 11, padding: "8px 12px", borderRadius: 6, background: "transparent", border: "1px solid #3A3A42", color: "#7A7A8C", cursor: "pointer" }}>
                      Leave
                    </button>
                    <button onClick={() => handleDelete(selected._id)}
                      style={{ fontSize: 11, padding: "8px 12px", borderRadius: 6, background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", color: "#FF4655", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card" style={{ overflow: "hidden" }}>
                {loadingLb ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#7A7A8C" }}>Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                    <div style={{ fontSize: 14, color: "#E8E8F0", marginBottom: 6 }}>No stats yet</div>
                    <div style={{ fontSize: 12, color: "#7A7A8C" }}>Add a match to this playground to see rankings</div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["#","Player","Score","Rank","K/D","Kills","Deaths","HS%","Matches","W/L"].map(h => (
                            <th key={h} style={{ padding: "10px 14px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap", textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((p, idx) => {
                          const rc = RANK_COLORS[p.rank] || "#6C757D";
                          const ri = RANK_ICONS[p.rank]  || "🌱";
                          return (
                            <tr key={p._id} style={{ cursor: "pointer" }} onClick={() => router.push(`/player/${p._id}`)}>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#7A7A8C" }}>
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                              </td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "#E8E8F0" }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: "#7A7A8C" }}>{p.team}</div>
                              </td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: rc }}>{p.score}</td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: `${rc}15`, color: rc, border: `1px solid ${rc}30`, fontWeight: 600 }}>
                                  {ri} {p.rank}
                                </span>
                              </td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{p.kd}</td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#4ECDC4" }}>{p.totalKills}</td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#FF4655" }}>{p.totalDeaths}</td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#FFD700" }}>{p.hsp}%</td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{p.matchesPlayed}</td>
                              <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>
                                <span style={{ color: "#4ECDC4" }}>{p.wins}</span>
                                <span style={{ color: "#3A3A42" }}>/</span>
                                <span style={{ color: "#FF4655" }}>{p.losses}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .pg-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .pg-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
