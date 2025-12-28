"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";

type StatusKind = "idle" | "info" | "success" | "error";
type StatusState = { kind: StatusKind; message: string };

export default function PdfToWordPage() {
  const [status, setStatus] = useState<StatusState>({ kind: "idle", message: "" });
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const canSubmit = useMemo(() => !!fileName && !loading, [fileName, loading]);

  const formattedSize = useMemo(() => {
    if (!fileSize) return "";
    if (fileSize < 1024) return `${fileSize} B`;
    const kb = fileSize / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }, [fileSize]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "idle", message: "" });

    const formEl = e.currentTarget;
    const input = formEl.elements.namedItem("file") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setStatus({ kind: "error", message: "Please upload a PDF file." });
      return;
    }

    setLoading(true);
    setStatus({ kind: "info", message: "Converting PDF to Word..." });

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/pdf/pdf-to-word", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus({
        kind: "error",
        message: err.error || "Conversion failed. Please try again.",
      });
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
    setStatus({ kind: "success", message: "Downloaded converted.docx ✅" });
    setLoading(false);
  }

  return (
    <main style={{ padding: "56px 24px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: 18,
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          📄
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>
          PDF to Word <span style={{ color: "#2563eb" }}>Converter</span>
        </h1>
        <p style={{ color: "#64748b", marginTop: 10 }}>
          Accurately convert PDF documents to editable Microsoft Word files while preserving layouts.
        </p>

        <section
          style={{
            marginTop: 32,
            background: "white",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
            border: "1px solid #eef2f7",
            textAlign: "left",
          }}
        >
          <form onSubmit={handleSubmit} ref={formRef}>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 12 }}>
              Upload a PDF file
            </label>
            <input
              name="file"
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileName(file?.name || "");
                setFileSize(file?.size ?? null);
              }}
            />

            {fileName && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{fileName}</div>
                  {formattedSize && (
                    <div style={{ color: "#64748b", fontSize: 13 }}>{formattedSize}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileName("");
                    setFileSize(null);
                    setStatus({ kind: "idle", message: "" });
                    const form = formRef.current;
                    if (!form) return;
                    const input = form.elements.namedItem("file");
                    if (input instanceof HTMLInputElement) {
                      input.value = "";
                    }
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            )}

            {status.message && (
              <div
                style={{
                  marginTop: 18,
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontWeight: 600,
                  background:
                    status.kind === "error"
                      ? "#fee2e2"
                      : status.kind === "success"
                      ? "#dcfce7"
                      : "#e0f2fe",
                  color:
                    status.kind === "error"
                      ? "#b91c1c"
                      : status.kind === "success"
                      ? "#166534"
                      : "#0c4a6e",
                  border: "1px solid",
                  borderColor:
                    status.kind === "error"
                      ? "#fecaca"
                      : status.kind === "success"
                      ? "#bbf7d0"
                      : "#bae6fd",
                }}
              >
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                marginTop: 20,
                width: "100%",
                background: canSubmit ? "#2563eb" : "#93c5fd",
                color: "white",
                padding: "14px 16px",
                borderRadius: 12,
                border: "none",
                fontWeight: 800,
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 12px 22px rgba(37,99,235,0.25)" : "none",
              }}
            >
              {loading ? "Converting..." : "Convert to Word"}
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #eef2f7",
              display: "flex",
              justifyContent: "center",
              gap: 24,
              color: "#64748b",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e" }} />
              100% Private
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#60a5fa" }} />
              Cloud Processing
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
