import ToolCard from "@/components/ToolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhatpat.com"),
  title: "Jhatpat — Free Online File Converters, PDF Tools, Diff Checkers & Generators",
  description:
    "Jhatpat is a fast, secure web utility platform for PDF tools (merge, split, compress, convert), data converters (CSV/JSON/Excel), diff checkers, and generators like passwords, GUIDs, slugs, dummy data and TinyURL.",
  keywords: [
    "PDF merge",
    "PDF split",
    "PDF compress",
    "image to PDF",
    "word to PDF",
    "PDF to word",
    "PDF to image",
    "CSV to JSON",
    "JSON to CSV",
    "CSV to Excel",
    "JSON to Excel",
    "CSV diff",
    "text diff checker",
    "file converter",
    "web utilities",
    "password generator",
    "GUID generator",
    "slug generator",
    "dummy data generator",
    "tinyurl generator",
    "URL shortener",
    "secure link shortener",
    "online tools",
    "free online tools"
  ],
  openGraph: {
    title: "Jhatpat — Web Utilities (PDF, Converters, Diff, Generators)",
    description:
      "Free and secure web utilities for PDFs, data conversions, diff checking, and generators (passwords, GUIDs, slugs, dummy data, TinyURL).",
    url: "https://jhatpat.com",
    siteName: "Jhatpat",
    type: "website"
  },
  alternates: { canonical: "https://jhatpat.com" },
};

const TAGS = [
  "#PDFMerge",
  "#PDFSplit",
  "#PDFCompress",
  "#ImageToPDF",
  "#WordToPDF",
  "#PDFToWord",
  "#PDFToImage",
  "#CSVToJSON",
  "#JSONToCSV",
  "#CSVToExcel",
  "#JSONToExcel",
  "#TextDiff",
  "#CSVDiff",
  "#Generators",
  "#PasswordGenerator",
  "#GUIDGenerator",
  "#SlugGenerator",
  "#DummyData",
  "#TinyURL",
  "#URLShortener",
  "#FreeOnlineTools",
  "#WebUtilities"
];

export default function HomePage() {
  return (
    <main style={{ background: "#f7fafc" }}>
      {/* HERO */}
      <section
        style={{
          padding: "90px 24px",
          background:
            "radial-gradient(1200px circle at 20% 10%, #1d4ed8 0%, rgba(29,78,216,0.15) 35%, rgba(2,6,23,1) 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            <span style={{ opacity: 0.95 }}>jhatpat.com</span>
            <span style={{ opacity: 0.65 }}>•</span>
            <span style={{ opacity: 0.9 }}>Fast • Secure • Free Utilities</span>
          </div>

          <h1 style={{ fontSize: 54, fontWeight: 900, marginTop: 18, lineHeight: 1.05 }}>
            Jhatpat Web Utilities
          </h1>
          <p style={{ marginTop: 14, fontSize: 18, opacity: 0.92, lineHeight: 1.6 }}>
            Convert and manage files instantly — PDF tools, data converters, diff checkers, and generators.
            Built for speed, privacy and productivity.
          </p>

          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#tools"
              style={{
                background: "#2563eb",
                padding: "14px 22px",
                borderRadius: 14,
                color: "white",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Explore Tools
            </a>
            <a
              href="#tags"
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "14px 22px",
                borderRadius: 14,
                color: "white",
                fontWeight: 800,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              Browse Capabilities
            </a>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ padding: "26px 24px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <TrustPill title="No signup required" desc="Start converting immediately" icon="⚡" />
          <TrustPill title="Privacy-first" desc="Process files without storing" icon="🔒" />
          <TrustPill title="Fast results" desc="Optimized for quick workflows" icon="🚀" />
          <TrustPill title="Works everywhere" desc="Windows • Mac • Mobile" icon="🌍" />
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ padding: 50, maxWidth: 1160, margin: "0 auto" }}>
        <SectionHeader title="📄 PDF Utilities" subtitle="Merge, split, compress and convert PDFs in seconds" />
        <div style={grid}>
          <ToolCard title="Merge PDF" description="Combine multiple PDFs" href="/tools/pdf/merge" icon="🧩" />
          <ToolCard title="Split PDF" description="Split pages easily" href="/tools/pdf/split" icon="✂️" />
          <ToolCard title="Compress PDF" description="Reduce file size" href="/tools/pdf/compress" icon="🗜️" />
          <ToolCard title="Image → PDF" description="Images to PDF" href="/tools/pdf/image-to-pdf" icon="🖼️" />
          <ToolCard title="Word → PDF" description="DOCX to PDF" href="/tools/pdf/word-to-pdf" icon="📄" />
          <ToolCard title="PDF → Word" description="Editable Word file" href="/tools/pdf/pdf-to-word" icon="📝" />
          <ToolCard title="PDF → Image" description="Export images" href="/tools/pdf/pdf-to-image" icon="📷" />
        </div>

        <SectionHeader title="📊 Data Converters" subtitle="Convert CSV/JSON/Excel reliably — perfect for engineers & analysts" />
        <div style={grid}>
          <ToolCard title="CSV → JSON" description="Structured JSON output" href="/tools/csv-to-json" icon="🔁" />
          <ToolCard title="JSON → CSV" description="Flat CSV export" href="/tools/json-to-csv" icon="📄" />
          <ToolCard title="CSV → Excel" description="Spreadsheet ready" href="/tools/csv-to-excel" icon="📊" />
          <ToolCard title="JSON → Excel" description="Excel friendly JSON" href="/tools/json-to-excel" icon="📈" />
        </div>

        <SectionHeader title="🧮 Diff Checkers" subtitle="Compare text and files side-by-side with visual differences" />
        <div style={grid}>
          <ToolCard title="Text Diff Checker" description="Compare text line-by-line" href="/tools/diffchecker" icon="📝" />
          <ToolCard title="CSV Diff Checker" description="Highlight row & column differences" href="/tools/csv-diff" icon="🔍" />
          {/* Excel diff checker commented out as requested */}
          {/*
          <ToolCard
            title="Excel Diff Checker"
            description="Compare Excel sheets visually"
            href="/tools/excel-diff"
            icon="📊"
          />
          */}
        </div>

        <SectionHeader title="⚡ Generators" subtitle="Generate passwords, GUIDs, slugs, dummy data and secure short links" />
        <div style={grid}>
          <ToolCard title="GUID Generator" description="Generate unique IDs for your data" href="/tools/generators/guid" icon="🆔" />
          <ToolCard title="Strong Password Generator" description="Create secure passwords instantly" href="/tools/generators/password" icon="🔐" />
          <ToolCard title="Box Shadow CSS Generator" description="Design and copy box-shadow CSS" href="/tools/generators/box-shadow" icon="🧊" />
          <ToolCard title="Slug Generator" description="SEO-friendly URL slugs" href="/tools/generators/slug" icon="🔗" />
          <ToolCard title="Dummy Data Generator" description="Generate realistic test data" href="/tools/generators/dummy-data" icon="🧪" />
          <ToolCard title="TinyURL Generator" description="Shorten links securely" href="/tools/generators/tinyurl" icon="🔗" />
          {/* Prompt generators commented out as requested */}
          {/*
          <ToolCard title="AI Prompts Generator" description="Create helpful prompt templates" href="/tools/generators/ai-prompts" icon="✨" />
          <ToolCard title="ChatGPT Prompt Generator" description="Prompt builder" href="/tools/generators/chatgpt-prompts" icon="💬" />
          <ToolCard title="Prompt Generator for Coders" description="Prompts for coding tasks" href="/tools/generators/coder-prompts" icon="🧑‍💻" />
          <ToolCard title="Safety Prompt Generator" description="Prompts with guardrails" href="/tools/generators/safety-prompts" icon="🛡️" />
          */}
        </div>

        {/* AI conversions section commented out as requested */}
        {/*
        <SectionHeader title="🤖 AI Conversions" subtitle="Convert any format to any format" />
        <div style={grid}>
          <ToolCard title="Any → Any Converter" description="Universal conversion" href="/tools/ai-convert" icon="🧠" />
        </div>
        */}
      </section>

      {/* TAGS / HASHTAGS */}
      <section id="tags" style={{ padding: "10px 24px 70px", maxWidth: 1160, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900 }}>Capabilities</h2>
        <p style={{ color: "#6b7280", marginTop: 6, marginBottom: 14 }}>
          Search-friendly tags describing what Jhatpat can do.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {TAGS.map((t) => (
            <span
              key={t}
              style={{
                background: "#e0f2fe",
                border: "1px solid #bae6fd",
                color: "#075985",
                padding: "8px 12px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: 0.2,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <footer style={{ marginTop: 26, color: "#6b7280", fontSize: 13 }}>
          © {new Date().getFullYear()} Jhatpat. Tools designed for fast workflows and privacy-first conversions.
        </footer>
      </section>
    </main>
  );
}

/* ------------------ */
/* SHARED COMPONENTS */
/* ------------------ */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginTop: 52 }}>
      <h2 style={{ fontSize: 30, fontWeight: 900 }}>{title}</h2>
      <p style={{ color: "#6b7280", marginBottom: 22, marginTop: 8 }}>{subtitle}</p>
    </div>
  );
}

function TrustPill({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{desc}</div>
      </div>
    </div>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 22,
};
