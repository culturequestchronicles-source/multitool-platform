"use client";

import { useState } from "react";
import Papa from "papaparse";

type Row = Record<string, string>;

export default function CSVDiffPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [keyColumn, setKeyColumn] = useState("");
  const [diff, setDiff] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const parseCSV = (file: File): Promise<Row[]> =>
    new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data as Row[]),
        error: reject,
      });
    });

  const runDiff = async () => {
    if (!fileA || !fileB || !keyColumn) {
      alert("Please upload both files and specify key column");
      return;
    }

    const dataA = await parseCSV(fileA);
    const dataB = await parseCSV(fileB);

    const mapA = new Map(dataA.map((r) => [r[keyColumn], r]));
    const mapB = new Map(dataB.map((r) => [r[keyColumn], r]));

    const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);
    const allHeaders = new Set<string>();

    [...dataA, ...dataB].forEach((row) =>
      Object.keys(row).forEach((h) => allHeaders.add(h))
    );

    setHeaders([...allHeaders]);

    const result = [];

    for (const key of allKeys) {
      const a = mapA.get(key);
      const b = mapB.get(key);

      if (!a) {
        result.push({ type: "added", key, row: b });
      } else if (!b) {
        result.push({ type: "removed", key, row: a });
      } else {
        const changes: Record<string, boolean> = {};
        let changed = false;

        for (const h of allHeaders) {
          if ((a[h] || "") !== (b[h] || "")) {
            changes[h] = true;
            changed = true;
          }
        }

        if (changed) {
          result.push({ type: "modified", key, a, b, changes });
        }
      }
    }

    setDiff(result);
  };

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">CSV Diff (ID-Based)</h1>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="file" accept=".csv" onChange={(e) => setFileA(e.target.files?.[0] || null)} />
        <input type="file" accept=".csv" onChange={(e) => setFileB(e.target.files?.[0] || null)} />
        <input
          placeholder="Primary key column (e.g. id)"
          className="border p-2"
          value={keyColumn}
          onChange={(e) => setKeyColumn(e.target.value)}
        />
      </div>

      <button
        onClick={runDiff}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Compare CSVs
      </button>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <span className="bg-green-200 px-2 py-1 rounded">Added</span>
        <span className="bg-red-200 px-2 py-1 rounded">Removed</span>
        <span className="bg-yellow-200 px-2 py-1 rounded">Modified</span>
      </div>

      {/* Diff Table */}
      <div className="overflow-auto">
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2">Status</th>
              {headers.map((h) => (
                <th key={h} className="border p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diff.map((row, i) => (
              <tr key={i}>
                <td
                  className={`border p-2 font-bold ${
                    row.type === "added"
                      ? "bg-green-200"
                      : row.type === "removed"
                      ? "bg-red-200"
                      : "bg-yellow-200"
                  }`}
                >
                  {row.type}
                </td>

                {headers.map((h) => {
                  const value =
                    row.type === "modified"
                      ? row.b[h]
                      : row.row?.[h] || "";

                  const changed = row.changes?.[h];

                  return (
                    <td
                      key={h}
                      className={`border p-2 ${
                        changed ? "bg-yellow-100 font-semibold" : ""
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
