"use client";

import { useState, type FormEvent } from "react";

export default function CsvToExcelPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");

    const formEl = e.currentTarget;
    const input = formEl.elements.namedItem("file") as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      setStatus("Please upload a CSV file");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/excel/csv-to-excel", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(err.error || "Conversion failed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.xlsx";
      a.click();

      URL.revokeObjectURL(url);
      setStatus("Downloaded converted.xlsx ✅");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 760 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>CSV → Excel</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Upload a .csv file and download a real .xlsx spreadsheet.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
        />

        {fileName && (
          <p style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>
            Selected: <b>{fileName}</b>
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Converting..." : "Convert to Excel"}
          </button>
        </div>
      </form>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
