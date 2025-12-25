"use client";

import { useState } from "react";
import Papa from "papaparse";

type Row = Record<string, string>;

export default function CsvDiffPage() {
  const [fileA, setFileA] = useState<Row[]>([]);
  const [fileB, setFileB] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  function parseCSV(file: File, setter: (rows: Row[]) => void) {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setter(result.data);
        if (result.meta.fields) {
          setHeaders(result.meta.fields);
        }
      },
    });
  }

  function isRowDifferent(rowA: Row, rowB: Row) {
    return headers.some((h) => rowA[h] !== rowB[h]);
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">CSV Diff Checker</h1>

      {/* Upload */}
      <div className="flex gap-6 mb-8">
        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            e.target.files && parseCSV(e.target.files[0], setFileA)
          }
        />
        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            e.target.files && parseCSV(e.target.files[0], setFileB)
          }
        />
      </div>

      {/* Table */}
      {fileA.length > 0 && fileB.length > 0 && (
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="border p-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {fileA.map((rowA, index) => {
                const rowB = fileB[index];
                if (!rowB) return null;

                const rowChanged = isRowDifferent(rowA, rowB);

                return (
                  <tr
                    key={index}
                    className={rowChanged ? "bg-red-50" : ""}
                  >
                    {headers.map((h) => {
                      const changed = rowA[h] !== rowB[h];

                      return (
                        <td
                          key={h}
                          className={`border p-2 ${
                            changed ? "bg-yellow-200 font-semibold" : ""
                          }`}
                        >
                          {rowA[h]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
