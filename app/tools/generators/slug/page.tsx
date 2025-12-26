"use client";

import { useMemo, useState } from "react";
import { trackUsage } from "../../../../lib/track";

function slugify(input: string, opts: { lowercase: boolean; maxLen: number; separator: "-" | "_" }) {
  const sep = opts.separator;

  // 1) Trim
  let s = input.trim();

  // 2) Replace common symbols with words
  s = s
    .replace(/&/g, " and ")
    .replace(/@/g, " at ")
    .replace(/%/g, " percent ");

  // 3) Normalize spaces
  s = s.replace(/\s+/g, " ");

  // 4) Clean non-ASCII
  s = s.replace(/[^A-Za-z0-9 _-]+/g, "");

  // 5) Convert separators
  s = s.replace(/[_-]+/g, " ");
  s = s.trim().replace(/\s+/g, sep);

  // 6) Lowercase option
  if (opts.lowercase) s = s.toLowerCase();

  // 7) Collapse multiple separators
  const multiSep = sep === "-" ? /-+/g : /_+/g;
  s = s.replace(multiSep, sep);

  // 8) Trim separators from ends
  const trimSep = sep === "-" ? /^-+|-+$/g : /^_+|_+$/g;
  s = s.replace(trimSep, "");

  // 9) Max length
  if (opts.maxLen > 0 && s.length > opts.maxLen) {
    s = s.slice(0, opts.maxLen);
    s = s.replace(trimSep, "");
  }

  return s;
}

export default function SlugGeneratorPage() {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [lowercase, setLowercase] = useState(true);
  const [maxLen, setMaxLen] = useState(80);
  const [status, setStatus] = useState("");

  const slug = useMemo(() => {
    return slugify(text, { lowercase, maxLen, separator });
  }, [text, lowercase, maxLen, separator]);

  async function copy() {
    await navigator.clipboard.writeText(slug);
    setStatus("Copied ✅");
    // FIX: Wrapped arguments into a single object
    trackUsage({ tool: "slug-generator", action: "copy" });
    setTimeout(() => setStatus(""), 1200);
  }

  function download() {
    const blob = new Blob([slug + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slug.txt";
    a.click();
    URL.revokeObjectURL(url);
    // FIX: Wrapped arguments into a single object
    trackUsage({ tool: "slug-generator", action: "download" });
  }

  function clearAll() {
    setText("");
    setStatus("");
    // FIX: Wrapped arguments into a single object
    trackUsage({ tool: "slug-generator", action: "clear" });
  }

  return (
    <main style={{ padding: 40, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 8 }}>Slug Generator</h1>
      <p style={{ color: "#6b7280", marginBottom: 22 }}>
        Turn any text into a clean URL slug. Copy or download instantly.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
          <label style={{ fontWeight: 700 }}>Input</label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Note: Intentionally not tracking every keystroke to avoid spamming analytics
            }}
            placeholder="Type or paste your title here…"
            rows={7}
            style={{
              width: "100%",
              marginTop: 8,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              fontSize: 14,
            }}
          />

          <div style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 700 }}>Slug</label>
            <div
              style={{
                marginTop: 8,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: "#f9fafb",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 14,
                wordBreak: "break-word",
                minHeight: 46,
              }}
            >
              {slug || <span style={{ color: "#9ca3af" }}>Your slug will appear here…</span>}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button
                onClick={copy}
                disabled={!slug}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: slug ? "pointer" : "not-allowed",
                  opacity: slug ? 1 : 0.6,
                }}
              >
                Copy
              </button>

              <button
                onClick={download}
                disabled={!slug}
                style={{
                  background: "#111827",
                  color: "white",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: slug ? "pointer" : "not-allowed",
                  opacity: slug ? 1 : 0.6,
                }}
              >
                Download
              </button>

              <button
                onClick={clearAll}
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>

              {status && <span style={{ alignSelf: "center", color: "#059669", fontWeight: 700 }}>{status}</span>}
            </div>
          </div>
        </div>

        <aside style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 14 }}>Options</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontWeight: 700 }}>Separator</label>
              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                <button
                  onClick={() => setSeparator("-")}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: separator === "-" ? "#2563eb" : "#fff",
                    color: separator === "-" ? "#fff" : "#111827",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Dash (-)
                </button>

                <button
                  onClick={() => setSeparator("_")}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: separator === "_" ? "#2563eb" : "#fff",
                    color: separator === "_" ? "#fff" : "#111827",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Underscore (_)
                </button>
              </div>
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
              />
              Lowercase
            </label>

            <div>
              <label style={{ fontWeight: 700 }}>Max length</label>
              <input
                type="number"
                value={maxLen}
                min={0}
                max={200}
                onChange={(e) => setMaxLen(Number(e.target.value || 0))}
                style={{
                  marginTop: 8,
                  width: "100%",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                }}
              />
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
                Set to 0 to disable length limit.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}