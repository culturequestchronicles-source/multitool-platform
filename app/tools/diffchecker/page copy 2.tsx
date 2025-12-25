"use client";

import { useState } from "react";
import { diffLines } from "diff";

type DiffLine = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

export default function DiffCheckerPage() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diff, setDiff] = useState<DiffLine[]>([]);

  const runDiff = () => {
    const result = diffLines(leftText, rightText);
    setDiff(result as DiffLine[]);
  };

  return (
    <main style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
      {/* HEADER */}
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>
        Text Diff Checker
      </h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Compare text and highlight differences instantly
      </p>

      {/* INPUT AREA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 30,
        }}
      >
        <textarea
          placeholder="Original text"
          value={leftText}
          onChange={(e) => setLeftText(e.target.value)}
          style={textareaStyle}
        />

        <textarea
          placeholder="Modified text"
          value={rightText}
          onChange={(e) => setRightText(e.target.value)}
          style={textareaStyle}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={runDiff}
        style={{
          marginTop: 20,
          background: "#2563eb",
          color: "white",
          padding: "12px 24px",
          borderRadius: 10,
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Compare Text
      </button>

      {/* LEGEND */}
      <div style={{ marginTop: 20, fontSize: 14 }}>
        <span style={{ background: "#dcfce7", padding: "4px 8px", marginRight: 8 }}>
          Added
        </span>
        <span style={{ background: "#fee2e2", padding: "4px 8px", marginRight: 8 }}>
          Removed
        </span>
        <span style={{ background: "#fef3c7", padding: "4px 8px" }}>
          Changed
        </span>
      </div>

      {/* DIFF OUTPUT */}
      <div
        style={{
          marginTop: 30,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "white",
          overflow: "hidden",
        }}
      >
        {diff.length === 0 && (
          <p style={{ padding: 20, color: "#6b7280" }}>
            Differences will appear here
          </p>
        )}

        {diff.map((part, index) => (
          <pre
            key={index}
            style={{
              margin: 0,
              padding: "8px 16px",
              background: part.added
                ? "#dcfce7"
                : part.removed
                ? "#fee2e2"
                : "#ffffff",
              color: "#111827",
              borderBottom: "1px solid #f1f5f9",
              whiteSpace: "pre-wrap",
            }}
          >
            {part.value}
          </pre>
        ))}
      </div>
    </main>
  );
}

const textareaStyle = {
  width: "100%",
  height: 220,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontFamily: "monospace",
  fontSize: 14,
  resize: "vertical",
};
