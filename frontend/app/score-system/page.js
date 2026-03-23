"use client";
import { RANK_CONFIG, RANK_ORDER, getScoreColor } from "@/lib/utils";

export default function scoreSytem() {

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

      <div
        className="animate-slide stagger-1"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid #1E1E22",
          borderRadius: 8,
          padding: "14px 18px",
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <span style={{
            fontSize: 11,
            color: "#7A7A8C",
            fontFamily: "'JetBrains Mono'",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}>
            Score System
          </span>

          {/* <span style={{
            fontSize: 11,
            color: "#4ECDC4",
            fontFamily: "'JetBrains Mono'"
          }}>
            Avg of last 5 matches used for Rank
          </span> */}
        </div>

        {/* Formula Section */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center"
        }}>
          {[
            { label: "Kill", val: "+3", color: "#4ECDC4" },
            { label: "Assist", val: "+1.5", color: "#A8DADC" },
            { label: "Death", val: "-2", color: "#FF4655" },
            { label: "Headshots", val: "+1", color: "#FFD700" },
            { label: "ADR", val: "+0.05", color: "#FF6B35" },
            { label: "Win", val: "+10", color: "#22C55E" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              display: "flex",
              gap: 6,
              alignItems: "center"
            }}>
              <span style={{
                fontSize: 11,
                color: "#7A7A8C",
                fontFamily: "'JetBrains Mono'"
              }}>
                {label}
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color,
                fontFamily: "'JetBrains Mono'"
              }}>
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "#1E1E22",
          margin: "4px 0"
        }} />

        {/* Rank Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10
        }}>
          {RANK_ORDER.map(rank => {
            const r = RANK_CONFIG[rank];
            return (
              <div
                key={rank}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: `1px solid ${r?.border}`,
                  background: r?.bg,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <span style={{
                  fontSize: 12,
                  color: r?.color,
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono'"
                }}>
                  {r?.icon} {rank}
                </span>

                <span style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  fontFamily: "'JetBrains Mono'"
                }}>
                  {r?.scoreRange}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 4
        }}>
          <span style={{
            fontSize: 10,
            color: "#6B7280",
            fontFamily: "'JetBrains Mono'"
          }}>
            Score is unbounded (can exceed 100)
          </span>

          <span style={{
            fontSize: 10,
            color: "#6B7280",
            fontFamily: "'JetBrains Mono'"
          }}>
            Rank depends on consistency, not single match
          </span>
        </div>

      </div>

    </div>
  );
}