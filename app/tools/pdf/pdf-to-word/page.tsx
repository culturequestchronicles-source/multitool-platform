"use client";

import { useState } from "react";

export default function PdfToWordPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setStatus("");

    const file: File | undefined = e.target.file.files?.[0];
    if (!file) {
      setStatus("Please upload a PDF file");
      return;
    }

    setLoading(true);
    setStatus("Converting...");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/pdf/pdf-to-word", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Conversion failed");
      setLoading(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.docx";
    a.click();

    URL.revokeObjectURL(url);
    setStatus("Downloaded converted.docx ✅");
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 760 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>PDF → Word</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Extracts text from a PDF and downloads a DOCX file.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          name="file"
          type="file"
          accept="application/pdf"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
        />

        {fileName && (
          <p style={{ marginTop: 10, color: "#374151" }}>
            Selected: <b>{fileName}</b>
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Working..." : "Convert to Word"}
          </button>
        </div>
      </form>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
