"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function TestNotificationButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await api.post("/notifications/test"); // your test endpoint
      setMsg("✅ Notification sent successfully");
    } catch (err) {
      setMsg("❌ Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "10px 16px",
          background: loading ? "#1E1E22" : "#FF4655",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Sending..." : "Send Test Notification"}
      </button>

      {msg && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#E8E8F0" }}>
          {msg}
        </div>
      )}
    </div>
  );
}