"use client";

import { useMemo, useState } from "react";

type GuidFormat = "lower" | "upper";
type Braces = "none" | "braces";

function uuidv4(): string {
  // Browser-safe UUID v4 generator (crypto if available)
  const cryptoObj = typeof crypto !== "undefined" ? crypto : null;

  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();

  const bytes = cryptoObj?.getRandomValues
    ? cryptoObj.getRandomValues(new Uint8Array(16))
    : new Uint8Array(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)));

  // Per RFC4122 v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
}

function formatGuid(guid: string, format: GuidFormat, braces: Braces) {
  let v = format === "upper" ? guid.toUpperCase() : guid.toLowerCase();
  if (braces === "braces") v = `{${v}}`;
  return v;
}

export default function GuidGeneratorPage() {
  const [count, setCount] = useState<number>(10);
  const [format, setFormat] = useState<GuidFormat>("lower");
  const [braces, setBraces] = useState<Braces>("none");
  const [guids, setGuids] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedCount = useMemo(() => {
    if (!Number.isFinite(count)) return 10;
    return Math.max(1, Math.min(100, count));
  }, [count]);

  async function handleGenerate() {
    setLoading(true);
    setStatus("");

    // tiny delay so spinner feels responsive
    await new Promise((r) => setTimeout(r, 120));

    const next = Array.from({ length: normalizedCount }, () =>
      formatGuid(uuidv4(), format, braces)
    );

    setGuids(next);
    setLoading(false);
    setStatus(`Generated ${next.length} GUID${next.length === 1 ? "" : "s"} ✅`);
  }

  async function copyAll() {
    if (guids.length === 0) return;
    await navigator.clipboard.writeText(guids.join("\n"));
    setStatus("Copied all GUIDs to clipboard ✅");
  }

  async function copyOne(value: string) {
    await navigator.clipboard.writeText(value);
    setStatus("Copied GUID ✅");
  }

  function downloadTxt() {
    if (guids.length === 0) return;
    const blob = new Blob([guids.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guids.txt";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded guids.txt ✅");
  }

  return (
    <main style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <section style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900 }}>🆔 GUID Generator</h1>
          <a href="/tools/generators" style={{ color: "#2563eb", textDecoration: "none" }}>
            ← Back to Generators
          </a>
        </div>

        <p style={{ color: "#6b7280", marginTop: 10 }}>
          Generate unique GUIDs/UUIDs for testing, databases, APIs, and more.
        </p>

        {/* Controls */}
        <div
          style={{
            marginTop: 20,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <label style={label}>
            Count (1–100)
            <input
              type="number"
              value={count}
              min={1}
              max={100}
              onChange={(e) => setCount(parseInt(e.target.value || "10", 10))}
              style={input}
            />
          </label>

          <label style={label}>
            Case
            <select value={format} onChange={(e) => setFormat(e.target.value as GuidFormat)} style={input}>
              <option value="lower">lowercase</option>
              <option value="upper">UPPERCASE</option>
            </select>
          </label>

          <label style={label}>
            Braces
            <select value={braces} onChange={(e) => setBraces(e.target.value as Braces)} style={input}>
              <option value="none">none</option>
              <option value="braces">{`{...}`}</option>
            </select>
          </label>

          <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
            <button onClick={handleGenerate} style={primaryBtn} disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </button>
            <button onClick={copyAll} style={btn} disabled={guids.length === 0}>
              Copy all
            </button>
            <button onClick={downloadTxt} style={btn} disabled={guids.length === 0}>
              Download
            </button>
          </div>
        </div>

        {/* Output */}
        <div
          style={{
            marginTop: 18,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Results</h2>
            <span style={{ color: "#6b7280", fontSize: 13 }}>
              {guids.length ? `${guids.length} item(s)` : "No GUIDs yet"}
            </span>
          </div>

          {guids.length === 0 ? (
            <p style={{ color: "#6b7280", marginTop: 10 }}>
              Click <b>Generate</b> to create GUIDs.
            </p>
          ) : (
            <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: "none", display: "grid", gap: 10 }}>
              {guids.map((g, idx) => (
                <li key={`${g}-${idx}`} style={row}>
                  <code style={{ fontSize: 14 }}>{g}</code>
                  <button onClick={() => copyOne(g)} style={smallBtn}>
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          )}

          {status && <p style={{ marginTop: 12, color: "#065f46", fontWeight: 600 }}>{status}</p>}
        </div>
      </section>
    </main>
  );
}

const label: React.CSSProperties = { fontSize: 13, color: "#374151", display: "grid", gap: 6 };
const input: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "10px 12px",
  outline: "none",
  background: "#fff",
};

const primaryBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

const btn: React.CSSProperties = {
  background: "white",
  color: "#111827",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const row: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const smallBtn: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 700,
};
