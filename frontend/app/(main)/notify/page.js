"use client";
import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const QUICK_MESSAGES = [
  {
    id: "lets_play",
    icon: "🎮",
    label: "Let's Play!",
    title: "🎮 Game Time!",
    body: "Someone wants to play! Jump in the server.",
    color: "#4ECDC4",
    bg: "rgba(78,205,196,0.08)",
    border: "rgba(78,205,196,0.25)",
  },
  {
    id: "server_up",
    icon: "🖥️",
    label: "Server is Up",
    title: "🖥️ Server is Live",
    body: "The server is up and running. Connect now!",
    color: "#4ECDC4",
    bg: "rgba(78,205,196,0.08)",
    border: "rgba(78,205,196,0.25)",
  },
  {
    id: "warmup",
    icon: "🔥",
    label: "Warmup Starting",
    title: "🔥 Warmup Time",
    body: "Warmup starting — get in before the match begins!",
    color: "#FF6B35",
    bg: "rgba(255,107,53,0.08)",
    border: "rgba(255,107,53,0.25)",
  },
  {
    id: "match_starting",
    icon: "⚡",
    label: "Match Starting",
    title: "⚡ Match is Starting!",
    body: "Match is about to begin — last call to join!",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.08)",
    border: "rgba(255,215,0,0.25)",
  },
  {
    id: "gg",
    icon: "🏆",
    label: "GG — Match Done",
    title: "🏆 Match Over — GG!",
    body: "Match is done. Check the leaderboard for updated rankings!",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.08)",
    border: "rgba(255,215,0,0.25)",
  },
  {
    id: "afk_kick",
    icon: "👋",
    label: "AFK Warning",
    title: "👋 You There?",
    body: "Someone might be AFK. Wake up — we need you in the server!",
    color: "#FF4655",
    bg: "rgba(255,70,85,0.08)",
    border: "rgba(255,70,85,0.25)",
  },
  {
    id: "rank_update",
    icon: "📊",
    label: "Rankings Updated",
    title: "📊 Rankings Updated!",
    body: "New match recorded — check where you stand on the leaderboard.",
    color: "#A8DADC",
    bg: "rgba(168,218,220,0.08)",
    border: "rgba(168,218,220,0.25)",
  },
  {
    id: "rematch",
    icon: "🔄",
    label: "Rematch?",
    title: "🔄 Rematch?",
    body: "Someone wants a rematch. You in?",
    color: "#FF6B35",
    bg: "rgba(255,107,53,0.08)",
    border: "rgba(255,107,53,0.25)",
  },
];

export default function NotifyPage() {
  const [ip, setIp]               = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody]   = useState("");
  const [sending, setSending]     = useState(null); // id of button being sent
  const [sent, setSent]           = useState([]);   // ids of recently sent

  const send = async (title, body, id) => {
    setSending(id);
    try {
      await api.post("/notifications/send-all", { title, body, url: "/" });
      toast.success("Notification sent to everyone!");
      setSent(prev => [...prev, id]);
      setTimeout(() => setSent(prev => prev.filter(s => s !== id)), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send");
    } finally {
      setSending(null);
    }
  };

  const sendWithIp = async () => {
    if (!ip.trim()) return toast.error("Enter an IP address first");
    await send(
      "🖥️ Server IP",
      `Connect to: ${ip.trim()} — server is live, get in!`,
      "ip"
    );
  };

  const sendCustom = async () => {
    if (!customTitle.trim()) return toast.error("Enter a title");
    if (!customBody.trim())  return toast.error("Enter a message");
    await send(customTitle.trim(), customBody.trim(), "custom");
    setCustomTitle("");
    setCustomBody("");
  };

  const L = {
    fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
    display: "block",
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Header ── */}
      <div className="animate-slide stagger-1" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(28px, 8vw, 52px)", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
          NOTIFY SQUAD
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 13, marginTop: 4 }}>
          Push notifications to everyone who has the app installed
        </p>
      </div>

      {/* ── Quick actions ── */}
      <div className="card animate-slide stagger-2" style={{ padding: "20px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655", marginBottom: 16 }}>
          — Quick Notifications
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {QUICK_MESSAGES.map(m => {
            const isSending = sending === m.id;
            const wasSent   = sent.includes(m.id);
            return (
              <button key={m.id}
                onClick={() => send(m.title, m.body, m.id)}
                disabled={!!sending}
                style={{
                  padding: "14px 12px",
                  borderRadius: 8,
                  background: wasSent ? "rgba(78,205,196,0.1)" : m.bg,
                  border: `1px solid ${wasSent ? "rgba(78,205,196,0.4)" : m.border}`,
                  cursor: sending ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                  opacity: sending && !isSending ? 0.5 : 1,
                }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>
                  {isSending ? "⏳" : wasSent ? "✅" : m.icon}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: wasSent ? "#4ECDC4" : m.color, marginBottom: 3 }}>
                  {wasSent ? "Sent!" : m.label}
                </div>
                <div style={{ fontSize: 10, color: "#7A7A8C", lineHeight: 1.5 }}>
                  {m.body.length > 50 ? m.body.slice(0, 50) + "..." : m.body}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── IP Sender ── */}
      <div className="card animate-slide stagger-3" style={{ padding: "20px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655", marginBottom: 16 }}>
          — Send Server IP
        </div>
        <p style={{ fontSize: 13, color: "#7A7A8C", marginBottom: 16, lineHeight: 1.6 }}>
          Paste your CS2 server IP and blast it to everyone so they can connect instantly.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={L}>Server IP Address</label>
            <input
              className="input"
              placeholder="e.g. 192.168.1.100:27015"
              value={ip}
              onChange={e => setIp(e.target.value)}
              style={{ fontFamily: "'JetBrains Mono'", fontSize: 14 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={sendWithIp}
              disabled={!!sending}
              className="btn-primary"
              style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              {sending === "ip" ? "⏳ Sending..." : "🖥️ Send IP to All"}
            </button>
          </div>
        </div>

        {/* IP preview */}
        {ip && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#0A0A0B", borderRadius: 6, border: "1px solid #1E1E22" }}>
            <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Preview</div>
            <div style={{ fontSize: 13, color: "#E8E8F0", fontWeight: 600 }}>🖥️ Server IP</div>
            <div style={{ fontSize: 12, color: "#A8A8BC", marginTop: 2 }}>Connect to: {ip} — server is live, get in!</div>
          </div>
        )}
      </div>

      {/* ── Custom message ── */}
      <div className="card animate-slide stagger-4" style={{ padding: "20px 16px" }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4655", marginBottom: 16 }}>
          — Custom Message
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={L}>Title</label>
            <input
              className="input"
              placeholder="e.g. 🎮 Important Announcement"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              maxLength={50}
            />
            <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", marginTop: 4, textAlign: "right" }}>
              {customTitle.length}/50
            </div>
          </div>
          <div>
            <label style={L}>Message</label>
            <textarea
              className="input"
              placeholder="Type your message here..."
              value={customBody}
              onChange={e => setCustomBody(e.target.value)}
              rows={3}
              maxLength={150}
              style={{ resize: "vertical" }}
            />
            <div style={{ fontSize: 10, color: "#3A3A42", fontFamily: "'JetBrains Mono'", marginTop: 4, textAlign: "right" }}>
              {customBody.length}/150
            </div>
          </div>

          {/* Preview */}
          {(customTitle || customBody) && (
            <div style={{ padding: "12px 14px", background: "#0A0A0B", borderRadius: 6, border: "1px solid #1E1E22" }}>
              <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Preview</div>
              <div style={{ fontSize: 13, color: "#E8E8F0", fontWeight: 600 }}>{customTitle || "Title..."}</div>
              <div style={{ fontSize: 12, color: "#A8A8BC", marginTop: 3, lineHeight: 1.5 }}>{customBody || "Message..."}</div>
            </div>
          )}

          <button
            onClick={sendCustom}
            disabled={!!sending || !customTitle || !customBody}
            className="btn-primary"
            style={{ padding: "12px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {sending === "custom" ? "⏳ Sending..." : "📣 Send to Everyone"}
          </button>
        </div>
      </div>

    </div>
  );
}