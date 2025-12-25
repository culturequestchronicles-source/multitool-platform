import ToolCard from "@/components/ToolCard";

export default function HomePage() {
  return (
    <main style={{ background: "#f9fafb" }}>
      {/* HERO */}
      <section
        style={{
          padding: "90px 40px",
          background: "linear-gradient(135deg, #020617, #0f172a)",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-1px" }}>
          AI Conversion Agent
        </h1>
        <p style={{ marginTop: 18, fontSize: 20, opacity: 0.9 }}>
          Convert • Compare • Transform files & data instantly — powered by AI
        </p>

        <a
          href="#tools"
          style={{
            display: "inline-block",
            marginTop: 34,
            background: "#2563eb",
            padding: "16px 34px",
            borderRadius: 14,
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 16,
          }}
        >
          Explore Tools →
        </a>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ padding: 50, maxWidth: 1400, margin: "auto" }}>
        {/* PDF */}
        <SectionHeader
          title="📄 PDF Utilities"
          subtitle="Convert, compress, split and manipulate PDFs instantly"
        />

        <div style={grid}>
          <ToolCard title="Merge PDF" description="Combine multiple PDFs" href="/tools/pdf/merge" icon="🧩" />
          <ToolCard title="Split PDF" description="Split pages easily" href="/tools/pdf/split" icon="✂️" />
          <ToolCard title="Compress PDF" description="Reduce file size" href="/tools/pdf/compress" icon="🗜️" />
          <ToolCard title="Image → PDF" description="Images to PDF" href="/tools/pdf/image-to-pdf" icon="🖼️" />
          <ToolCard title="Word → PDF" description="DOCX to PDF" href="/tools/pdf/word-to-pdf" icon="📄" />
          <ToolCard title="PDF → Word" description="Editable Word file" href="/tools/pdf/pdf-to-word" icon="📝" />
          <ToolCard title="PDF → Image" description="Export images" href="/tools/pdf/pdf-to-image" icon="📷" />
        </div>

        {/* DATA */}
        <SectionHeader
          title="📊 Data Converters"
          subtitle="Powerful structured data transformations in seconds"
        />

        <div style={grid}>
          <ToolCard title="CSV → JSON" description="Structured JSON output" href="/tools/csv-to-json" icon="🔁" />
          <ToolCard title="JSON → CSV" description="Flat CSV export" href="/tools/json-to-csv" icon="📄" />
          <ToolCard title="CSV → Excel" description="Spreadsheet ready" href="/tools/csv-to-excel" icon="📊" />
          <ToolCard title="JSON → Excel" description="Excel friendly JSON" href="/tools/json-to-excel" icon="📈" />
        </div>

        {/* DIFF CHECKERS */}
        <SectionHeader
          title="🧮 Diff Checkers"
          subtitle="Compare files side-by-side and highlight changes visually"
        />

        <div style={grid}>
          <ToolCard
            title="CSV Diff Checker"
            description="Side-by-side CSV comparison"
            href="/tools/csv-diff"
            icon="🔍"
          />
          <ToolCard
            title="Excel Diff Checker"
            description="Detect spreadsheet differences"
            href="/tools/excel-diff"
            icon="📑"
          />
          <ToolCard
            title="Text / File Diff"
            description="Compare text & documents visually"
            href="/tools/diffchecker"
            icon="🆚"
          />
        </div>

        {/* AI */}
        <SectionHeader
          title="🤖 AI Conversions"
          subtitle="Convert any format to any format using AI intelligence"
        />

        <div style={grid}>
          <ToolCard
            title="Any → Any Converter"
            description="AI-powered universal conversion"
            href="/tools/ai-convert"
            icon="🧠"
          />
        </div>
      </section>
    </main>
  );
}

/* ---------------------------------- */
/* COMPONENTS */
/* ---------------------------------- */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h2 style={{ fontSize: 30, marginTop: 70 }}>{title}</h2>
      <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 16 }}>
        {subtitle}
      </p>
    </>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 24,
};
