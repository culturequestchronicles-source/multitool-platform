"use client";

import { useMemo, useState } from "react";

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [scale, setScale] = useState(2);
  const [maxPages, setMaxPages] = useState(25);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  function onPick(f: File | null) {
    setFile(f);
    if (!f) {
      setMsg("");
      return;
    }
    setMsg(`Selected: ${f.name} (${formatBytes(f.size)})`);
  }

  async function convert() {
    if (!file) {
      setMsg("Please choose a PDF first.");
      return;
    }

    setBusy(true);
    setProgress(10);
    setMsg("Uploading PDF...");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("scale", String(scale));
      form.append("maxPages", String(maxPages));

      setProgress(40);
      setMsg("Rendering pages on server...");

      const res = await fetch("/api/pdf/pdf-to-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "PDF → Image failed");
      }

      setProgress(80);
      setMsg("Preparing ZIP download...");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${(file.name || "pdf").replace(/\.pdf$/i, "")}-images.zip`;
      a.click();

      setProgress(100);
      setMsg("Done ✅ ZIP download started.");
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setProgress(0);
    setMsg("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    if (f) onPick(f);
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>PDF → Image</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Renders PDF pages on the server and downloads a ZIP of PNG files.
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          marginTop: 20,
          border: "2px dashed #cbd5e1",
          borderRadius: 14,
          padding: 22,
          background: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => onPick(e.target.files?.[0] || null)}
            disabled={busy}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Scale
            <select value={scale} onChange={(e) => setScale(Number(e.target.value))} disabled={busy}>
              <option value={1}>1x (fast)</option>
              <option value={2}>2x (default)</option>
              <option value={3}>3x</option>
              <option value={4}>4x (slow)</option>
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Max pages
            <input
              type="number"
              min={1}
              max={50}
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              disabled={busy}
              style={{ width: 80 }}
            />
          </label>

          <button onClick={convert} disabled={busy} style={btnPrimary}>
            {busy ? "Working..." : "Convert to Images (ZIP)"}
          </button>

          <button onClick={clear} disabled={busy} style={btnGhost}>
            Clear
          </button>
        </div>

        {busy && (
          <div style={{ marginTop: 14 }}>
            <div style={{ height: 10, background: "#e5e7eb", borderRadius: 999 }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "#2563eb",
                  transition: "width 200ms ease",
                }}
              />
            </div>
            <div style={{ marginTop: 8, color: "#334155" }}>{msg}</div>
          </div>
        )}

        {!busy && msg && <div style={{ marginTop: 12, color: "#334155" }}>{msg}</div>}

        {/* Small preview */}
        {file && !busy && (
          <div style={{ marginTop: 14, fontSize: 12, color: "#64748b" }}>
            Tip: If a PDF has many pages, increase Max pages carefully (cost & time).
          </div>
        )}
      </div>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  background: "white",
  color: "#0f172a",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontWeight: 700,
  cursor: "pointer",
};
