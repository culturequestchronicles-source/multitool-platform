"use client";

import { useEffect, useMemo, useState } from "react";

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "queued" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [previews, setPreviews] = useState<{ page: number; dataUrl: string }[]>([]);
  const [error, setError] = useState<string>("");

  const canStart = useMemo(() => !!file && status !== "running", [file, status]);

  async function startConvert(e: any) {
    e.preventDefault();
    setError("");
    setMessage("");
    setProgress(0);
    setPreviews([]);
    setStatus("queued");

    if (!file) {
      setError("Please select a PDF file");
      setStatus("error");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/pdf/pdf-to-image", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to start");
      setStatus("error");
      return;
    }

    setJobId(data.jobId);
    setStatus("running");
  }

  // Poll status
  useEffect(() => {
    if (!jobId) return;

    let alive = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pdf/pdf-to-image/status?jobId=${jobId}`);
        const data = await res.json();

        if (!alive) return;

        if (!res.ok) {
          setError(data.error || "Status error");
          setStatus("error");
          clearInterval(interval);
          return;
        }

        setProgress(data.progress ?? 0);
        setMessage(data.message ?? "");
        setPreviews(Array.isArray(data.previews) ? data.previews : []);
        setStatus(data.status);

        if (data.status === "done" || data.status === "error") {
          clearInterval(interval);
        }
      } catch (e: any) {
        setError(e.message || "Polling failed");
        setStatus("error");
        clearInterval(interval);
      }
    }, 500);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [jobId]);

  function downloadZip() {
    if (!jobId) return;
    const a = document.createElement("a");
    a.href = `/api/pdf/pdf-to-image/download?jobId=${jobId}`;
    a.download = `pdf-pages-${jobId}.zip`;
    a.click();
  }

  return (
    <main style={{ padding: 40, maxWidth: 1100 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>PDF → PNG (Preview + Progress)</h1>
      <p style={{ color: "#555", marginTop: 6 }}>
        Converts each PDF page into a PNG and downloads as a ZIP.
      </p>

      <form onSubmit={startConvert} style={{ marginTop: 18 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={!canStart}
          style={{
            marginLeft: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: canStart ? "#111" : "#eee",
            color: canStart ? "#fff" : "#666",
            cursor: canStart ? "pointer" : "not-allowed",
          }}
        >
          Convert to PNG
        </button>
      </form>

      {status !== "idle" && (
        <section style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 320, height: 12, background: "#eee", borderRadius: 999 }}>
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                  height: "100%",
                  background: "#2563eb",
                  borderRadius: 999,
                  transition: "width 200ms linear",
                }}
              />
            </div>
            <div style={{ fontSize: 13, color: "#333" }}>{progress}%</div>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
            {message || (status === "running" ? "Working..." : status)}
          </div>

          {status === "done" && (
            <button
              onClick={downloadZip}
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#16a34a",
                color: "#fff",
                cursor: "pointer",
              }}
              type="button"
            >
              Download ZIP
            </button>
          )}

          {error && <div style={{ marginTop: 10, color: "crimson" }}>{error}</div>}
        </section>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Preview (first {previews.length} pages)</h2>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {previews.map((p) => (
              <div
                key={p.page}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 10,
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
                  Page {p.page}
                </div>
                <img
                  src={p.dataUrl}
                  alt={`Page ${p.page}`}
                  style={{ width: "100%", borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
