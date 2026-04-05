"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Leaderboard", icon: "🏆" },
  { href:"/teams", label: "Teams" },
  { href: "/add-match", label: "Add Match", icon: "➕" },
  { href: "/add-player", label: "Add Player", icon: "👤" },
  { href: "/matches", label: "Match History", icon: "📋" },
  { href: "/score-system", label: "Score System"},
];

export default function Navbar() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{ borderBottom: "1px solid #1E1E22", background: "rgba(10,10,11,0.97)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }} onClick={() => setMenuOpen(false)}>
            <div style={{ width: 28, height: 28, background: "#FF4655", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none" />
                <path d="M8 5L11 7V10L8 12L5 10V7L8 5Z" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.06em", color: "#E8E8F0" }}>RANKIFY</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 4 }} className="desktop-nav">
            {links.map((l) => {
              const active = path === l.href;
              return (
                <Link key={l.href} href={l.href} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#E8E8F0" : "#7A7A8C", background: active ? "#1E1E22" : "transparent", textDecoration: "none", transition: "all 0.15s ease", border: active ? "1px solid #3A3A42" : "1px solid transparent", whiteSpace: "nowrap" }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen((o) => !o)} className="hamburger-btn" aria-label="Toggle menu"
            style={{ background: "transparent", border: "1px solid #1E1E22", borderRadius: 6, color: "#E8E8F0", cursor: "pointer", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", width: 36, height: 36 }}>
            <span style={{ display: "block", width: 16, height: 1.5, background: "#E8E8F0", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
            <span style={{ display: "block", width: 16, height: 1.5, background: "#E8E8F0", borderRadius: 2, transition: "all 0.2s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 16, height: 1.5, background: "#E8E8F0", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{ position: "fixed", top: 56, left: 0, right: 0, bottom: 0, background: "rgba(10,10,11,0.98)", zIndex: 199, padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ padding: "14px 18px", borderRadius: 8, fontSize: 16, fontWeight: active ? 600 : 400, color: active ? "#E8E8F0" : "#7A7A8C", background: active ? "#1E1E22" : "transparent", textDecoration: "none", border: active ? "1px solid #3A3A42" : "1px solid #1E1E22", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                {l.label}
                {active && <span style={{ marginLeft: "auto", color: "#FF4655" }}>●</span>}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .hamburger-btn { display: none !important; }
        .desktop-nav { display: flex !important; }
        @media (max-width: 640px) {
          .hamburger-btn { display: flex !important; }
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
