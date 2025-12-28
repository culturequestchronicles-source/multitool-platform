"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function MergePdfPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<string>("");

  const canSubmit = useMemo(() => files.length >= 2 && !busy, [files, busy]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const pdfs = Array.from(list).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...pdfs]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    setProgress(15);

    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));

      setProgress(35);
      const res = await fetch("/api/pdf/merge", { method: "POST", body: form });

      setProgress(65);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Merge failed");
      }

      const blob = await res.blob();
      setProgress(85);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setMsg("✅ Merged PDF downloaded.");
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
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Merge PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Combine multiple PDFs into one file.
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
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
          multiple
          onChange={(e) => addFiles(e.target.files)}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
            Select PDFs
          </button>

          <span style={{ color: "#64748b" }}>
            or drag & drop PDFs here
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          {files.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No files selected.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {files.map((f, idx) => (
                <li key={`${f.name}-${idx}`}>
                  {f.name} <span style={{ color: "#64748b" }}>({fmtBytes(f.size)})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setFiles([])}
            disabled={busy || files.length === 0}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            border: "none",
            background: canSubmit ? "#2563eb" : "#94a3b8",
            color: "#fff",
            fontWeight: 800,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {busy ? "Merging..." : "Merge & Download"}
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

      {msg && (
        <p style={{ marginTop: 12, fontWeight: 700 }}>{msg}</p>
      )}
    </main>
  );
}
