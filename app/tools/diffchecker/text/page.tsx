"use client";

import { useState } from "react";

export default function TextDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<string[]>([]);

  const compare = () => {
    const leftLines = left.split("\n");
    const rightLines = right.split("\n");

    const max = Math.max(leftLines.length, rightLines.length);
    const result: string[] = [];

    for (let i = 0; i < max; i++) {
      if (leftLines[i] !== rightLines[i]) {
        result.push(`Line ${i + 1} differs`);
      }
    }

    setDiff(result);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        📝 Text Diff Checker
      </h1>

      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Compare text side-by-side and highlight differences
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <textarea
          placeholder="Original text"
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          style={box}
        />
        <textarea
          placeholder="Changed text"
          value={right}
          onChange={(e) => setRight(e.target.value)}
          style={box}
        />
      </div>

      <button
        onClick={compare}
        style={{
          marginTop: 20,
          padding: "12px 24px",
          background: "#16a34a",
          color: "white",
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        Find Difference
      </button>

      {diff.length > 0 && (
        <ul style={{ marginTop: 20 }}>
          {diff.map((d, i) => (
            <li key={i} style={{ color: "#dc2626" }}>
              {d}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const box = {
  minHeight: 300,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontFamily: "monospace",
};
