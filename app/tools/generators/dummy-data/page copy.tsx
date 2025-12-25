"use client";

import { useMemo, useState } from "react";

/** Optional tracking – safe no-op if you don't have lib/track */
async function trackUsageSafe(event: string, meta?: any) {
  try {
    // If you later create lib/track.ts, you can replace this with import.
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "dummy-data-generator", action: event, meta }),
    }).catch(() => {});
  } catch {}
}

type FieldKey =
  | "name"
  | "phone"
  | "email"
  | "street"
  | "postal"
  | "region"
  | "country"
  | "list"
  | "word"
  | "number"
  | "currency"
  | "alphanumeric"
  | "api";

type FormatKey =
  | "JSON"
  | "CSV"
  | "SQL"
  | "XML"
  | "HTML"
  | "Javascript"
  | "Typescript"
  | "PHP"
  | "Perl"
  | "C#"
  | "Ruby"
  | "Python";

const FIELD_DEFS: { key: FieldKey; label: string; desc: string }[] = [
  { key: "name", label: "Name", desc: "Person name" },
  { key: "phone", label: "Phone", desc: "Phone number" },
  { key: "email", label: "Email", desc: "Email address" },
  { key: "street", label: "Street Address", desc: "Street + city" },
  { key: "postal", label: "Postal/Zip", desc: "Postal code" },
  { key: "region", label: "Region", desc: "State/Province" },
  { key: "country", label: "Country", desc: "Country name" },
  { key: "list", label: "List", desc: "Comma list" },
  { key: "word", label: "Word", desc: "Single word" },
  { key: "number", label: "Number", desc: "Integer" },
  { key: "currency", label: "Currency", desc: "Amount + currency" },
  { key: "alphanumeric", label: "Alphanumeric", desc: "Random token" },
  { key: "api", label: "API Test Data", desc: "id/status/endpoint/etc." },
];

const FORMAT_DEFS: { key: FormatKey; label: string }[] = [
  { key: "JSON", label: "JSON" },
  { key: "CSV", label: "CSV" },
  { key: "SQL", label: "SQL" },
  { key: "XML", label: "XML" },
  { key: "HTML", label: "HTML" },
  { key: "Javascript", label: "Javascript" },
  { key: "Typescript", label: "Typescript" },
  { key: "PHP", label: "PHP" },
  { key: "Perl", label: "Perl" },
  { key: "C#", label: "C#" },
  { key: "Ruby", label: "Ruby" },
  { key: "Python", label: "Python" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomToken(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Simple, local-only fake data (no dependencies) */
function genRow(selected: Set<FieldKey>) {
  const firstNames = ["Ava", "Liam", "Noah", "Mia", "Olivia", "Ethan", "Sophia", "Aria", "Lucas", "Zoe"];
  const lastNames = ["Patel", "Smith", "Johnson", "Lee", "Garcia", "Martinez", "Kim", "Brown", "Davis", "Singh"];
  const domains = ["example.com", "mail.com", "test.io", "demo.org", "acme.co"];
  const streets = ["Maple St", "Oak Ave", "Cedar Rd", "Pine Ln", "Sunset Blvd", "Main St"];
  const cities = ["Austin", "Seattle", "Miami", "Denver", "Boston", "San Jose"];
  const regions = ["CA", "TX", "NY", "FL", "WA", "IL"];
  const countries = ["USA", "Canada", "UK", "India", "Germany", "Australia"];
  const statuses = ["200 OK", "201 Created", "400 Bad Request", "401 Unauthorized", "404 Not Found", "500 Server Error"];
  const methods = ["GET", "POST", "PUT", "DELETE"];
  const endpoints = ["/api/users", "/api/orders", "/api/login", "/api/products", "/api/search"];

  const row: Record<string, any> = {};

  if (selected.has("name")) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    row.name = `${fn} ${ln}`;
  }

  if (selected.has("phone")) {
    row.phone = `(${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`;
  }

  if (selected.has("email")) {
    const user = (row.name ? String(row.name).toLowerCase().replace(/\s+/g, ".") : randomToken(8)).slice(0, 18);
    row.email = `${user}@${pick(domains)}`;
  }

  if (selected.has("street")) {
    row.street_address = `${randInt(10, 9999)} ${pick(streets)}, ${pick(cities)}`;
  }

  if (selected.has("postal")) {
    row.postal_zip = `${randInt(10000, 99999)}`;
  }

  if (selected.has("region")) {
    row.region = pick(regions);
  }

  if (selected.has("country")) {
    row.country = pick(countries);
  }

  if (selected.has("list")) {
    row.list = [pick(["alpha", "beta", "gamma", "delta"]), pick(["red", "blue", "green", "yellow"]), pick(["cat", "dog", "fox", "owl"])].join(", ");
  }

  if (selected.has("word")) {
    row.word = pick(["lorem", "ipsum", "delta", "fusion", "atlas", "nova", "spark", "zephyr"]);
  }

  if (selected.has("number")) {
    row.number = randInt(1, 10000);
  }

  if (selected.has("currency")) {
    const amount = (Math.random() * 1000 + 1).toFixed(2);
    row.currency = `${amount} ${pick(["USD", "EUR", "GBP", "INR", "CAD"])}`;
  }

  if (selected.has("alphanumeric")) {
    row.alphanumeric = randomToken(12);
  }

  if (selected.has("api")) {
    row.id = `req_${randomToken(10)}`;
    row.created_at = `${randInt(2024, 2026)}-${pad2(randInt(1, 12))}-${pad2(randInt(1, 28))}T${pad2(randInt(0, 23))}:${pad2(randInt(0, 59))}:${pad2(randInt(0, 59))}Z`;
    row.endpoint = pick(endpoints);
    row.method = pick(methods);
    row.status = pick(statuses);
    row.latency_ms = randInt(10, 1200);
  }

  return row;
}

function toCSV(rows: Record<string, any>[]) {
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = keys.join(",");
  const lines = rows.map((r) => keys.map((k) => escape(r[k])).join(","));
  return [header, ...lines].join("\n");
}

function toSQL(rows: Record<string, any>[], table = "dummy_data") {
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const esc = (v: any) => {
    if (v === null || v === undefined) return "NULL";
    const s = String(v).replace(/'/g, "''");
    return `'${s}'`;
  };
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const values = rows
    .map((r) => `(${keys.map((k) => esc(r[k])).join(", ")})`)
    .join(",\n");
  return `INSERT INTO "${table}" (${cols}) VALUES\n${values};`;
}

function toXML(rows: Record<string, any>[]) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const items = rows
    .map((r) => {
      const fields = Object.entries(r)
        .map(([k, v]) => `    <${k}>${esc(String(v ?? ""))}</${k}>`)
        .join("\n");
      return `  <row>\n${fields}\n  </row>`;
    })
    .join("\n");
  return `<rows>\n${items}\n</rows>`;
}

function toHTMLTable(rows: Record<string, any>[]) {
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const thead = `<tr>${keys.map((k) => `<th>${esc(k)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((r) => `<tr>${keys.map((k) => `<td>${esc(String(r[k] ?? ""))}</td>`).join("")}</tr>`)
    .join("\n");
  return `<table>\n<thead>\n${thead}\n</thead>\n<tbody>\n${tbody}\n</tbody>\n</table>`;
}

function toCodeObject(rows: Record<string, any>[], lang: FormatKey) {
  if (lang === "Javascript") return `const data = ${JSON.stringify(rows, null, 2)};`;
  if (lang === "Typescript") return `type Row = Record<string, any>;\nconst data: Row[] = ${JSON.stringify(rows, null, 2)};`;
  if (lang === "Python") return `data = ${JSON.stringify(rows, null, 2)}`;
  if (lang === "Ruby") return `data = ${JSON.stringify(rows, null, 2)}`;
  if (lang === "PHP") return `<?php\n$data = ${JSON.stringify(rows, null, 2)};\n`;
  if (lang === "Perl") return `my $data = ${JSON.stringify(rows, null, 2)};`;
  if (lang === "C#") return `var data = ${JSON.stringify(rows, null, 2)};`;
  return JSON.stringify(rows, null, 2);
}

function fileExtFor(format: FormatKey) {
  switch (format) {
    case "JSON":
      return "json";
    case "CSV":
      return "csv";
    case "SQL":
      return "sql";
    case "XML":
      return "xml";
    case "HTML":
      return "html";
    case "Javascript":
      return "js";
    case "Typescript":
      return "ts";
    case "PHP":
      return "php";
    case "Perl":
      return "pl";
    case "C#":
      return "cs";
    case "Ruby":
      return "rb";
    case "Python":
      return "py";
    default:
      return "txt";
  }
}

export default function DummyDataGeneratorPage() {
  const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(
    () => new Set<FieldKey>(["name", "email"])
  );
  const [format, setFormat] = useState<FormatKey>("JSON");
  const [rowsCount, setRowsCount] = useState<number>(25);
  const [tableName, setTableName] = useState<string>("dummy_data");
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const canGenerate = selectedFields.size > 0;

  const previewRows = useMemo(() => {
    const n = Math.min(5, clamp(rowsCount, 1, 500));
    return Array.from({ length: n }, () => genRow(selectedFields));
  }, [selectedFields, rowsCount]);

  function toggleField(k: FieldKey) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function generate() {
    setStatus("");
    if (!canGenerate) {
      setStatus("Select at least one data type.");
      return;
    }

    const n = clamp(rowsCount, 1, 500);
    const rows = Array.from({ length: n }, () => genRow(selectedFields));

    let out = "";
    if (format === "JSON") out = JSON.stringify(rows, null, 2);
    else if (format === "CSV") out = toCSV(rows);
    else if (format === "SQL") out = toSQL(rows, tableName || "dummy_data");
    else if (format === "XML") out = toXML(rows);
    else if (format === "HTML") out = toHTMLTable(rows);
    else out = toCodeObject(rows, format);

    setOutput(out);
    setStatus(`Generated ${n} rows as ${format}.`);

    trackUsageSafe("generate", { format, rows: n, fields: Array.from(selectedFields) });
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus("Copied to clipboard ✅");
    trackUsageSafe("copy", { format });
  }

  function download() {
    if (!output) return;
    const ext = fileExtFor(format);
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dummy-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    trackUsageSafe("download", { format });
  }

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>Dummy Data Generator</h1>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Generate realistic test data in JSON/CSV/SQL/XML/HTML and code-friendly formats.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* LEFT: FIELDS */}
        <section style={panel}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={stepCircle}>1</span>
            <h2 style={h2}>Choose the types of data you want</h2>
          </div>

          <div style={tileGrid}>
            {FIELD_DEFS.map((f) => {
              const active = selectedFields.has(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleField(f.key)}
                  style={{
                    ...tile,
                    background: active ? "#2b3f53" : "#2b3f53",
                    opacity: active ? 1 : 0.85,
                    outline: active ? "3px solid rgba(37, 99, 235, 0.55)" : "none",
                  }}
                  title={f.desc}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                    {active ? "Selected" : "Click to select"}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14, color: "#6b7280", fontSize: 13 }}>
            Tip: Enable <b>API Test Data</b> to include realistic fields like <code>id</code>, <code>endpoint</code>,{" "}
            <code>method</code>, <code>status</code>, <code>latency_ms</code>.
          </div>
        </section>

        {/* RIGHT: FORMAT */}
        <section style={panel}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={stepCircle}>2</span>
            <h2 style={h2}>Choose a data format</h2>
          </div>

          <div style={tileGrid}>
            {FORMAT_DEFS.map((f) => {
              const active = format === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFormat(f.key)}
                  style={{
                    ...tile,
                    background: active ? "#3a5a78" : "#2b3f53",
                    outline: active ? "3px solid rgba(37, 99, 235, 0.55)" : "none",
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{f.label}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <label style={label}>
              Rows (1–500)
              <input
                type="number"
                value={rowsCount}
                onChange={(e) => setRowsCount(Number(e.target.value))}
                min={1}
                max={500}
                style={input}
              />
            </label>

            <label style={label}>
              Table name (SQL only)
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="dummy_data"
                style={input}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={generate} style={primaryBtn} disabled={!canGenerate}>
              Generate
            </button>
            <button type="button" onClick={copy} style={btn} disabled={!output}>
              Copy
            </button>
            <button type="button" onClick={download} style={btn} disabled={!output}>
              Download
            </button>
          </div>

          {status && (
            <div style={{ marginTop: 12, fontSize: 13, color: status.includes("✅") ? "#166534" : "#374151" }}>
              {status}
            </div>
          )}
        </section>
      </div>

      {/* OUTPUT + PREVIEW */}
      <section style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={panel}>
          <h3 style={h3}>Preview (first 5 rows)</h3>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
            This is a small preview — click <b>Generate</b> for full output.
          </div>

          <pre style={pre}>
            {JSON.stringify(previewRows, null, 2)}
          </pre>
        </div>

        <div style={panel}>
          <h3 style={h3}>Output</h3>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
            Generated content in the selected format.
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Click Generate to create output…"
            style={{
              width: "100%",
              height: 360,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 12,
              background: "#fff",
            }}
          />
        </div>
      </section>
    </main>
  );
}

/* ---------------- styles ---------------- */

const panel: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 10px 25px rgba(2, 6, 23, 0.06)",
};

const stepCircle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  border: "2px solid #2563eb",
  color: "#2563eb",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 14,
};

const h2: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 900,
};

const h3: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
};

const tileGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
};

const tile: React.CSSProperties = {
  border: "0",
  borderRadius: 14,
  padding: 14,
  textAlign: "left",
  cursor: "pointer",
  minHeight: 96,
  boxShadow: "0 10px 18px rgba(2, 6, 23, 0.12)",
};

const label: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  color: "#374151",
  fontWeight: 700,
};

const input: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 10,
  outline: "none",
};

const btn: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  background: "white",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 800,
};

const primaryBtn: React.CSSProperties = {
  ...btn,
  background: "#2563eb",
  color: "white",
  border: "1px solid #2563eb",
};

const pre: React.CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#0b1220",
  color: "#e5e7eb",
  fontSize: 12,
  overflow: "auto",
  maxHeight: 360,
};
