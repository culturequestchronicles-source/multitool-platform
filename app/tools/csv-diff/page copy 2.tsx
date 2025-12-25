"use client";

import { useState } from "react";
import Papa from "papaparse";

type DiffRow = {
  rowIndex: number;
  type: "added" | "removed" | "modified" | "same";
  dataA?: string[];
  dataB?: string[];
};

export default function CsvDiffPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [diff, setDiff] = useState<DiffRow[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCsv = (file: File): Promise<string[][]> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        complete: (result) => resolve(result.data as string[][]),
      });
    });
  };

  const compareCsvs = async () => {
    if (!fileA || !fileB) return;

    setLoading(true);

    const dataA = await parseCsv(fileA);
    const dataB = await parseCsv(fileB);

    const maxRows = Math.max(dataA.length, dataB.length);
    const result: DiffRow[] = [];

    for (let i = 0; i < maxRows; i++) {
      const rowA = dataA[i];
      const rowB = dataB[i];

      if (!rowA && rowB) {
        result.push({ rowIndex: i, type: "added", dataB: rowB });
      } else if (rowA && !rowB) {
        result.push({ rowIndex: i, type: "removed", dataA: rowA });
      } else if (JSON.stringify(rowA) !== JSON.stringify(rowB)) {
        result.push({
          rowIndex: i,
          type: "modified",
          dataA: rowA,
          dataB: rowB,
        });
      } else {
        result.push({ rowIndex: i, type: "same", dataA: rowA });
      }
    }

    setDiff(result);
    setLoading(false);
  };

  const downloadDiffCsv = () => {
    const rows = diff.map((d) => [
      d.rowIndex,
      d.type,
      ...(d.dataA || []),
      ...(d.dataB || []),
    ]);

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csv-diff.csv";
    a.click();
  };

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>CSV Diff Checker</h1>
      <p>Compare two CSV files row by row</p>

      <div style={{ marginTop: 20 }}>
        <input type="file" accept=".csv" onChange={(e) => setFileA(e.target.files?.[0] || null)} />
        <input type="file" accept=".csv" onChange={(e) => setFileB(e.target.files?.[0] || null)} />
      </div>

      <button
        onClick={compareCsvs}
        disabled={loading}
        style={{ marginTop: 20, padding: "10px 16px" }}
      >
        {loading ? "Comparing..." : "Compare CSVs"}
      </button>

      {diff.length > 0 && (
        <>
          <table
            border={1}
            cellPadding={6}
            style={{ marginTop: 30, borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Row</th>
                <th>Status</th>
                <th>File A</th>
                <th>File B</th>
              </tr>
            </thead>
            <tbody>
              {diff.map((row) => (
                <tr
                  key={row.rowIndex}
                  style={{
                    background:
                      row.type === "added"
                        ? "#e6fffa"
                        : row.type === "removed"
                        ? "#ffe6e6"
                        : row.type === "modified"
                        ? "#fff5cc"
                        : "white",
                  }}
                >
                  <td>{row.rowIndex}</td>
                  <td>{row.type}</td>
                  <td>{row.dataA?.join(", ")}</td>
                  <td>{row.dataB?.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={downloadDiffCsv}
            style={{ marginTop: 20, padding: "8px 14px" }}
          >
            Download Diff CSV
          </button>
        </>
      )}
    </main>
  );
}
