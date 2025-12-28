"use client";

import { useRef, useState, type FormEvent } from "react";

function b64ToBlobUrl(b64: string) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export default function SplitPdfPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    setBusy(true);
    setProgress(15);
    setMsg("");

    try {
      const form = new FormData();
      form.append("file", file);

      setProgress(35);
      const res = await fetch("/api/pdf/split", { method: "POST", body: form });

      setProgress(65);

      const data: { pages?: { name: string; b64: string }[]; error?: string } =
        await res.json();
      if (!res.ok) throw new Error(data.error || "Split failed");

      const pages = data.pages;
      if (!pages || pages.length === 0) throw new Error("No pages returned");

      setProgress(80);

      // Download all pages
      for (const p of pages) {
        const url = b64ToBlobUrl(p.b64);
        const a = document.createElement("a");
        a.href = url;
        a.download = p.name;
        a.click();
        URL.revokeObjectURL(url);
      }

      setProgress(100);
      setMsg(`✅ Downloaded ${pages.length} page PDFs.`);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Something went wrong";
      setMsg(`❌ ${message}`);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Split PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Split every page into a separate PDF (downloads each page).
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f && f.type === "application/pdf") setFile(f);
        }}
        style={{
          marginTop: 16,
          border: "2px dashed #cbd5e1",
          borderRadius: 12,
          padding: 18,
          background: "#fff",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#0f172a",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Select PDF
        </button>

        <span style={{ marginLeft: 10, color: "#64748b" }}>
          or drag & drop a PDF here
        </span>

        <div style={{ marginTop: 14 }}>
          {!file ? (
            <p style={{ color: "#94a3b8" }}>No file selected.</p>
          ) : (
            <p style={{ fontWeight: 700 }}>{file.name}</p>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
        <button
          type="submit"
          disabled={!file || busy}
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            border: "none",
            background: !file || busy ? "#94a3b8" : "#2563eb",
            color: "#fff",
            fontWeight: 800,
            cursor: !file || busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Splitting..." : "Split & Download"}
        </button>
      </form>

      {progress > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999 }}>
            <div
              style={{
                height: 8,
                width: `${progress}%`,
                background: "#2563eb",
                borderRadius: 999,
                transition: "width 180ms ease",
              }}
            />
          </div>
        </div>
      )}

      {msg && <p style={{ marginTop: 12, fontWeight: 700 }}>{msg}</p>}
    </main>
  );
}
