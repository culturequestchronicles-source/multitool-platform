"use client";

import { useState } from "react";
import Papa from "papaparse";

type CSVRow = Record<string, string>;

export default function CSVDiffPage() {
  const [fileA, setFileA] = useState<CSVRow[]>([]);
  const [fileB, setFileB] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [keyColumn, setKeyColumn] = useState("");
  const [ignoredColumns, setIgnoredColumns] = useState<string[]>([]);
  const [diff, setDiff] = useState<any[]>([]);

  function parseCSV(file: File, setData: Function) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(Object.keys(results.data[0]));
        setData(results.data as CSVRow[]);
      },
    });
  }

  function toggleIgnore(col: string) {
    setIgnoredColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  }

  function compare() {
    if (!keyColumn) {
      alert("Select a key column");
      return;
    }

    const mapA = new Map(fileA.map((r) => [r[keyColumn], r]));
    const mapB = new Map(fileB.map((r) => [r[keyColumn], r]));

    const result: any[] = [];

    for (const [id, rowA] of mapA) {
      if (!mapB.has(id)) {
        result.push({ type: "removed", id, rowA });
      } else {
        const rowB = mapB.get(id)!;
        const changes: any = {};

        headers.forEach((col) => {
          if (
            col === keyColumn ||
            ignoredColumns.includes(col)
          )
            return;

          if (rowA[col] !== rowB[col]) {
            changes[col] = {
              from: rowA[col],
              to: rowB[col],
            };
          }
        });

        if (Object.keys(changes).length > 0) {
          result.push({ type: "modified", id, changes });
        }
      }
    }

    for (const [id, rowB] of mapB) {
      if (!mapA.has(id)) {
        result.push({ type: "added", id, rowB });
      }
    }

    setDiff(result);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28 }}>CSV Diff Tool</h1>

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            e.target.files &&
            parseCSV(e.target.files[0], setFileA)
          }
        />
        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            e.target.files &&
            parseCSV(e.target.files[0], setFileB)
          }
        />
      </div>

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <label>Primary Key Column:</label>
            <select
              value={keyColumn}
              onChange={(e) =>
                setKeyColumn(e.target.value)
              }
            >
              <option value="">Select</option>
              {headers.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 20 }}>
            <strong>Ignore Columns:</strong>
            {headers.map((h) => (
              <label key={h} style={{ marginLeft: 10 }}>
                <input
                  type="checkbox"
                  checked={ignoredColumns.includes(h)}
                  onChange={() => toggleIgnore(h)}
                />
                {h}
              </label>
            ))}
          </div>

          <button
            onClick={compare}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              background: "#000",
              color: "#fff",
            }}
          >
            Compare CSVs
          </button>
        </>
      )}

      {diff.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Diff Results</h2>

          {diff.map((d, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                padding: 10,
                marginBottom: 10,
                background:
                  d.type === "added"
                    ? "#e6fffa"
                    : d.type === "removed"
                    ? "#ffe6e6"
                    : "#fffbe6",
              }}
            >
              <strong>{d.type.toUpperCase()}</strong> — ID:{" "}
              {d.id}

              {d.type === "modified" &&
                Object.entries(d.changes).map(
                  ([col, val]: any) => (
                    <div key={col}>
                      {col}: "{val.from}" → "{val.to}"
                    </div>
                  )
                )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
