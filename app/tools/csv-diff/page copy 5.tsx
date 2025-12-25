"use client";

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type Row = Record<string, any>;

export default function CsvDiffPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [rowsA, setRowsA] = useState<Row[]>([]);
  const [rowsB, setRowsB] = useState<Row[]>([]);
  const [keyColumn, setKeyColumn] = useState("");
  const [ignoredCols, setIgnoredCols] = useState<string[]>([]);
  const [diff, setDiff] = useState<any[]>([]);

  const parseCSV = (file: File, setter: Function) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setter(res.data as Row[]),
    });
  };

  const allColumns = rowsA[0]
    ? Object.keys(rowsA[0])
    : [];

  const generateDiff = () => {
    if (!keyColumn) {
      alert("Select a key column");
      return;
    }

    const mapA = new Map(rowsA.map((r) => [r[keyColumn], r]));
    const mapB = new Map(rowsB.map((r) => [r[keyColumn], r]));

    const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);
    const results: any[] = [];

    allKeys.forEach((key) => {
      const a = mapA.get(key);
      const b = mapB.get(key);

      if (!a) {
        results.push({ __status: "ADDED", ...b });
      } else if (!b) {
        results.push({ __status: "REMOVED", ...a });
      } else {
        let changed = false;
        const row: any = { __status: "UNCHANGED" };

        Object.keys(a).forEach((col) => {
          if (ignoredCols.includes(col)) return;

          if (a[col] !== b[col]) {
            changed = true;
            row[col] = `${a[col]} → ${b[col]}`;
          } else {
            row[col] = a[col];
          }
        });

        row.__status = changed ? "CHANGED" : "UNCHANGED";
        results.push(row);
      }
    });

    setDiff(results);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(diff);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csv-diff.csv";
    a.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(diff);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diff");
    XLSX.writeFile(wb, "csv-diff.xlsx");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        CSV Diff Tool
      </h1>

      <p style={{ marginBottom: 20, color: "#555" }}>
        Compare two CSV files with row & column intelligence
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFileA(f);
            parseCSV(f, setRowsA);
          }
        }}
      />

      <input
        type="file"
        accept=".csv"
        style={{ marginLeft: 10 }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFileB(f);
            parseCSV(f, setRowsB);
          }
        }}
      />

      {allColumns.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <label>
              Row Key Column:
              <select
                value={keyColumn}
                onChange={(e) => setKeyColumn(e.target.value)}
                style={{ marginLeft: 10 }}
              >
                <option value="">Select</option>
                {allColumns.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Ignore Columns:</strong>
            {allColumns.map((c) => (
              <label key={c} style={{ marginLeft: 10 }}>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setIgnoredCols((prev) =>
                      e.target.checked
                        ? [...prev, c]
                        : prev.filter((x) => x !== c)
                    )
                  }
                />
                {c}
              </label>
            ))}
          </div>
        </>
      )}

      <button
        onClick={generateDiff}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#000",
          color: "#fff",
          borderRadius: 6,
        }}
      >
        Compare CSVs
      </button>

      {diff.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <strong>Legend:</strong>
            <div>🟢 ADDED</div>
            <div>🔴 REMOVED</div>
            <div>🟡 CHANGED</div>
          </div>

          <table
            border={1}
            cellPadding={6}
            style={{ marginTop: 20, borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                {Object.keys(diff[0]).map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diff.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background:
                      row.__status === "ADDED"
                        ? "#e6fffa"
                        : row.__status === "REMOVED"
                        ? "#ffe6e6"
                        : row.__status === "CHANGED"
                        ? "#fffbe6"
                        : "#fff",
                  }}
                >
                  {Object.values(row).map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20 }}>
            <button onClick={exportCSV}>Export CSV</button>
            <button
              onClick={exportExcel}
              style={{ marginLeft: 10 }}
            >
              Export Excel
            </button>
          </div>
        </>
      )}
    </main>
  );
}
