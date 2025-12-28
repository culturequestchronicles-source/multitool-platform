"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const previews = useMemo(() => {
    return files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type,
      size: f.size,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function onPick(list: FileList | null) {
    setError("");
    if (!list?.length) return;
    setFiles(Array.from(list));
  }

  async function convert() {
    if (!files.length) {
      setError("Please select one or more images.");
      return;
    }

    setBusy(true);
    setProgress(20);
    setError("");

    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));

      setProgress(45);
      const res = await fetch("/api/pdf/image-to-pdf", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Conversion failed");
      }

      setProgress(80);
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Image → PDF</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Combine JPG/PNG images into a single PDF.
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 14, alignItems: "center" }}>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg"
          onChange={(e) => onPick(e.target.files)}
        />

        <button
          onClick={convert}
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: busy ? "#e5e7eb" : "#111827",
            color: busy ? "#111827" : "white",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {busy ? "Converting..." : "Convert to PDF"}
        </button>

        <button
          onClick={() => setFiles([])}
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          Clear
        </button>
      </div>

      {progress > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 10, background: "#e5e7eb", borderRadius: 999 }}>
            <div
              style={{
                height: 10,
                width: `${progress}%`,
                background: "#2563eb",
                borderRadius: 999,
                transition: "width 200ms ease",
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <p style={{ marginTop: 12, color: "#b91c1c", fontWeight: 700 }}>
          {error}
        </p>
      )}

      {previews.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
            File previews
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {previews.map((p) => (
              <div
                key={p.url}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 10,
                  background: "white",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  {p.name}
                </div>

                {p.type.startsWith("image/") ? (
                  <Image
                    src={p.url}
                    alt={p.name}
                    width={160}
                    height={110}
                    unoptimized
                    style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }}
                  />
                ) : (
                  <div style={{ height: 110, background: "#f3f4f6", borderRadius: 10 }} />
                )}

                <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                  {(p.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
