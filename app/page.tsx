import ToolCard from "@/components/ToolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhatpat.com"),
  title: "Jhatpat — Free Online File Converters, PDF Tools, Diff Checkers & Generators",
  description:
    "Jhatpat is a fast, secure web utility platform for PDF tools (merge, split, compress, convert), data converters (CSV/JSON/Excel), diff checkers, and generators.",
  keywords: ["PDF merge", "PDF compress", "CSV to JSON", "Password generator", "URL shortener", "Dummy Data Generator", "CSV Diff", "Slug Generator"],
  openGraph: {
    title: "Jhatpat — Web Utilities (PDF, Converters, Diff, Generators)",
    description: "Free and secure web utilities for PDFs, data conversions, and more.",
    url: "https://jhatpat.com",
    siteName: "Jhatpat",
    type: "website"
  },
  alternates: { canonical: "https://jhatpat.com" },
};

const TAGS = [
  "#PDFMerge", "#PDFSplit", "#PDFCompress", "#ImageToPDF", "#WordToPDF", 
  "#PDFToWord", "#PDFToImage", "#CSVToJSON", "#JSONToCSV", "#CSVToExcel", 
  "#JSONToExcel", "#TextDiff", "#CSVDiff", "#Generators", "#PasswordGenerator", 
  "#GUIDGenerator", "#SlugGenerator", "#DummyData", "#TinyURL", "#URLShortener", 
  "#BoxShadow", "#FreeOnlineTools", "#WebUtilities"
];

export default function HomePage() {
  return (
    <main style={{ background: "#f7fafc", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <section
        style={{
          padding: "90px 24px",
          background: "radial-gradient(1200px circle at 20% 10%, #1d4ed8 0%, rgba(29,78,216,0.15) 35%, rgba(2,6,23,1) 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={pillBadge}>
            <span style={{ opacity: 0.95 }}>jhatpat.com</span>
            <span style={{ opacity: 0.65 }}>•</span>
            <span style={{ opacity: 0.9 }}>Fast • Secure • Free Utilities</span>
          </div>

          <h1 style={{ fontSize: 54, fontWeight: 900, marginTop: 18, lineHeight: 1.05 }}>
            Jhatpat Web Utilities
          </h1>
          <p style={{ marginTop: 14, fontSize: 18, opacity: 0.92, lineHeight: 1.6 }}>
            Convert and manage files instantly — PDF tools, data converters, diff checkers, and generators.
          </p>

          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#tools" style={primaryBtn}>Explore Tools</a>
            <a href="#tags" style={secondaryBtn}>Browse Capabilities</a>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ padding: "26px 24px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={trustGrid}>
          <TrustPill title="No signup required" desc="Start immediately" icon="⚡" />
          <TrustPill title="Privacy-first" desc="Secure processing" icon="🔒" />
          <TrustPill title="Fast results" desc="Quick workflows" icon="🚀" />
          <TrustPill title="Works everywhere" desc="Desktop & Mobile" icon="🌍" />
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section id="tools" style={{ padding: "50px 24px", maxWidth: 1160, margin: "0 auto" }}>
        
        <SectionHeader title="📄 PDF Utilities" subtitle="Professional PDF manipulation tools" />
        <div style={gridStyle}>
          <ToolCard title="Merge PDF" description="Combine multiple PDFs" href="/tools/pdf/merge" icon="🧩" />
          <ToolCard title="Split PDF" description="Split pages easily" href="/tools/pdf/split" icon="✂️" />
          <ToolCard title="Compress PDF" description="Reduce file size" href="/tools/pdf/compress" icon="🗜️" />
          <ToolCard title="PDF → Word" description="Editable DOCX" href="/tools/pdf/pdf-to-word" icon="📝" />
          <ToolCard title="Image → PDF" description="Images to PDF" href="/tools/pdf/image-to-pdf" icon="🖼️" />
          <ToolCard title="Word → PDF" description="DOCX to PDF" href="/tools/pdf/word-to-pdf" icon="📄" />
        </div>

        <SectionHeader title="📊 Data & Diff" subtitle="Compare files and convert data formats" />
        <div style={gridStyle}>
          <ToolCard title="CSV Diff" description="Compare two CSV files" href="/tools/csv-diff" icon="⚖️" />
          <ToolCard title="CSV → JSON" description="Structured JSON output" href="/tools/csv-to-json" icon="🔁" />
          <ToolCard title="JSON → CSV" description="Flat CSV export" href="/tools/json-to-csv" icon="📄" />
          <ToolCard title="CSV → Excel" description="Spreadsheet ready" href="/tools/csv-to-excel" icon="📊" />
        </div>

        <SectionHeader title="⚡ Generators" subtitle="Developer utilities for IDs, text, and styles" />
        <div style={gridStyle}>
          <ToolCard title="Dummy Data" description="Realistic test datasets" href="/tools/generators/dummy-data" icon="🧪" />
          <ToolCard title="Slug Generator" description="URL-friendly strings" href="/tools/generators/slug" icon="🐌" />
          <ToolCard title="Box Shadow" description="Visual CSS generator" href="/tools/generators/box-shadow" icon="🔳" />
          <ToolCard title="GUID Generator" description="Generate unique IDs" href="/tools/generators/guid" icon="🆔" />
          <ToolCard title="Password Generator" description="Secure passwords" href="/tools/generators/password" icon="🔐" />
          <ToolCard title="TinyURL" description="Shorten links" href="/tools/generators/tinyurl" icon="🔗" />
        </div>
      </section>

      {/* TAGS SECTION */}
      <section id="tags" style={{ padding: "10px 24px 70px", maxWidth: 1160, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900 }}>Capabilities</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          {TAGS.map((t) => (
            <span key={t} style={tagStyle}>{t}</span>
          ))}
        </div>
        <footer style={{ marginTop: 40, color: "#6b7280", fontSize: 13, textAlign: "center" }}>
          © {new Date().getFullYear()} Jhatpat. Privacy-first web utilities.
        </footer>
      </section>
    </main>
  );
}

/* ------------------ */
/* COMPONENTS */
/* ------------------ */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginTop: 52, marginBottom: 22 }}>
      <h2 style={{ fontSize: 30, fontWeight: 900 }}>{title}</h2>
      <p style={{ color: "#6b7280", marginTop: 8 }}>{subtitle}</p>
    </div>
  );
}

function TrustPill({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div style={pillStyle}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ------------------ */
/* STYLE OBJECTS */
/* ------------------ */

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 22,
};

const trustGrid: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 14,
};

const tagStyle: React.CSSProperties = {
  background: "#e0f2fe",
  border: "1px solid #bae6fd",
  color: "#075985",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 12,
};

const primaryBtn: React.CSSProperties = {
  background: "#2563eb",
  padding: "14px 22px",
  borderRadius: 14,
  color: "white",
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  padding: "14px 22px",
  borderRadius: 14,
  color: "white",
  fontWeight: 800,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.16)",
};

const pillBadge: React.CSSProperties = {
  display: "inline-flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  fontSize: 13,
  fontWeight: 700,
};

const pillStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  display: "flex",
  gap: 12,
  alignItems: "center",
};