"use client";

import { useMemo, useState } from "react";

type FieldType =
  | "Name"
  | "Phone"
  | "Email"
  | "Street Address"
  | "Postal/Zip"
  | "Region"
  | "Country"
  | "List"
  | "Word"
  | "Number"
  | "Currency"
  | "Alphanumeric";

type Format =
  | "JSON"
  | "CSV"
  | "SQL"
  | "XML"
  | "HTML"
  | "JavaScript"
  | "TypeScript"
  | "PHP"
  | "Perl"
  | "C#"
  | "Ruby"
  | "Python"
  | "Word"
  | "PDF";

type SchemaCol = {
  id: string;
  name: string;
  type: FieldType;
};

type TemplateKey = "User Profile" | "API Logs" | "Ecommerce" | "HR";

const ALL_FIELDS: FieldType[] = [
  "Name",
  "Phone",
  "Email",
  "Street Address",
  "Postal/Zip",
  "Region",
  "Country",
  "List",
  "Word",
  "Number",
  "Currency",
  "Alphanumeric",
];

const ALL_FORMATS: Format[] = [
  "JSON",
  "CSV",
  "SQL",
  "XML",
  "HTML",
  "JavaScript",
  "TypeScript",
  "PHP",
  "Perl",
  "C#",
  "Ruby",
  "Python",
  "Word",
  "PDF",
];

const BLUE = {
  bg: "#0b1220",
  card: "#0f1a2e",
  card2: "#10203a",
  border: "rgba(148,163,184,0.20)",
  text: "#e5e7eb",
  sub: "rgba(226,232,240,0.75)",
  accent: "#2563eb",
  accent2: "#60a5fa",
  good: "#22c55e",
  warn: "#f59e0b",
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeKey(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

// ------------------ Random helpers (simple + deterministic enough) ------------------
const FIRST = ["Ava", "Liam", "Mia", "Noah", "Olivia", "Ethan", "Sophia", "Aria", "Leo", "Emma"];
const LAST = ["Patel", "Smith", "Johnson", "Lee", "Garcia", "Brown", "Khan", "Nguyen", "Davis", "Martinez"];
const STREET = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "2nd St", "Sunset Blvd", "Lakeview Ct"];
const CITY = ["Austin", "Seattle", "Chicago", "Boston", "Denver", "Miami", "Phoenix", "Atlanta", "Dallas", "Portland"];
const REGION = ["CA", "TX", "NY", "FL", "WA", "IL", "MA", "CO", "AZ", "GA"];
const COUNTRY = ["US", "CA", "UK", "IN", "AU", "DE", "FR", "BR", "MX", "JP"];
const WORDS = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "gamma", "sigma", "lambda", "omega"];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]) {
  return arr[randInt(0, arr.length - 1)];
}
function randAlphaNum(len: number) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[randInt(0, chars.length - 1)];
  return out;
}
function randMoney() {
  const v = (Math.random() * 5000 + 10).toFixed(2);
  return Number(v);
}
function randPhone() {
  return `(${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`;
}
function randEmail(name: string) {
  const domains = ["example.com", "mail.com", "demo.io", "test.dev"];
  return `${safeKey(name)}${randInt(1, 999)}@${pick(domains)}`;
}
function randAddress() {
  return `${randInt(100, 9999)} ${pick(STREET)}, ${pick(CITY)}, ${pick(REGION)} ${randInt(10000, 99999)}`;
}
function randPostal() {
  return `${randInt(10000, 99999)}`;
}
function randList() {
  const list = ["basic", "pro", "enterprise", "trial", "active", "disabled", "pending"];
  return pick(list);
}
function randWord() {
  return pick(WORDS);
}

function genValue(type: FieldType, rowIndex: number) {
  switch (type) {
    case "Name": {
      const full = `${pick(FIRST)} ${pick(LAST)}`;
      return full;
    }
    case "Phone":
      return randPhone();
    case "Email": {
      const full = `${pick(FIRST)} ${pick(LAST)}`;
      return randEmail(full);
    }
    case "Street Address":
      return randAddress();
    case "Postal/Zip":
      return randPostal();
    case "Region":
      return pick(REGION);
    case "Country":
      return pick(COUNTRY);
    case "List":
      return randList();
    case "Word":
      return randWord();
    case "Number":
      return randInt(1, 100000) + rowIndex;
    case "Currency":
      return randMoney();
    case "Alphanumeric":
      return randAlphaNum(10);
    default:
      return "";
  }
}

// ------------------ Preset templates ------------------
function templateSchema(t: TemplateKey): SchemaCol[] {
  const make = (name: string, type: FieldType): SchemaCol => ({ id: uid(), name, type });

  if (t === "User Profile") {
    return [
      make("id", "Alphanumeric"),
      make("name", "Name"),
      make("email", "Email"),
      make("phone", "Phone"),
      make("address", "Street Address"),
      make("country", "Country"),
    ];
  }
  if (t === "API Logs") {
    return [
      make("request_id", "Alphanumeric"),
      make("user", "Email"),
      make("endpoint", "Word"),
      make("status_code", "Number"),
      make("latency_ms", "Number"),
      make("region", "Region"),
    ];
  }
  if (t === "Ecommerce") {
    return [
      make("order_id", "Alphanumeric"),
      make("customer", "Name"),
      make("email", "Email"),
      make("sku", "Alphanumeric"),
      make("qty", "Number"),
      make("price", "Currency"),
      make("ship_to", "Street Address"),
    ];
  }
  // HR
  return [
    make("employee_id", "Alphanumeric"),
    make("name", "Name"),
    make("email", "Email"),
    make("country", "Country"),
    make("department", "Word"),
    make("salary", "Currency"),
  ];
}

// ------------------ Formatters ------------------
function escapeCsv(v: any) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCSV(rows: Record<string, any>[]) {
  const keys = Object.keys(rows[0] || {});
  const head = keys.join(",");
  const lines = rows.map((r) => keys.map((k) => escapeCsv(r[k])).join(","));
  return [head, ...lines].join("\n");
}

function toSQL(rows: Record<string, any>[], tableName: string) {
  const keys = Object.keys(rows[0] || {});
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const values = rows
    .map((r) => {
      const vs = keys
        .map((k) => {
          const v = r[k];
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "number") return String(v);
          return `'${String(v).replace(/'/g, "''")}'`;
        })
        .join(", ");
      return `(${vs})`;
    })
    .join(",\n");
  return `INSERT INTO "${tableName}" (${cols}) VALUES\n${values};`;
}

function toXML(rows: Record<string, any>[], rootName: string, itemName: string) {
  const esc = (s: any) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = rows
    .map((r) => {
      const fields = Object.entries(r)
        .map(([k, v]) => `    <${k}>${esc(v)}</${k}>`)
        .join("\n");
      return `  <${itemName}>\n${fields}\n  </${itemName}>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${items}\n</${rootName}>\n`;
}

function toHTMLTable(rows: Record<string, any>[]) {
  const keys = Object.keys(rows[0] || {});
  const esc = (s: any) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const thead = `<tr>${keys.map((k) => `<th>${esc(k)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((r) => `<tr>${keys.map((k) => `<td>${esc(r[k])}</td>`).join("")}</tr>`)
    .join("\n");

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Dummy Data</title></head>
<body>
<table border="1" cellpadding="6" cellspacing="0">
<thead>${thead}</thead>
<tbody>
${tbody}
</tbody>
</table>
</body>
</html>`;
}

function toJS(rows: Record<string, any>[], kind: "js" | "ts") {
  const json = JSON.stringify(rows, null, 2);
  const type = kind === "ts" ? ": any[]" : "";
  return `export const data${type} = ${json};\n`;
}

function toPHP(rows: Record<string, any>[]) {
  const json = JSON.stringify(rows, null, 2);
  return `<?php\n$data = json_decode('${json.replace(/'/g, "\\'")}', true);\nprint_r($data);\n`;
}

function toPython(rows: Record<string, any>[]) {
  const json = JSON.stringify(rows, null, 2);
  return `import json\n\ndata = json.loads(r'''${json}''')\nprint(data)\n`;
}

function toRuby(rows: Record<string, any>[]) {
  const json = JSON.stringify(rows, null, 2);
  return `require "json"\n\ndata = JSON.parse(%q|${json}|\n)\nputs data\n`;
}

function toPerl(rows: Record<string, any>[]) {
  const json = JSON.stringify(rows, null, 2);
  return `use JSON;\nmy $json = q|${json}|;\nmy $data = decode_json($json);\nprint encode_json($data);\n`;
}

function toCSharp(rows: Record<string, any>[]) {
  const json = JSON.stringify(rows, null, 2);
  return `using System;\n\n// Paste JSON into your app\nstring json = @\"${json.replace(/"/g, '""')}\";\nConsole.WriteLine(json);\n`;
}

function toWordText(rows: Record<string, any>[]) {
  // Lightweight: provide a nice plain text body (download as .doc)
  const keys = Object.keys(rows[0] || {});
  const lines = rows.map((r, idx) => {
    const items = keys.map((k) => `${k}: ${r[k]}`).join(" | ");
    return `${idx + 1}. ${items}`;
  });
  return `Dummy Data\n\n${lines.join("\n")}\n`;
}

function toPDFText(rows: Record<string, any>[]) {
  // Lightweight: we will download a .txt with .pdf extension is NOT valid.
  // Instead, we generate a minimal HTML and let user download .html for print-to-pdf,
  // OR just provide a printable HTML string and download as .html.
  // We'll download HTML but label it as "dummy-data.pdf.html" to be honest.
  return toHTMLTable(rows);
}

// ------------------ Main component ------------------
export default function DummyDataGeneratorPage() {
  // selections
  const [fieldSearch, setFieldSearch] = useState("");
  const [selectedFields, setSelectedFields] = useState<FieldType[]>(["Name", "Email", "Phone"]);
  const [format, setFormat] = useState<Format>("JSON");
  const [rowsCount, setRowsCount] = useState(25);
  const [template, setTemplate] = useState<TemplateKey>("User Profile");
  const [useTemplate, setUseTemplate] = useState(true);

  // schema editor
  const [schemaCols, setSchemaCols] = useState<SchemaCol[]>(templateSchema("User Profile"));

  // api test mode
  const [apiTestMode, setApiTestMode] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.example.com/v1/events");
  const [apiMethod, setApiMethod] = useState<"POST" | "PUT">("POST");

  // output
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");

  const filteredFields = useMemo(() => {
    const q = fieldSearch.trim().toLowerCase();
    if (!q) return ALL_FIELDS;
    return ALL_FIELDS.filter((f) => f.toLowerCase().includes(q));
  }, [fieldSearch]);

  const activeSchema = useMemo(() => {
    if (useTemplate) return schemaCols;
    // build schema from selected fields (auto col names)
    return selectedFields.map((f) => ({ id: uid(), name: safeKey(f), type: f }));
  }, [useTemplate, schemaCols, selectedFields]);

  const previewRows = useMemo(() => {
    const cols = activeSchema;
    const count = Math.max(1, Math.min(5000, rowsCount)); // safety
    const rows: Record<string, any>[] = [];

    for (let i = 0; i < count; i++) {
      const r: Record<string, any> = {};
      for (const c of cols) {
        r[c.name || safeKey(c.type)] = genValue(c.type, i);
      }
      rows.push(r);
    }
    return rows;
  }, [activeSchema, rowsCount]);

  const outputText = useMemo(() => {
    if (!previewRows.length) return "";

    if (format === "JSON") return JSON.stringify(previewRows, null, 2);
    if (format === "CSV") return toCSV(previewRows);
    if (format === "SQL") return toSQL(previewRows, "dummy_table");
    if (format === "XML") return toXML(previewRows, "items", "item");
    if (format === "HTML") return toHTMLTable(previewRows);
    if (format === "JavaScript") return toJS(previewRows, "js");
    if (format === "TypeScript") return toJS(previewRows, "ts");
    if (format === "PHP") return toPHP(previewRows);
    if (format === "Python") return toPython(previewRows);
    if (format === "Ruby") return toRuby(previewRows);
    if (format === "Perl") return toPerl(previewRows);
    if (format === "C#") return toCSharp(previewRows);
    if (format === "Word") return toWordText(previewRows);
    if (format === "PDF") return toPDFText(previewRows);

    return JSON.stringify(previewRows, null, 2);
  }, [format, previewRows]);

  function toggleField(f: FieldType) {
    setSelectedFields((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function applyTemplate(t: TemplateKey) {
    setTemplate(t);
    setSchemaCols(templateSchema(t));
  }

  function addCol() {
    setSchemaCols((prev) => [...prev, { id: uid(), name: "new_field", type: "Word" }]);
  }

  function removeCol(id: string) {
    setSchemaCols((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCol(id: string, patch: Partial<SchemaCol>) {
    setSchemaCols((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function generate() {
    setOutput(outputText);
    setStatus("Generated ✅");
  }

  async function copy() {
    if (!output) {
      setStatus("Generate first");
      return;
    }
    await navigator.clipboard.writeText(output);
    setStatus("Copied to clipboard ✅");
  }

  function download() {
    if (!output) {
      setStatus("Generate first");
      return;
    }

    let ext = "txt";
    let mime = "text/plain";

    if (format === "JSON") { ext = "json"; mime = "application/json"; }
    else if (format === "CSV") { ext = "csv"; mime = "text/csv"; }
    else if (format === "SQL") { ext = "sql"; mime = "text/plain"; }
    else if (format === "XML") { ext = "xml"; mime = "application/xml"; }
    else if (format === "HTML") { ext = "html"; mime = "text/html"; }
    else if (format === "JavaScript") { ext = "js"; mime = "application/javascript"; }
    else if (format === "TypeScript") { ext = "ts"; mime = "text/plain"; }
    else if (format === "PHP") { ext = "php"; mime = "text/plain"; }
    else if (format === "Perl") { ext = "pl"; mime = "text/plain"; }
    else if (format === "C#") { ext = "cs"; mime = "text/plain"; }
    else if (format === "Ruby") { ext = "rb"; mime = "text/plain"; }
    else if (format === "Python") { ext = "py"; mime = "text/plain"; }
    else if (format === "Word") { ext = "doc"; mime = "application/msword"; }
    else if (format === "PDF") { ext = "pdf.html"; mime = "text/html"; } // honest output

    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dummy-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);

    setStatus("Downloaded ✅");
  }

  const apiArtifacts = useMemo(() => {
    if (!apiTestMode) return null;
    const payload = previewRows.slice(0, Math.min(5, previewRows.length));
    const json = JSON.stringify(payload, null, 2);

    const curl = `curl -X ${apiMethod} "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${json.replace(/'/g, "'\\''")}'`;

    return { json, curl };
  }, [apiTestMode, previewRows, apiEndpoint, apiMethod]);

  return (
    <main style={{ background: BLUE.bg, minHeight: "100vh", padding: 30, color: BLUE.text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${BLUE.accent}, ${BLUE.accent2})`,
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              color: "white",
            }}
          >
            🧪
          </div>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>Dummy Data Generator</h1>
            <p style={{ margin: "6px 0 0", color: BLUE.sub }}>
              Generate realistic test data with templates, schema editor, and multiple export formats.
            </p>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* LEFT: Builders */}
          <section style={{ background: BLUE.card, border: `1px solid ${BLUE.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 800, color: "white" }}>1) Choose the types of data you want</div>
              <input
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                placeholder="Search fields…"
                style={{
                  marginLeft: "auto",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${BLUE.border}`,
                  background: BLUE.card2,
                  color: BLUE.text,
                  width: 260,
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 14 }}>
              {filteredFields.map((f) => {
                const active = selectedFields.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggleField(f)}
                    style={{
                      padding: "18px 12px",
                      borderRadius: 14,
                      border: `1px solid ${BLUE.border}`,
                      background: active ? `linear-gradient(180deg, ${BLUE.accent}, #1d4ed8)` : BLUE.card2,
                      color: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                      minHeight: 84,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Templates + Schema */}
            <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 900 }}>Preset templates</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: BLUE.sub }}>
                <input type="checkbox" checked={useTemplate} onChange={(e) => setUseTemplate(e.target.checked)} />
                Use schema editor
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {(["User Profile", "API Logs", "Ecommerce", "HR"] as TemplateKey[]).map((t) => {
                const active = template === t;
                return (
                  <button
                    key={t}
                    onClick={() => applyTemplate(t)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${BLUE.border}`,
                      background: active ? BLUE.accent : BLUE.card2,
                      color: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Schema editor */}
            {useTemplate && (
              <div style={{ marginTop: 14, background: BLUE.card2, border: `1px solid ${BLUE.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 900 }}>Schema editor</div>
                  <button
                    onClick={addCol}
                    style={{
                      background: BLUE.accent,
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 12px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    + Add column
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {schemaCols.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr auto",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={c.name}
                        onChange={(e) => updateCol(c.id, { name: safeKey(e.target.value) })}
                        placeholder="column_name"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: `1px solid ${BLUE.border}`,
                          background: BLUE.card,
                          color: BLUE.text,
                        }}
                      />
                      <select
                        value={c.type}
                        onChange={(e) => updateCol(c.id, { type: e.target.value as FieldType })}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: `1px solid ${BLUE.border}`,
                          background: BLUE.card,
                          color: BLUE.text,
                        }}
                      >
                        {ALL_FIELDS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeCol(c.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: `1px solid ${BLUE.border}`,
                          background: "transparent",
                          color: "#fca5a5",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
              <label style={{ color: BLUE.sub, fontWeight: 700 }}>
                Rows{" "}
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={rowsCount}
                  onChange={(e) => setRowsCount(Number(e.target.value))}
                  style={{
                    width: 110,
                    marginLeft: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${BLUE.border}`,
                    background: BLUE.card2,
                    color: BLUE.text,
                  }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, color: BLUE.sub, fontWeight: 700 }}>
                <input type="checkbox" checked={apiTestMode} onChange={(e) => setApiTestMode(e.target.checked)} />
                API test data
              </label>

              <button
                onClick={generate}
                style={{
                  marginLeft: "auto",
                  background: `linear-gradient(135deg, ${BLUE.accent}, ${BLUE.accent2})`,
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Generate
              </button>
            </div>

            {apiTestMode && (
              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, alignItems: "center" }}>
                  <div style={{ color: BLUE.sub, fontWeight: 800 }}>Endpoint</div>
                  <input
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${BLUE.border}`,
                      background: BLUE.card2,
                      color: BLUE.text,
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, alignItems: "center" }}>
                  <div style={{ color: BLUE.sub, fontWeight: 800 }}>Method</div>
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value as any)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${BLUE.border}`,
                      background: BLUE.card2,
                      color: BLUE.text,
                      width: 160,
                    }}
                  >
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT: Formats + Output */}
          <section style={{ background: BLUE.card, border: `1px solid ${BLUE.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>2) Choose a data format</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {ALL_FORMATS.map((f) => {
                const active = format === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{
                      padding: "18px 12px",
                      borderRadius: 14,
                      border: `1px solid ${BLUE.border}`,
                      background: active ? `linear-gradient(180deg, ${BLUE.accent}, #1d4ed8)` : BLUE.card2,
                      color: "white",
                      fontWeight: 900,
                      cursor: "pointer",
                      minHeight: 84,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={copy}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${BLUE.border}`,
                  background: BLUE.card2,
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Copy
              </button>

              <button
                onClick={download}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${BLUE.border}`,
                  background: BLUE.card2,
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Download
              </button>

              <div style={{ marginLeft: "auto", color: BLUE.sub, fontWeight: 800 }}>
                {status}
              </div>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder="Click Generate to produce output…"
              style={{
                marginTop: 14,
                width: "100%",
                height: 360,
                padding: 14,
                borderRadius: 14,
                border: `1px solid ${BLUE.border}`,
                background: "#071024",
                color: "white",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
              }}
            />

            {apiArtifacts && (
              <div style={{ marginTop: 14, background: BLUE.card2, border: `1px solid ${BLUE.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>API test artifacts</div>
                <div style={{ color: BLUE.sub, fontWeight: 800, marginBottom: 6 }}>Sample payload (JSON)</div>
                <pre style={{ whiteSpace: "pre-wrap", color: "white", fontSize: 12, margin: 0 }}>
                  {apiArtifacts.json}
                </pre>
                <div style={{ color: BLUE.sub, fontWeight: 800, margin: "12px 0 6px" }}>cURL</div>
                <pre style={{ whiteSpace: "pre-wrap", color: "white", fontSize: 12, margin: 0 }}>
                  {apiArtifacts.curl}
                </pre>
              </div>
            )}

            {format === "PDF" && (
              <p style={{ marginTop: 10, color: BLUE.sub, fontSize: 12 }}>
                PDF output downloads as <b>HTML</b> (print-to-PDF). This keeps it reliable without server dependencies.
              </p>
            )}
          </section>
        </div>

        <footer style={{ marginTop: 18, color: BLUE.sub, fontSize: 12 }}>
          Tip: Use “Preset templates” + “Schema editor” to define exact columns, then export in any format.
        </footer>
      </div>
    </main>
  );
}
