"use client";

import { useState } from "react";

export default function JsonToCsvPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function jsonToCsv(json: any[]) {
    if (!json.length) return "";

    const headers = Object.keys(json[0]);
    const rows = json.map((obj) =>
      headers.map((h) => `"${String(obj[h] ?? "")}"`).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }

  async function handleConvert() {
    try {
      setError("");
      setLoading(true);
      setProgress(10);

      await new Promise((r) => setTimeout(r, 300));
      setProgress(40);

      const parsed = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of objects");
      }

      await new Promise((r) => setTimeout(r, 300));
      setProgress(70);

      const csv = jsonToCsv(parsed);
      setCsvOutput(csv);

      setProgress(100);
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  }

  function handleFileUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => setJsonInput(String(reader.result));
    reader.readAsText(file);
  }

  function downloadCsv() {
    const blob = new Blob([csvOutput], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: 40, maxWidth: 1200, margin: "auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>JSON → CSV Converter</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Convert structured JSON into CSV instantly
      </p>

      {/* Upload */}
      <input
        type="file"
        accept=".json"
        onChange={(e) =>
          e.target.files && handleFileUpload(e.target.files[0])
        }
      />

      {/* Input */}
      <textarea
        placeholder="Paste JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontFamily: "monospace",
        }}
      />

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: "12px 20px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {/* Progress */}
      {loading && (
        <div
          style={{
            height: 8,
            background: "#eee",
            borderRadius: 4,
            marginTop: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#2563eb",
              transition: "width 0.3s",
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "red", marginTop: 12 }}>
          ❌ {error}
        </p>
      )}

      {/* Output */}
      {csvOutput && (
        <>
          <h2 style={{ marginTop: 30 }}>CSV Output</h2>

          <textarea
            value={csvOutput}
            readOnly
            rows={10}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontFamily: "monospace",
            }}
          />

          <button
            onClick={downloadCsv}
            style={{
              marginTop: 16,
              padding: "12px 20px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Download CSV
          </button>
        </>
      )}
    </main>
  );
}
