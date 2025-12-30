import React from "react";

export default function ToolSection({
  title,
  subtitle,
  kicker,
  accent = "slate",
  children,
}: {
  title: string;
  subtitle: string;
  kicker?: string;
  accent?: "slate" | "indigo" | "blue" | "emerald";
  children: React.ReactNode;
}) {
  const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    slate: { bg: "#f8fafc", border: "#e2e8f0", text: "#0f172a" },
    indigo: { bg: "#eef2ff", border: "#c7d2fe", text: "#312e81" },
    blue: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a" },
    emerald: { bg: "#ecfdf5", border: "#a7f3d0", text: "#064e3b" },
  };

  const a = accentMap[accent] ?? accentMap.slate;

  return (
    <div style={{ marginTop: 52 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18 }}>
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 30, fontWeight: 950, margin: 0 }}>{title}</h2>
            {kicker ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: a.bg,
                  border: `1px solid ${a.border}`,
                  color: a.text,
                  letterSpacing: 0.2,
                }}
              >
                {kicker}
              </span>
            ) : null}
          </div>
          <p style={{ color: "#6b7280", marginTop: 8 }}>{subtitle}</p>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>{children}</div>
    </div>
  );
}
