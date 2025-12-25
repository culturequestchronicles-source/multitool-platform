"use client";

import { useState } from "react";

export default function WordToPdfPage() {
  const [status, setStatus] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setStatus("");

    const file: File | undefined = e.target.file?.files?.[0];
    if (!file) {
      setStatus("Please upload a DOCX file");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/pdf/word-to-pdf", {
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
    a.download = "converted.pdf";
    a.click();
    URL.revokeObjectURL(url);

    setStatus("Downloaded converted.pdf");
  }

  return (
    <main style={{ padding: 40, maxWidth: 760 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Word → PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Uploads a .docx and downloads a PDF (text-based).
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input name="file" type="file" accept=".docx" />
        <div style={{ marginTop: 16 }}>
          <button type="submit">Convert to PDF</button>
        </div>
      </form>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
