"use client";

import { useMemo, useState } from "react";

export default function TinyUrlGeneratorPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    code: string;
    original_url: string;
  } | null>(null);

  const tinyUrl = useMemo(() => {
    if (!result?.code) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/t/${result.code}`;
  }, [result]);

  async function generate() {
    setStatus("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generators/tinyurl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(data.error || "Failed to generate");
        setLoading(false);
        return;
      }

      setResult(data);
      setStatus("TinyURL created ✅");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Network error";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setStatus("Copied ✅");
  }

  function download(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded ✅");
  }

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      <h1 style={{ fontSize: 30, fontWeight: 900 }}>TinyURL Generator</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Validates the URL is reachable, then creates a unique short link and stores it securely.
      </p>

      <div
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 14,
          background: "white",
          border: "1px solid #e5e7eb",
        }}
      >
        <label style={{ fontWeight: 700 }}>Original URL</label>
        <input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://example.com/some/long/url"
          style={{
            width: "100%",
            marginTop: 10,
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid #d1d5db",
            outline: "none",
          }}
        />

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={generate}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 16px",
              borderRadius: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {loading ? "Validating & Creating..." : "Create TinyURL"}
          </button>

          <button
            onClick={() => {
              setInputUrl("");
              setResult(null);
              setStatus("");
            }}
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              padding: "12px 16px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {result && (
        <div
          style={{
            marginTop: 18,
            padding: 18,
            borderRadius: 14,
            background: "white",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Result</div>

          <div style={{ fontSize: 14, color: "#6b7280" }}>Tiny URL</div>
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginTop: 6,
              wordBreak: "break-all",
              fontWeight: 700,
            }}
          >
            {tinyUrl}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => copy(tinyUrl)} style={btnSecondary}>
              Copy Tiny URL
            </button>
            <button
              onClick={() =>
                download(
                  `Original: ${result.original_url}\nTiny: ${tinyUrl}\n`,
                  "tinyurl.txt"
                )
              }
              style={btnSecondary}
            >
              Download
            </button>
            <a
              href={tinyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                ...btnSecondary,
                display: "inline-block",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Open Tiny URL
            </a>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
            Same original URL will return the same Tiny URL (uniqueness preserved).
          </div>
        </div>
      )}

      {status && (
        <p style={{ marginTop: 16, fontWeight: 700, color: status.includes("Failed") || status.includes("error") ? "#b91c1c" : "#065f46" }}>
          {status}
        </p>
      )}
    </main>
  );
}

const btnSecondary: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
};
