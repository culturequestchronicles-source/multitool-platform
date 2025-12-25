"use client";

import { useState } from "react";
import Papa from "papaparse";

type DiffRow = {
  type: "added" | "removed" | "changed";
  row: any;
};

export default function CsvDiffPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [diffs, setDiffs] = useState<DiffRow[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCsv = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (err) => reject(err),
      });
    });
  };

  const diffCsv = async () => {
    if (!fileA || !fileB) return;

    setLoading(true);
    setDiffs([]);

    const dataA = await parseCsv(fileA);
    const dataB = await parseCsv(fileB);

    const mapA = new Map(dataA.map((row) => [JSON.stringify(row), row]));
    const mapB = new Map(dataB.map((row) => [JSON.stringify(row), row]));

    const results: DiffRow[] = [];

    for (const [key, row] of mapA) {
      if (!mapB.has(key)) {
        results.push({ type: "removed", row });
      }
    }

    for (const [key, row] of mapB) {
      if (!mapA.has(key)) {
        results.push({ type: "added", row });
      }
    }

    setDiffs(results);
    setLoading(false);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        CSV Diff Checker
      </h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Compare two CSV files and find added or removed rows
      </p>

      <div style={{ display: "flex", gap: 20 }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFileA(e.target.files?.[0] || null)}
        />
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFileB(e.target.files?.[0] || null)}
        />
      </div>

      <button
        onClick={diffCsv}
        disabled={!fileA || !fileB || loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#000",
          color: "#fff",
          borderRadius: 6,
        }}
      >
        {loading ? "Comparing..." : "Compare CSVs"}
      </button>

      <div style={{ marginTop: 40 }}>
        {diffs.length === 0 && !loading && (
          <p style={{ color: "#777" }}>No differences found.</p>
        )}

        {diffs.map((diff, idx) => (
          <pre
            key={idx}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 6,
              background:
                diff.type === "added"
                  ? "#e6fffa"
                  : "#ffe6e6",
              border:
                diff.type === "added"
                  ? "1px solid #38b2ac"
                  : "1px solid #e53e3e",
            }}
          >
            {diff.type.toUpperCase()}
            {"\n"}
            {JSON.stringify(diff.row, null, 2)}
          </pre>
        ))}
      </div>
    </main>
  );
}
