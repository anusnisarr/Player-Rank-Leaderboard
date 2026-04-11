"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePlayground } from "@/context/PlaygroundContext";
import api from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { playgrounds, active, switchPlayground } = usePlayground();

  const [menuOpen, setMenuOpen]   = useState(false);
  const [pgOpen, setPgOpen]       = useState(false);
  const pgRef = useRef(null);

  // Close playground dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pgRef.current && !pgRef.current.contains(e.target)) setPgOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    document.cookie = "accessToken=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/",             label: "Leaderboard" },
    { href: "/matches",      label: "Matches"     },
    { href: "/add-match",    label: "Add Match"   },
    { href: "/add-player",   label: "Add Player"  },
    { href: "/teams",        label: "Teams"       },
    { href: "/achievements", label: "Achievements"},
    { href: "/notify",       label: "Notify"      },
    { href: "/playgrounds",  label: "Playgrounds" },
    { href: "/score-system", label: "Score System"},

  ];

  const isAuth = pathname === "/login" || pathname === "/register";
  if (isAuth) return null;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(8,8,9,0.95)", borderBottom: "1px solid #1E1E22",
      backdropFilter: "blur(12px)", height: 56,
      display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
    }}>

      {/* ── Logo ── */}
      <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.08em", color: "#FF4655" }}>
          RANKIFY
        </span>
      </Link>

      {/* ── Playground Switcher ── */}
      <div ref={pgRef} style={{ position: "relative", marginLeft: 8, flexShrink: 0 }}>
        <button onClick={() => setPgOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 6, cursor: "pointer",
            background: pgOpen ? "#1E1E22" : "transparent",
            border: "1px solid #1E1E22",
            color: active ? "#4ECDC4" : "#7A7A8C",
            fontSize: 12, fontFamily: "'JetBrains Mono'",
            transition: "all 0.15s", whiteSpace: "nowrap",
            maxWidth: 160,
          }}>
          <span style={{ fontSize: 14 }}>🏟️</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {active ? active.name : "Global"}
          </span>
          <span style={{ color: "#3A3A42", fontSize: 10 }}>▾</span>
        </button>

        {/* Dropdown */}
        {pgOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "#111113", border: "1px solid #1E1E22",
            borderRadius: 8, minWidth: 200, zIndex: 200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}>
            {/* Global option */}
            <div onClick={() => { switchPlayground(null); setPgOpen(false); router.refresh(); }}
              style={{
                padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                background: !active ? "rgba(255,70,85,0.08)" : "transparent",
                borderBottom: "1px solid #1E1E22",
              }}>
              <span style={{ fontSize: 14 }}>🌐</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: !active ? "#FF4655" : "#E8E8F0" }}>Global</div>
                <div style={{ fontSize: 10, color: "#7A7A8C" }}>All matches combined</div>
              </div>
              {!active && <span style={{ marginLeft: "auto", fontSize: 10, color: "#FF4655" }}>✓</span>}
            </div>

            {/* Playground list */}
            {playgrounds.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 11, color: "#3A3A42", textAlign: "center" }}>
                No playgrounds yet
              </div>
            ) : playgrounds.map(pg => (
              <div key={pg._id}
                onClick={() => { switchPlayground(pg); setPgOpen(false); router.refresh(); }}
                style={{
                  padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  background: active?._id === pg._id ? "rgba(78,205,196,0.08)" : "transparent",
                  borderBottom: "1px solid rgba(30,30,34,0.5)",
                  transition: "background 0.1s",
                }}>
                <span style={{ fontSize: 14 }}>🏟️</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: active?._id === pg._id ? "#4ECDC4" : "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.name}</div>
                  <div style={{ fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.04em" }}>{pg.code}</div>
                </div>
                {active?._id === pg._id && <span style={{ fontSize: 10, color: "#4ECDC4", flexShrink: 0 }}>✓</span>}
              </div>
            ))}

            {/* Manage link */}
            <div style={{ borderTop: "1px solid #1E1E22" }}>
              <Link href="/playgrounds" onClick={() => setPgOpen(false)}
                style={{ textDecoration: "none", display: "block", padding: "10px 14px", fontSize: 11, color: "#7A7A8C", textAlign: "center" }}>
                Manage Playgrounds →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop nav links ── */}
      <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, overflowX: "auto" }}>
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "5px 10px", borderRadius: 5, fontSize: 12,
              color: pathname === href ? "#E8E8F0" : "#7A7A8C",
              background: pathname === href ? "#1E1E22" : "transparent",
              fontWeight: pathname === href ? 600 : 400,
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
              {label}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Logout ── */}
      <button onClick={handleLogout}
        className="desktop-nav"
        style={{ padding: "5px 12px", borderRadius: 5, fontSize: 12, color: "#7A7A8C", background: "transparent", border: "1px solid #1E1E22", cursor: "pointer", flexShrink: 0 }}>
        Logout
      </button>

      {/* ── Mobile hamburger ── */}
      <button onClick={() => setMenuOpen(o => !o)}
        className="mobile-nav"
        style={{ marginLeft: "auto", background: "none", border: "none", color: "#E8E8F0", cursor: "pointer", padding: 4, flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {menuOpen
            ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            : <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </button>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="mobile-nav" style={{
          position: "fixed", top: 56, left: 0, right: 0, bottom: 0,
          background: "rgba(8,8,9,0.98)", zIndex: 99,
          display: "flex", flexDirection: "column", padding: "16px",
          overflowY: "auto",
        }}>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "14px 16px", borderRadius: 8, fontSize: 15, fontWeight: 500,
                color: pathname === href ? "#FF4655" : "#E8E8F0",
                background: pathname === href ? "rgba(255,70,85,0.08)" : "transparent",
                marginBottom: 4, borderLeft: pathname === href ? "2px solid #FF4655" : "2px solid transparent",
              }}>
                {label}
              </div>
            </Link>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #1E1E22" }}>
            <button onClick={handleLogout}
              style={{ width: "100%", padding: "12px", borderRadius: 7, fontSize: 13, color: "#FF4655", background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav  { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav  { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
