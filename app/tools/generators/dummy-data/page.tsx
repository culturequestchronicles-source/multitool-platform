"use client";

import { useMemo, useState } from "react";

// --- Types & Constants ---
type FieldType = "Name" | "Phone" | "Email" | "Street Address" | "Postal/Zip" | "Region" | "Country" | "List" | "Word" | "Number" | "Currency" | "Alphanumeric";
type Format = "JSON" | "CSV" | "SQL" | "XML" | "HTML" | "JavaScript" | "TypeScript" | "PHP" | "Perl" | "C#" | "Ruby" | "Python" | "Word" | "PDF";

interface SchemaCol {
  id: string;
  name: string;
  type: FieldType;
}

type GeneratedRow = Record<string, string | number>;

const ALL_FIELDS: FieldType[] = ["Name", "Phone", "Email", "Street Address", "Postal/Zip", "Region", "Country", "List", "Word", "Number", "Currency", "Alphanumeric"];
const ALL_FORMATS: Format[] = ["JSON", "CSV", "SQL", "XML", "HTML", "JavaScript", "TypeScript", "PHP", "Perl", "C#", "Ruby", "Python", "Word", "PDF"];

const BLUE = {
  bg: "#0b1220",
  card: "#0f1a2e",
  card2: "#10203a",
  border: "rgba(148,163,184,0.20)",
  text: "#e5e7eb",
  sub: "rgba(226,232,240,0.75)",
  accent: "#2563eb",
  accent2: "#60a5fa",
};

// --- Helper Functions ---
const uid = () => Math.random().toString(36).substring(2, 9);
const safeKey = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");

const FIRST = ["Ava", "Liam", "Mia", "Noah", "Olivia", "Ethan", "Sophia", "Leo"];
const LAST = ["Patel", "Smith", "Johnson", "Lee", "Garcia", "Brown", "Khan", "Nguyen"];

function genValue(type: FieldType, i: number): string | number {
  switch (type) {
    case "Name": return `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
    case "Phone": return `555-01${(i % 90) + 10}`;
    case "Email": return `${safeKey(FIRST[i % FIRST.length])}${i}@example.com`;
    case "Number": return 1000 + i;
    case "Currency": return parseFloat((Math.random() * 1000).toFixed(2));
    case "Alphanumeric": return `ID-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;
    default: return `${type}_${i}`;
  }
}

// --- Formatting Engine ---
const formatters = {
  csv: (rows: GeneratedRow[]) => {
    if (!rows.length) return "";
    const keys = Object.keys(rows[0]);
    return [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => `"${r[k]}"`).join(",")),
    ].join("\n");
  },
  sql: (rows: GeneratedRow[], table = "dummy_data") => {
    if (!rows.length) return "";
    const keys = Object.keys(rows[0]);
    const values = rows
      .map((r) =>
        `(${keys
          .map((k) =>
            typeof r[k] === "number"
              ? r[k]
              : `'${String(r[k]).replace(/'/g, "''")}'`
          )
          .join(", ")})`
      )
      .join(",\n");
    return `INSERT INTO ${table} (${keys.join(", ")}) VALUES\n${values};`;
  },
  xml: (rows: GeneratedRow[]) => {
    const items = rows
      .map(
        (r) =>
          `  <item>\n${Object.entries(r)
            .map(([k, v]) => `    <${k}>${v}</${k}>`)
            .join("\n")}\n  </item>`
      )
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${items}\n</root>`;
  },
  php: (rows: GeneratedRow[]) =>
    `<?php\n$data = ${JSON.stringify(rows, null, 2)
      .replace(/\[/g, "array(")
      .replace(/\]/g, ")")};`,
  python: (rows: GeneratedRow[]) => `data = ${JSON.stringify(rows, null, 2)}`,
  ruby: (rows: GeneratedRow[]) => `require 'json'\ndata = JSON.parse('${JSON.stringify(rows)}')`,
};

export default function DummyDataGeneratorPage() {
  const [schema, setSchema] = useState<SchemaCol[]>(() => [
    { id: uid(), name: "id", type: "Alphanumeric" },
    { id: uid(), name: "full_name", type: "Name" },
  ]);
  const [rowsCount, setRowsCount] = useState(10);
  const [format, setFormat] = useState<Format>("JSON");
  const [output, setOutput] = useState("");
  const [apiMode, setApiMode] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.example.com/v1/data");

  const generatedData = useMemo(() => {
    return Array.from({ length: rowsCount }, (_, i) => {
      const row: GeneratedRow = {};
      schema.forEach((col) => {
        row[col.name] = genValue(col.type, i);
      });
      return row;
    });
  }, [schema, rowsCount]);

  const handleGenerate = () => {
    let result = "";
    switch (format) {
      case "CSV": result = formatters.csv(generatedData); break;
      case "SQL": result = formatters.sql(generatedData); break;
      case "XML": result = formatters.xml(generatedData); break;
      case "PHP": result = formatters.php(generatedData); break;
      case "Python": result = formatters.python(generatedData); break;
      case "Ruby": result = formatters.ruby(generatedData); break;
      default: result = JSON.stringify(generatedData, null, 2);
    }
    setOutput(result);
  };

  return (
    <main style={{ background: BLUE.bg, minHeight: "100vh", padding: 40, color: BLUE.text }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900 }}>Pro Dummy Data Generator</h1>
          <p style={{ color: BLUE.sub }}>Generate complex datasets and test API endpoints instantly.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          {/* Configuration Panel */}
          <section style={{ background: BLUE.card, padding: 24, borderRadius: 20, border: `1px solid ${BLUE.border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>1. Data Schema</h2>
            {schema.map((col, idx) => (
              <div key={col.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input 
                  value={col.name} 
                  onChange={(e) => {
                    const newSchema = [...schema];
                    newSchema[idx].name = safeKey(e.target.value);
                    setSchema(newSchema);
                  }}
                  style={{ flex: 1, background: BLUE.card2, color: "white", border: `1px solid ${BLUE.border}`, padding: "10px", borderRadius: 10 }}
                />
                <select 
                  value={col.type}
                  onChange={(e) => {
                    const newSchema = [...schema];
                    newSchema[idx].type = e.target.value as FieldType;
                    setSchema(newSchema);
                  }}
                  style={{ background: BLUE.card2, color: "white", border: `1px solid ${BLUE.border}`, padding: "10px", borderRadius: 10 }}
                >
                  {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button onClick={() => setSchema(schema.filter(s => s.id !== col.id))} style={{ color: "#ff4444", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button 
              onClick={() => setSchema([...schema, { id: uid(), name: "new_field", type: "Word" }])}
              style={{ width: "100%", padding: 10, borderRadius: 10, background: BLUE.card2, color: BLUE.accent2, border: `1px dashed ${BLUE.accent}`, cursor: "pointer", fontWeight: 700 }}
            >
              + Add Field
            </button>

            <div style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 15 }}>2. API Testing Mode</h2>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={apiMode} onChange={e => setApiMode(e.target.checked)} />
                <span>Enable POST request testing</span>
              </label>
              {apiMode && (
                <input 
                  value={apiEndpoint} 
                  onChange={e => setApiEndpoint(e.target.value)}
                  placeholder="https://your-api.com/endpoint"
                  style={{ width: "100%", marginTop: 10, background: BLUE.card2, color: "white", border: `1px solid ${BLUE.border}`, padding: "12px", borderRadius: 10 }}
                />
              )}
            </div>
          </section>

          {/* Export & Output Panel */}
          <section style={{ background: BLUE.card, padding: 24, borderRadius: 20, border: `1px solid ${BLUE.border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>3. Format & Export</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
              {ALL_FORMATS.slice(0, 12).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFormat(f)}
                  style={{ 
                    padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: format === f ? BLUE.accent : BLUE.card2,
                    color: "white", border: "none"
                  }}
                >{f}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: BLUE.sub }}>Rows</label>
                <input
                  type="number"
                  value={rowsCount}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setRowsCount(Number.isFinite(next) ? next : 0);
                  }}
                  style={{ width: "100%", background: BLUE.card2, color: "white", border: `1px solid ${BLUE.border}`, padding: "10px", borderRadius: 10 }}
                />
              </div>
              <button 
                onClick={handleGenerate}
                style={{ flex: 2, marginTop: 18, background: BLUE.accent, color: "white", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}
              >
                Generate & Format
              </button>
            </div>

            <textarea 
              value={output} 
              readOnly 
              placeholder="Output will appear here..."
              style={{ width: "100%", height: 300, background: "#071024", color: "#a5b4fc", padding: 15, borderRadius: 12, border: "none", fontFamily: "monospace", fontSize: 12 }}
            />

            {apiMode && output && (
              <div style={{ marginTop: 15, padding: 15, background: BLUE.card2, borderRadius: 12, border: `1px solid ${BLUE.accent}` }}>
                <p style={{ fontSize: 12, marginBottom: 8, fontWeight: 700 }}>cURL Command:</p>
                <code style={{ fontSize: 10, wordBreak: "break-all", color: BLUE.accent2 }}>
                  {`curl -X POST ${apiEndpoint} -H "Content-Type: application/json" -d '${JSON.stringify(generatedData[0] ?? {})}'`}
                </code>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
