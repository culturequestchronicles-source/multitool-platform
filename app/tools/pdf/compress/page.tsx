"use client";

import { useRef, useState, type FormEvent } from "react";

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function CompressPdfPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");

  function pick(f: File | null) {
    setMsg("");
    setFile(f);
  }

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
      const res = await fetch("/api/pdf/compress", { method: "POST", body: form });

      setProgress(65);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Compress failed");
      }

      const blob = await res.blob();
      setProgress(85);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setMsg("✅ Compressed PDF downloaded.");
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
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Compress PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Reduce PDF size (basic safe compression).
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f && f.type === "application/pdf") pick(f);
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
          onChange={(e) => pick(e.target.files?.[0] || null)}
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
            <p style={{ fontWeight: 700 }}>
              {file.name} <span style={{ color: "#64748b" }}>({fmtBytes(file.size)})</span>
            </p>
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
          {busy ? "Compressing..." : "Compress & Download"}
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
