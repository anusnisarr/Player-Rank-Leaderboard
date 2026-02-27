"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlayer } from "@/lib/api";
import { COUNTRIES } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AddPlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    team: "",
    country: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Player name is required");
    try {
      setLoading(true);
      await createPlayer(form);
      toast.success(`Player "${form.name}" created!`);
      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create player");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
      <div className="animate-slide stagger-1" style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 52,
            letterSpacing: "0.04em",
            color: "#E8E8F0",
            lineHeight: 1,
          }}
        >
          ADD PLAYER
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: 14, marginTop: 6 }}>
          Register a new player to the ranking system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-slide stagger-2">
        <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Player Name *
            </label>
            <input
              className="input"
              placeholder="e.g. s1mple"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Team
            </label>
            <input
              className="input"
              placeholder="e.g. NAVI, Team Vitality"
              value={form.team}
              onChange={(e) => set("team", e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Country
            </label>
            <select
              className="input"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Info box */}
          <div
            style={{
              background: "rgba(255,70,85,0.06)",
              border: "1px solid rgba(255,70,85,0.2)",
              borderRadius: 8,
              padding: "14px 16px",
              fontSize: 13,
              color: "#A8A8BC",
              lineHeight: 1.6,
            }}
          >
            <div style={{ color: "#FF4655", fontWeight: 600, marginBottom: 4, fontSize: 12, fontFamily: "'JetBrains Mono'", letterSpacing: "0.06em" }}>
              NOTE
            </div>
            Stats and ranking are computed automatically when you add match results. This form only registers the player's profile.
          </div>

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Creating..." : "Create Player"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
