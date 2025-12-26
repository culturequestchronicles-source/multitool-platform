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
        result.push(`Line ${i + 1} differs: Expected "${leftLines[i] || ''}" but got "${rightLines[i] || ''}"`);
      }
    }
    setDiff(result.length > 0 ? result : ["No differences found!"]);
  };

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>📝 Text Diff Checker</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Compare text side-by-side and highlight line differences instantly.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <label style={label}>Original Text</label>
          <textarea
            placeholder="Paste original text here..."
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            style={box}
          />
        </div>
        <div>
          <label style={label}>Modified Text</label>
          <textarea
            placeholder="Paste changed text here..."
            value={right}
            onChange={(e) => setRight(e.target.value)}
            style={box}
          />
        </div>
      </div>

      <button onClick={compare} style={btn}>Find Differences</button>

      {diff.length > 0 && (
        <div style={resultContainer}>
          <h3 style={{ marginBottom: 10 }}>Results:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {diff.map((d, i) => (
              <li key={i} style={{ 
                color: d.includes("No differences") ? "#16a34a" : "#dc2626",
                padding: "4px 0",
                fontSize: 14,
                fontFamily: "monospace"
              }}>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

const label = { display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 };
const box = { width: "100%", minHeight: 300, padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", fontFamily: "monospace", fontSize: 14 };
const btn = { marginTop: 20, padding: "12px 24px", background: "#2563eb", color: "white", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" };
const resultContainer = { marginTop: 30, padding: 20, background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" };