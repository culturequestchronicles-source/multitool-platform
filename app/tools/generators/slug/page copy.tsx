"use client";

import { useMemo, useState } from "react";

// --- Slug logic (robust) ---
function slugify(input: string, opts: {
  lowercase: boolean;
  separator: "-" | "_";
  removeStopWords: boolean;
  maxLen: number;
  preserveUnicode: boolean;
}) {
  let s = input.trim();

  // Optional: remove common stop words
  if (opts.removeStopWords) {
    const stop = new Set([
      "a","an","the","and","or","but","to","of","in","on","for","with","at","by","from"
    ]);
    s = s
      .split(/\s+/)
      .filter(w => !stop.has(w.toLowerCase()))
      .join(" ");
  }

  // Normalize spaces to single
  s = s.replace(/\s+/g, " ");

  // If not preserving unicode, convert accents → ascii
  if (!opts.preserveUnicode) {
    s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  // Replace apostrophes
  s = s.replace(/[’']/g, "");

  // Replace non-word chars (keep letters/numbers, optionally unicode)
  if (opts.preserveUnicode) {
    // Keep unicode letters/numbers
    s = s.replace(/[^\p{L}\p{N}\s-_]+/gu, " ");
  } else {
    s = s.replace(/[^a-zA-Z0-9\s-_]+/g, " ");
  }

  // Replace spaces and underscores/dashes to chosen separator
  const sep = opts.separator;
  s = s.replace(/[-_]+/g, " ");        // collapse existing separators to space
  s = s.trim().replace(/\s+/g, sep);   // spaces → separator

  // Lowercase optional
  if (opts.lowercase) s = s.toLowerCase();

  // Collapse repeated separators
  const re = sep === "-" ? /-+/g : /_+/g;
  s = s.replace(re, sep);

  // Trim separators from ends
  const trimRe = sep === "-" ? /^-+|-+$/g : /^_+|_+$/g;
  s = s.replace(trimRe, "");

  // Max length (try to cut cleanly)
  if (opts.maxLen > 0 && s.length > opts.maxLen) {
    s = s.slice(0, opts.maxLen);
    // remove trailing separator after cut
    s = s.replace(trimRe, "");
  }

  return s;
}

// Optional tracking (safe no-op if not configured)
async function track(tool: string, action: string) {
  try {
    // If you already have /api/track use it; otherwise it will fail silently.
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, action }),
    });
  } catch {}
}

export default function SlugGeneratorPage() {
  const [title, setTitle] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [maxLen, setMaxLen] = useState(80);
  const [preserveUnicode, setPreserveUnicode] = useState(false);

  const slug = useMemo(
    () =>
      slugify(title, {
        lowercase,
        separator,
        removeStopWords,
        maxLen,
        preserveUnicode,
      }),
    [title, lowercase, separator, removeStopWords, maxLen, preserveUnicode]
  );

  const [status, setStatus] = useState("");

  async function copy() {
    await navigator.clipboard.writeText(slug);
    setStatus("Copied ✅");
    track("slug-generator", "copy");
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
    track("slug-generator", "download");
  }

  function clearAll() {
    setTitle("");
    setStatus("");
    track("slug-generator", "clear");
  }

  return (
    <main style={{ padding: 40, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 8 }}>
        Slug Generator
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 22 }}>
        Create clean URL slugs for blog posts, product pages, and SEO titles.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 18,
          padding: 18,
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          background: "white",
        }}
      >
        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>
            Title / Text
          </label>

          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 10 Best AI Tools for Data Conversion in 2026!"
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              outline: "none",
              fontSize: 14,
            }}
          />
          <div style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
            Tip: paste a blog title, heading, or product name.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
            />
            Lowercase
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={removeStopWords}
              onChange={(e) => setRemoveStopWords(e.target.checked)}
            />
            Remove stop words (a, the, of…)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={preserveUnicode}
              onChange={(e) => setPreserveUnicode(e.target.checked)}
            />
            Preserve Unicode (e.g. café → café)
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            Separator:
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value as "-" | "_")}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                marginLeft: 6,
              }}
            >
              <option value="-">- (dash)</option>
              <option value="_">_ (underscore)</option>
            </select>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            Max length:
            <input
              type="number"
              value={maxLen}
              min={0}
              max={200}
              onChange={(e) => setMaxLen(Number(e.target.value))}
              style={{
                width: 90,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
              }}
            />
          </label>
        </div>

        <div>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>
            Output Slug
          </label>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <input
              value={slug}
              readOnly
              style={{
                flex: 1,
                minWidth: 260,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                background: "#f9fafb",
              }}
            />

            <button
              onClick={copy}
              disabled={!slug}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #111827",
                background: "#111827",
                color: "white",
                fontWeight: 700,
                cursor: slug ? "pointer" : "not-allowed",
              }}
            >
              Copy
            </button>

            <button
              onClick={download}
              disabled={!slug}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                fontWeight: 700,
                cursor: slug ? "pointer" : "not-allowed",
              }}
            >
              Download
            </button>

            <button
              onClick={clearAll}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                fontWeight: 700,
              }}
            >
              Clear
            </button>
          </div>

          {status && (
            <div style={{ marginTop: 10, color: "#16a34a", fontWeight: 700 }}>
              {status}
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: 26, color: "#6b7280", fontSize: 13 }}>
        <b>Examples:</b> <br />
        “Hello World!” → <code>hello-world</code> <br />
        “Café Menu 2026” (ascii) → <code>cafe-menu-2026</code>
      </section>
    </main>
  );
}
