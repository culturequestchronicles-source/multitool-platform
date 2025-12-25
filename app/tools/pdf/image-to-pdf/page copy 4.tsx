"use client";

import { useMemo, useState } from "react";

type PreviewFile = { file: File; url: string };

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = files.length > 0 && !loading;

  function addFiles(newFiles: FileList | File[]) {
    const list = Array.from(newFiles);
    const mapped = list.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setFiles((prev) => [...prev, ...mapped]);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setError("");
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function removeAt(idx: number) {
    setFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].url);
      copy.splice(idx, 1);
      return copy;
    });
  }

  const totalSizeMb = useMemo(() => {
    const bytes = files.reduce((s, f) => s + f.file.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [files]);

  async function convert() {
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f.file));

      const res = await fetch("/api/pdf/image-to-pdf", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Conversion failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Image → PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Upload PNG/JPG images. We’ll create a single PDF with one image per page.
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          marginTop: 18,
          border: "2px dashed #cbd5e1",
          borderRadius: 14,
          padding: 20,
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={onPick}
          />
          <span style={{ color: "#64748b" }}>
            or drag & drop images here
          </span>
        </div>

        {files.length > 0 && (
          <>
            <div style={{ marginTop: 14, color: "#64748b", fontSize: 13 }}>
              {files.length} file(s) • {totalSizeMb} MB
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 12,
                marginTop: 14,
              }}
            >
              {files.map((pf, idx) => (
                <div
                  key={pf.url}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 10,
                    background: "#fff",
                  }}
                >
                  <img
                    src={pf.url}
                    alt={pf.file.name}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={pf.file.name}
                  >
                    {pf.file.name}
                  </div>
                  <button
                    onClick={() => removeAt(idx)}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            padding: 12,
            borderRadius: 12,
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
        <button
          onClick={convert}
          disabled={!canSubmit}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            background: canSubmit ? "#2563eb" : "#93c5fd",
            color: "white",
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Converting…" : "Convert to PDF"}
        </button>

        {loading && (
          <div style={{ alignSelf: "center", color: "#64748b" }}>
            Processing images…
          </div>
        )}
      </div>
    </main>
  );
}
