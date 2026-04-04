"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [show, setShow]       = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  useEffect(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  }, [form.password]);

  const strengthLabel = ["", "Weak", "Okay", "Good", "Strong", "Lethal"][strength] || "";
  const strengthColor = ["", "#FF4655", "#FF6B35", "#FFD700", "#4ECDC4", "#4ECDC4"][strength] || "#3A3A42";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords don't match. Try again.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Registration failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, type = "text", icon) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 10, color: "#7A7A8C",
        fontFamily: "'JetBrains Mono'", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: 8
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", fontSize: 13, color: "#3A3A42"
        }}>{icon}</span>
        <input
          type={type} required
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#0A0A0B", border: "1px solid #1E1E22",
            borderRadius: 7, padding: "12px 14px 12px 36px",
            color: "#E8E8F0", fontSize: 14, outline: "none",
            fontFamily: (field === "password" || field === "confirm") ? "'JetBrains Mono'" : "inherit",
            letterSpacing: (field === "password" || field === "confirm") && form[field] ? "0.15em" : "normal",
            transition: "all 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "#FF4655"}
          onBlur={e => e.target.style.borderColor = "#1E1E22"}
          autoFocus={false}
        />
      </div>
    </div>
  );
 
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#080809", position: "relative", overflow: "hidden", padding: "20px 16px",
    }}>
 
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,70,85,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,70,85,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }} />
 
      {/* Corner decorations */}
      <div style={{ position: "absolute", top: 24, left: 24, width: 40, height: 40, borderTop: "2px solid rgba(255,70,85,0.4)", borderLeft: "2px solid rgba(255,70,85,0.4)" }} />
      <div style={{ position: "absolute", top: 24, right: 24, width: 40, height: 40, borderTop: "2px solid rgba(255,70,85,0.4)", borderRight: "2px solid rgba(255,70,85,0.4)" }} />
      <div style={{ position: "absolute", bottom: 24, left: 24, width: 40, height: 40, borderBottom: "2px solid rgba(255,70,85,0.4)", borderLeft: "2px solid rgba(255,70,85,0.4)" }} />
      <div style={{ position: "absolute", bottom: 24, right: 24, width: 40, height: 40, borderBottom: "2px solid rgba(255,70,85,0.4)", borderRight: "2px solid rgba(255,70,85,0.4)" }} />
 
      {/* Glow */}
      <div style={{
        position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,70,85,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
 
      {/* Main card */}
      <div style={{
        width: "100%", maxWidth: 440, position: "relative",
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
 
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 14px" }}>
            <div style={{ position: "absolute", inset: 0, border: "1.5px solid rgba(255,70,85,0.5)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,70,85,0.5)", transform: "translateY(-50%)" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,70,85,0.5)", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 6, height: 6, borderRadius: "50%", background: "#FF4655", transform: "translate(-50%, -50%)" }} />
          </div> */}
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(26px, 6vw, 48px)", letterSpacing: "0.12em", color: "#E8E8F0", lineHeight: 1, margin: 0 }}>
            JOIN THE RANKIFY
          </h1>
          <p style={{ color: "#3A3A42", fontSize: 11, fontFamily: "'JetBrains Mono'", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6 }}>
            CREATE YOUR ACCOUNT
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
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FF4655, transparent)" }} />
 
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid #1E1E22" }}>
            <Link href="/login" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ textAlign: "center", paddingBottom: 12, color: "#3A3A42", fontSize: 12, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                Login
              </div>
            </Link>
            <div style={{ flex: 1, textAlign: "center", paddingBottom: 12, borderBottom: "2px solid #FF4655", color: "#E8E8F0", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Register
            </div>
          </div>
 
        <form onSubmit={handleSubmit}>
          {renderInput("Username", "username", "your_callsign", "text", "◈")}
          {renderInput("Email", "email", "your@email.com", "email", "◉")}
          {renderInput("Password", "password", "••••••••", "password", "◆")}
          {form.password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength ? strengthColor : "#1E1E22",
                    transition: "background 0.2s"
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: strengthColor, fontFamily: "'JetBrains Mono'" }}>
                {strengthLabel}
              </div>
            </div>
          )}
          {renderInput("Confirm Password", "confirm", "••••••••", "password", "◆")}
 
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
 
            {/* Terms note */}
            <div style={{ marginBottom: 20, fontSize: 11, color: "#3A3A42", lineHeight: 1.6 }}>
              By registering you agree to not blame teammates, accept that stats don't lie, and acknowledge your K/D is public.
            </div>
 
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
                <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◈</span> CREATING ACCOUNT...</>
              ) : "LOCK IN →"}
            </button>
          </form>
 
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#3A3A42" }}>
            Already in?{" "}
            <Link href="/login" style={{ color: "#FF4655", textDecoration: "none", fontWeight: 600 }}>
              Login
            </Link>
          </div>
        </div>
 
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "#2A2A2E", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em" }}>
          FRIEND GROUP · PRIVATE · COMPETITIVE
        </div>
      </div>
    </div>
  );
}