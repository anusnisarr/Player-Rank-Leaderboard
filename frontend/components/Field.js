// components/Field.js
"use client";
import React from "react";

const Field = React.memo(({ label, icon, type = "text", field, form, setForm, placeholder, extra }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 10, color: "#7A7A8C", fontFamily: "'JetBrains Mono'", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#3A3A42" }}>{icon}</span>
      <input
        type={type}
        required
        
        value={form[field] || "" }
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "#0A0A0B",
          border: "1px solid #1E1E22",
          borderRadius: 7,
          padding: "12px 14px 12px 36px",
          color: "#E8E8F0",
          fontSize: 14,
          outline: "none",
          fontFamily: (field === "password" || field === "confirm") ? "'JetBrains Mono'" : "inherit",
          letterSpacing: (field === "password" || field === "confirm") && form[field] ? "0.15em" : "normal",
          transition: "border-color 0.2s",
        }}
      />
    </div>
    {extra}
  </div>
));

export default Field;