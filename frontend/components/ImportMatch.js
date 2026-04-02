"use client";
import { useState, useRef } from "react";

// ── CSV Parser ────────────────────────────────────────────────────────────────
// Expected CSV format:
// name,kills,deaths,assists,hsp,damage,won
// PlayerA,18,10,3,44,2100,true
function parseCSV(text) {
  const lines  = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one player row");

  const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
  const required = ["name", "kills", "deaths", "assists", "hsp", "damage"];
  const missing  = required.filter(r => !headers.includes(r));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);

  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const row  = {};
    headers.forEach((h, i) => row[h] = vals[i] || "");
    return {
      name:    row.name,
      kills:   Number(row.kills)   || 0,
      deaths:  Number(row.deaths)  || 0,
      assists: Number(row.assists) || 0,
      hsp:     Number(row.hsp)     || 0,
      damage:  Number(row.damage)  || 0,
      won:     row.won?.toLowerCase() === "true",
    };
  });
}

// ── Screenshot Parser (Claude Vision) ────────────────────────────────────────
// async function parseScreenshot(base64, mediaType) {
//   const response = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       messages: [{
//         role: "user",
//         content: [
//           {
//             type: "image",
//             source: { type: "base64", media_type: mediaType, data: base64 },
//           },
//           {
//             type: "text",
//             text: `This is a CS2 scoreboard screenshot. Extract all player stats and return ONLY a JSON array, no markdown, no explanation.

// Format:
// [
//   { "name": "PlayerName", "kills": 0, "deaths": 0, "assists": 0, "hsp": 0, "damage": 0, "won": true }
// ]

// Rules:
// - hsp = headshot percentage as a number 0-100
// - damage = total damage dealt
// - won = true if their team won, false otherwise
// - If you cannot find a value use 0
// - Return ONLY the JSON array, nothing else`,
//           },
//         ],
//       }],
//     }),
//   });

//   const data = await response.json();
//   const text = data.content?.[0]?.text || "";

//   // Strip any accidental markdown fences
//   const clean = text.replace(/```json|```/g, "").trim();
//   const parsed = JSON.parse(clean);

//   if (!Array.isArray(parsed)) throw new Error("Could not parse scoreboard — try a clearer screenshot");
//   return parsed.map(p => ({
//     name:    p.name    || "Unknown",
//     kills:   Number(p.kills)   || 0,
//     deaths:  Number(p.deaths)  || 0,
//     assists: Number(p.assists) || 0,
//     hsp:     Number(p.hsp)     || 0,
//     damage:  Number(p.damage)  || 0,
//     won:     !!p.won,
//   }));
// }

// ── Main Component ────────────────────────────────────────────────────────────
// Props:
//   onImport(players) — called with array of parsed player stat objects
//   existingPlayers   — your DB players list for name matching
export default function ImportMatch({ onImport, existingPlayers = [] }) {
  const [mode, setMode]         = useState(null); // "csv" | "screenshot"
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [preview, setPreview]   = useState(null); // parsed rows before confirm
  const [error, setError]       = useState("");
  const [imgSrc, setImgSrc]     = useState(null); // screenshot preview
  const fileRef = useRef();

  const reset = () => { setMode(null); setPreview(null); setError(""); setImgSrc(null); };

  // Match parsed name to DB player (fuzzy — case insensitive, partial match)
  const matchPlayer = (name) => {
    const n = name.toLowerCase();
    return existingPlayers.find(p =>
      p.name.toLowerCase() === n ||
      p.name.toLowerCase().includes(n) ||
      n.includes(p.name.toLowerCase())
    ) || null;
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setPreview(null);
    setLoading(true);

    try {
      if (mode === "csv") {
        const text = await file.text();
        const rows = parseCSV(text);
        setPreview(rows.map(r => ({ ...r, matched: matchPlayer(r.name) })));
      }
      //  else {
      //   // Screenshot — read as base64
      //   const base64 = await new Promise((res, rej) => {
      //     const reader = new FileReader();
      //     reader.onload  = () => res(reader.result.split(",")[1]);
      //     reader.onerror = rej;
      //     reader.readAsDataURL(file);
      //   });
      //   const mediaType = file.type || "image/png";
      //   setImgSrc(`data:${mediaType};base64,${base64}`);
      //   const rows = await parseScreenshot(base64, mediaType);
      //   setPreview(rows.map(r => ({ ...r, matched: matchPlayer(r.name) })));
      // }
    } catch (err) {
      setError(err.message || "Failed to parse file");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const confirmImport = () => {
    if (!preview) return;
    onImport(preview);
    reset();
  };

  const L = { fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.06em" };

  return (
    <div style={{ marginBottom: 16 }}>

      {/* ── Mode selector ── */}
      {!mode && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed #3A3A42", borderRadius: 8, padding: "16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#7A7A8C", flex: 1 }}>Import match stats from a file:</div>
          <button onClick={() => setMode("csv")}
            style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono'", cursor: "pointer", background: "rgba(78,205,196,0.08)", color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.25)" }}>
            📄 Import CSV
          </button>
          {/* <button onClick={() => setMode("screenshot")}
            style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono'", cursor: "pointer", background: "rgba(255,215,0,0.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)" }}>
            🖼️ Import Screenshot
          </button> */}
        </div>
      )}

      {/* ── File drop zone ── */}
      {mode && !preview && (
        <div style={{ border: "1px solid #1E1E22", borderRadius: 8, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", background: "#0A0A0B", borderBottom: "1px solid #1E1E22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: mode === "csv" ? "#4ECDC4" : "#FFD700", fontFamily: "'JetBrains Mono'" }}>
              {mode === "csv" ? "📄 CSV Import" : "🖼️ Screenshot Import"}
            </div>
            <button onClick={reset} style={{ fontSize: 11, color: "#7A7A8C", background: "none", border: "none", cursor: "pointer" }}>✕ Cancel</button>
          </div>

          {/* Drop area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              padding: "40px 20px", textAlign: "center", cursor: "pointer",
              background: dragging ? "rgba(255,255,255,0.04)" : "transparent",
              transition: "background 0.15s",
            }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>
              {loading ? "⚙️" : mode === "csv" ? "📄" : "🖼️"}
            </div>
            {loading ? (
              <div style={{ fontSize: 13, color: "#7A7A8C" }}>
                {mode === "screenshot" ? "Analyzing scoreboard with AI..." : "Parsing CSV..."}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#E8E8F0", marginBottom: 6 }}>
                  Drop your {mode === "csv" ? "CSV file" : "screenshot"} here
                </div>
                <div style={{ fontSize: 11, color: "#7A7A8C" }}>or click to browse</div>
                {mode === "csv" && (
                  <div style={{ marginTop: 14, fontSize: 11, color: "#3A3A42", fontFamily: "'JetBrains Mono'", lineHeight: 1.8 }}>
                    Required columns: name, kills, deaths, assists, hsp, damage<br />
                    Optional: won (true/false)
                  </div>
                )}
                {/* {mode === "screenshot" && (
                  <div style={{ marginTop: 14, fontSize: 11, color: "#3A3A42", lineHeight: 1.7 }}>
                    Upload a CS2 end-of-match scoreboard screenshot.<br />
                    AI will extract all player stats automatically.
                  </div>
                )} */}
              </>
            )}
            {error && (
              <div style={{ marginTop: 14, fontSize: 12, color: "#FF4655", background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", borderRadius: 6, padding: "8px 12px" }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* CSV template download */}
          {mode === "csv" && !loading && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid #1E1E22", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const csv = "name,kills,deaths,assists,hsp,damage,won\nPlayerA,18,10,3,44,2100,true\nPlayerB,12,14,5,30,1800,true";
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement("a");
                  a.href = url; a.download = "match-template.csv"; a.click();
                }}
                style={{ fontSize: 11, color: "#7A7A8C", background: "none", border: "1px solid #3A3A42", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontFamily: "'JetBrains Mono'" }}>
                ⬇ Download CSV Template
              </button>
            </div>
          )}

          <input ref={fileRef} type="file"
            accept={mode === "csv" ? ".csv,text/csv" : "image/*"}
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* ── Preview & confirm ── */}
      {preview && (
        <div style={{ border: "1px solid #1E1E22", borderRadius: 8, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", background: "#0A0A0B", borderBottom: "1px solid #1E1E22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#4ECDC4", fontFamily: "'JetBrains Mono'" }}>
              ✅ {preview.length} players parsed — review before importing
            </div>
            <button onClick={reset} style={{ fontSize: 11, color: "#7A7A8C", background: "none", border: "none", cursor: "pointer" }}>✕ Cancel</button>
          </div>

          {/* Screenshot preview */}
          {/* {imgSrc && (
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1E1E22" }}>
              <img src={imgSrc} alt="scoreboard" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 5, objectPosition: "top" }} />
            </div>
          )} */}

          {/* Parsed rows */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Player Name", "Matched To", "K", "D", "A", "HS%", "DMG", "Won"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", color: "#7A7A8C", fontFamily: "'JetBrains Mono'", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #1E1E22", whiteSpace: "nowrap", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", color: "#E8E8F0", fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      {row.matched ? (
                        <span style={{ color: "#4ECDC4", fontSize: 11 }}>✓ {row.matched.name}</span>
                      ) : (
                        <span style={{ color: "#FF4655", fontSize: 11 }}>✗ No match</span>
                      )}
                    </td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#4ECDC4" }}>{row.kills}</td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#FF4655" }}>{row.deaths}</td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{row.assists}</td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'", color: "#FFD700" }}>{row.hsp}%</td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)", fontFamily: "'JetBrains Mono'" }}>{row.damage}</td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(30,30,34,0.6)" }}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, fontFamily: "'JetBrains Mono'", background: row.won ? "rgba(78,205,196,0.1)" : "rgba(255,70,85,0.1)", color: row.won ? "#4ECDC4" : "#FF4655", border: `1px solid ${row.won ? "rgba(78,205,196,0.25)" : "rgba(255,70,85,0.25)"}` }}>
                        {row.won ? "W" : "L"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Warnings */}
          {preview.some(r => !r.matched) && (
            <div style={{ padding: "10px 16px", background: "rgba(255,70,85,0.05)", borderTop: "1px solid rgba(255,70,85,0.15)", fontSize: 12, color: "#FF4655" }}>
              ⚠️ Some players couldn't be matched to your DB. They'll be skipped on import. Make sure their names match exactly.
            </div>
          )}

          {/* Actions */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1E1E22", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={reset}
              style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, color: "#7A7A8C", background: "transparent", border: "1px solid #3A3A42", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={confirmImport}
              disabled={preview.every(r => !r.matched)}
              style={{ padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#000", background: "#4ECDC4", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono'" }}>
              ✓ Import {preview.filter(r => r.matched).length} Players
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
