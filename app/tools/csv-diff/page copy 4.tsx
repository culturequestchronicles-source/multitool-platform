"use client";

import { useState } from "react";
import Papa from "papaparse";

type Row = Record<string, string>;

export default function CsvDiffPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [diffRows, setDiffRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCSV = (file: File): Promise<Row[]> =>
    new Promise((resolve, reject) => {
      Papa.parse<Row>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: reject,
      });
    });

  const compareCSV = async () => {
    if (!fileA || !fileB) return;
    setLoading(true);

    const [dataA, dataB] = await Promise.all([
      parseCSV(fileA),
      parseCSV(fileB),
    ]);

    const allHeaders = Array.from(
      new Set([...Object.keys(dataA[0] || {}), ...Object.keys(dataB[0] || {})])
    );

    setHeaders(allHeaders);

    const maxRows = Math.max(dataA.length, dataB.length);
    const diffs = [];

    for (let i = 0; i < maxRows; i++) {
      const rowA = dataA[i];
      const rowB = dataB[i];

      const rowDiff: any = {
        __status: !rowA
          ? "Added"
          : !rowB
          ? "Removed"
          : "Modified",
      };

      let changed = false;

      allHeaders.forEach((key) => {
        const a = rowA?.[key] || "";
        const b = rowB?.[key] || "";
        rowDiff[key] = b;

        if (a !== b) changed = true;
      });

      if (changed || rowDiff.__status !== "Modified") {
        diffs.push(rowDiff);
      }
    }

    setDiffRows(diffs);
    setLoading(false);
  };

  const downloadDiff = () => {
    const csv = Papa.unparse(diffRows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "csv-diff.csv";
    a.click();
  };

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>CSV Diff Tool</h1>
      <p style={{ marginBottom: 20 }}>
        Compare two CSV files and highlight differences
      </p>

      <div style={{ display: "flex", gap: 20 }}>
        <input type="file" accept=".csv" onChange={(e) => setFileA(e.target.files?.[0] || null)} />
        <input type="file" accept=".csv" onChange={(e) => setFileB(e.target.files?.[0] || null)} />
      </div>

      <button
        onClick={compareCSV}
        disabled={!fileA || !fileB || loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#000",
          color: "#fff",
          borderRadius: 6,
        }}
      >
        {loading ? "Comparing..." : "Compare"}
      </button>

      {diffRows.length > 0 && (
        <>
          <button
            onClick={downloadDiff}
            style={{
              marginLeft: 20,
              padding: "10px 20px",
              borderRadius: 6,
            }}
          >
            Download Diff CSV
          </button>

          <div style={{ overflowX: "auto", marginTop: 30 }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th>Status</th>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diffRows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background:
                        row.__status === "Added"
                          ? "#e6fffa"
                          : row.__status === "Removed"
                          ? "#ffe6e6"
                          : "#fff",
                    }}
                  >
                    <td>{row.__status}</td>
                    {headers.map((h) => (
                      <td
                        key={h}
                        style={{
                          background:
                            row.__status === "Modified"
                              ? "#fff7e6"
                              : "transparent",
                          border: "1px solid #ddd",
                          padding: 6,
                        }}
                      >
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
