"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Leaderboard" },
  { href: "/add-match", label: "Add Match" },
  { href: "/add-player", label: "Add Player" },
  { href: "/matches", label: "Match History" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      style={{
        borderBottom: "1px solid #1E1E22",
        background: "rgba(10,10,11,0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#FF4655",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M8 5L11 7V10L8 12L5 10V7L8 5Z" fill="white" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 22,
              letterSpacing: "0.06em",
              color: "#E8E8F0",
            }}
          >
            CS2 RANK
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#E8E8F0" : "#7A7A8C",
                  background: active ? "#1E1E22" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  border: active ? "1px solid #3A3A42" : "1px solid transparent",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
