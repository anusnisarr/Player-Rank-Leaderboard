"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { getMe } from "@/lib/api";
import { useUser } from "@/context/AuthContext";

const RANK_COLORS = {
  Fragmaster: "#FFD700", Fragger: "#FF6B35",
  Soldier: "#4ECDC4", Fighter: "#A8DADC", Rookie: "#6C757D",
};
const RANK_ICONS = {
  Fragmaster: "💀", Fragger: "🔥", Soldier: "⚡", Fighter: "🛡️", Rookie: "🌱",
};

export default function PlaygroundsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [playgrounds, setPlaygrounds] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mode, setMode]               = useState(null); // "create" | "join"
  const [selected, setSelected]       = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isOwner, setIsOwner] = useState(null);
  const [createForm, setCreateForm] = useState({ name: "", password: "", description: "" });
  const [joinForm, setJoinForm]     = useState({ code: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
    if(user){
      fetchPlaygrounds();
    }
  }, [user]);


  const fetchPlaygrounds = async () => {
    try {
      const res = await api.get("/playgrounds/mine");
      setPlaygrounds(res.data.data);
      // Auto-select first
      if (res.data.data.length > 0 && !selected) {
        setSelected(res.data.data[0]);
        setMode(null);
        setIsOwner(res.data.data?.owner._id === user?.playerId);
      }
    } catch (err) {
       toast.error("Failed to load playgrounds");
    }
    finally { setLoading(false); }

  };

  const selectPlayground = async (pg) => {
    try {
        const res = await api.get(`/playgrounds/${pg._id}`)
        setSelected(res.data.data);
        setIsOwner(res.data.data?.owner._id === user?.playerId);
        setMode(null);
    } catch (err) {
        toast.error("Failed to load playground");
        console.log(err)
    }
    setMode(null);
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
      toast.success("You Have Joined this playground successfully.");
      setJoinForm({ code: "", password: "" });
      setMode(null);
      await fetchPlaygrounds();
      selectPlayground(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join");
    } finally { setSubmitting(false); }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!joinForm.code.trim()) return toast.error("Enter a code");
    setSubmitting(true);
    try {
      const res = await api.post("/playgrounds/request", joinForm);
      toast.success("Join request sent! Waiting for admin approval.");
      setJoinForm({ code: "", password: "" });
      setMode(null);
      // await fetchPlaygrounds();
      // setSelected(res.data.data);
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

  const handleApprove = async (userId) => {
    const pgId = selected?._id
  try {
    await api.post(`/playgrounds/${pgId}/approve/${userId}`);
    toast.success("Member approved!");
    selectPlayground(selected); // refresh
  } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
};

  const handleReject = async (userId) => {
    const pgId = selected?._id
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
              <form onSubmit={handleRequest}>
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

                    {!isOwner && (<button onClick={() => handleLeave(selected._id)}
                      style={{ fontSize: 11, padding: "8px 12px", borderRadius: 6, background: "transparent", border: "1px solid #3A3A42", color: "#7A7A8C", cursor: "pointer" }}>
                      Leave
                    </button>)}

                    {isOwner && (<button onClick={() => setMode(mode === "requests" ? null : "requests")}
                      style={{ fontSize: 11, padding: "8px 12px", borderRadius: 6,  cursor: "pointer", background: selected.pendingMembers?.length > 0 ? "rgba(255, 217, 0, 0.25)" : "transparent" , color: selected.pendingMembers?.length > 0 ? "rgb(255, 230, 86)" : "#7A7A8C", border: `1px solid  ${selected.pendingMembers?.length > 0 ? "rgb(255, 230, 86)" : "#1E1E22"}` , transition: "all 0.15s" }}>
                      Requests {selected.pendingMembers?.length || 0}
                    </button>)}

                    <button onClick={() => handleDelete(selected._id)}
                      style={{ fontSize: 11, padding: "8px 12px", borderRadius: 6, background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", color: "#FF4655", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Pending approvals (owner only) ── */}
              {isOwner && selected.pendingMembers?.length > 0 &&  mode === "requests" && (
                <div className="card" style={{ padding: "16px 18px", marginBottom: 14, border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.03)" }}>
                  <div style={{ fontSize: 11, color: "#FFD700", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                    ⏳ Pending Requests ({selected.pendingMembers.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selected.pendingMembers.map(u => (
                      <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0A0A0B", borderRadius: 7, flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E8F0" }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: "#7A7A8C" }}>{u.email}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleApprove(u._id)}
                            style={{ padding: "6px 14px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(78,205,196,0.12)", color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.3)", cursor: "pointer" }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => handleReject(u._id)}
                            style={{ padding: "6px 14px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(255,70,85,0.08)", color: "#FF4655", border: "1px solid rgba(255,70,85,0.2)", cursor: "pointer" }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
 
              {/* ── No pending message for non-owners ── */}
              {!isOwner && (
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid #1E1E22", borderRadius: 7, marginBottom: 14, fontSize: 12, color: "#7A7A8C" }}>
                  ℹ️ Join requests are reviewed by the owner before members are added.
                </div>
              )}
 
              {/* ── Members list ── */}
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #1E1E22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#FF4655", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Members ({selected.members?.length || 0})
                  </div>
                </div>
 
                {!selected.members?.length ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#3A3A42", fontSize: 13 }}>No members yet</div>
                ) : (
                  <div>
                    {selected.members.map((m, idx) => {
                      const memberIsOwner = m._id?.toString() === selected.owner?._id?.toString();
                      return (
                        <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: idx < selected.members.length - 1 ? "1px solid rgba(30,30,34,0.6)" : "none" }}>
                          {/* Avatar */}
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 600, color: "#FF4655", flexShrink: 0 }}>
                            {m.name?.[0]?.toUpperCase() || "?"}
                          </div>
 
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E8F0" }}>{m.name}</span>
                              {memberIsOwner && (
                                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(255,70,85,0.12)", color: "#FF4655", border: "1px solid rgba(255,70,85,0.25)", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                  Owner
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "#7A7A8C", marginTop: 2 }}>{m.email}</div>
                          </div>
 
                          {/* Owner can remove non-owner members */}
                          {isOwner && !memberIsOwner && (
                            <button onClick={() => handleRemoveMember(m._id)}
                              style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, color: "#7A7A8C", background: "transparent", border: "1px solid #3A3A42", cursor: "pointer" }}>
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
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
