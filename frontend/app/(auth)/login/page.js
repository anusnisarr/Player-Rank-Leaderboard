"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [show, setShow]       = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setShow(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post(`/auth/login`, form);
      if (!res.data.success) throw new Error(res.data.error || "Login failed");
      // router.replace("/");
      // router.refresh();
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#080809", position: "relative", overflow: "hidden", padding: "20px 16px",
    }}>

      {/* ── Animated grid background ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,70,85,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,70,85,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }} />

      {/* ── Corner decorations ── */}
      {mounted && (
        <>
          <div style={{ position: "absolute", top: 24, left: 24, width: 40, height: 40, borderTop: "2px solid rgba(255,70,85,0.4)", borderLeft: "2px solid rgba(255,70,85,0.4)" }} />
          <div style={{ position: "absolute", top: 24, right: 24, width: 40, height: 40, borderTop: "2px solid rgba(255,70,85,0.4)", borderRight: "2px solid rgba(255,70,85,0.4)" }} />
          <div style={{ position: "absolute", bottom: 24, left: 24, width: 40, height: 40, borderBottom: "2px solid rgba(255,70,85,0.4)", borderLeft: "2px solid rgba(255,70,85,0.4)" }} />
          <div style={{ position: "absolute", bottom: 24, right: 24, width: 40, height: 40, borderBottom: "2px solid rgba(255,70,85,0.4)", borderRight: "2px solid rgba(255,70,85,0.4)" }} />
        </>
      )}

      {/* ── Glowing orb ── */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,70,85,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Main card ── */}
      <div style={{
        width: "100%", maxWidth: 420, position: "relative",
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(28px, 6vw, 48px)",
            letterSpacing: "0.12em", color: "#E8E8F0", lineHeight: 1, margin: 0,
          }}>
           RANKIFY
          </h1>
          <p style={{ color: "#3A3A42", fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 8 }}>
            AUTHENTICATE TO CONTINUE
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(14,14,16,0.95)",
          border: "1px solid #1E1E22",
          borderRadius: 12,
          padding: "32px 28px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FF4655, transparent)" }} />

          {/* Tab header */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid #1E1E22" }}>
            <div style={{ flex: 1, textAlign: "center", paddingBottom: 12, borderBottom: "2px solid #FF4655", color: "#E8E8F0", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Login
            </div>
            <Link href="/register" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ textAlign: "center", paddingBottom: 12, color: "#3A3A42", fontSize: 12, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.15s" }}>
                Register
              </div>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#3A3A42" }}>◈</span>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0A0A0B", border: "1px solid #1E1E22",
                    borderRadius: 7, padding: "12px 14px 12px 36px",
                    color: "#E8E8F0", fontSize: 14, outline: "none",
                    fontFamily: "'JetBrains Mono'", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#FF4655"}
                  onBlur={e => e.target.style.borderColor = "#1E1E22"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#3A3A42" }}>◆</span>
                <input
                  type={show ? "password" : "text"}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0A0A0B", border: "1px solid #1E1E22",
                    borderRadius: 7, padding: "12px 14px 12px 36px",
                    color: "#E8E8F0", fontSize: 14, outline: "none",
                    fontFamily: "'JetBrains Mono'", transition: "border-color 0.2s",
                    letterSpacing: form.password ? "0.2em" : "normal",
                  }}
                  onFocus={e => e.target.style.borderColor = "#FF4655"}
                  onBlur={e => e.target.style.borderColor = "#1E1E22"}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 6,
                background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.25)",
                fontSize: 12, color: "#FF4655", fontFamily: "'JetBrains Mono'",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 7,
                background: loading ? "#1E1E22" : "#FF4655",
                border: "none", color: loading ? "#7A7A8C" : "#fff",
                fontSize: 13, fontWeight: 700, fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.15em", cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              {loading ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◈</span>
                  AUTHENTICATING...
                </>
              ) : "ENTER THE SERVER →"}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#3A3A42" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#FF4655", textDecoration: "none", fontWeight: 600 }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Bottom tag */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "#2A2A2E", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em" }}>
          FRIEND GROUP · PRIVATE · COMPETITIVE
        </div>
      </div>

    </div>
  );
}