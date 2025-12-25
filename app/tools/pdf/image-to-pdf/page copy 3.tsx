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

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<string>("");

  const previews = useMemo(
    () =>
      files.map((f) => ({
        name: f.name,
        size: f.size,
        url: URL.createObjectURL(f),
      })),
    [files]
  );

  function onPick(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles(arr);
    setMsg(arr.length ? `${arr.length} image(s) selected` : "Please select image files");
  }

  async function convert() {
    if (!files.length) {
      setMsg("Please select at least one image.");
      return;
    }

    setBusy(true);
    setProgress(10);
    setMsg("Uploading images...");

    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));

      setProgress(35);
      setMsg("Building PDF...");

      const res = await fetch("/api/pdf/image-to-pdf", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Image → PDF failed");
      }

      setProgress(80);
      setMsg("Preparing download...");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();

      setProgress(100);
      setMsg("Done ✅ Download started.");
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setProgress(0);
    setMsg("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onPick(e.dataTransfer.files);
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Image → PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Convert multiple images into a single PDF. Files are processed in-memory.
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
            accept="image/*"
            multiple
            onChange={(e) => onPick(e.target.files)}
            disabled={busy}
          />
          <button onClick={convert} disabled={busy} style={btnPrimary}>
            {busy ? "Working..." : "Convert to PDF"}
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
      </div>

      {/* Previews */}
      {files.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Preview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {previews.map((p) => (
              <div key={p.url} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "white" }}>
                <img
                  src={p.url}
                  alt={p.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }}
                />
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </div>
                  <div style={{ color: "#64748b" }}>{formatBytes(p.size)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
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
