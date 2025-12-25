import ToolCard from "@/components/ToolCard";

export default function HomePage() {
  return (
    <main style={{ background: "#f9fafb" }}>
      {/* HERO */}
      <section
        style={{
          padding: "80px 40px",
          background:
            "linear-gradient(135deg, #0f172a, #020617)",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 48, fontWeight: 800 }}>
          AI Conversion Agent
        </h1>
        <p style={{ marginTop: 16, fontSize: 18, opacity: 0.9 }}>
          Convert files, data & documents instantly — powered by AI
        </p>

        <a
          href="#tools"
          style={{
            display: "inline-block",
            marginTop: 30,
            background: "#2563eb",
            padding: "14px 28px",
            borderRadius: 12,
            color: "white",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Get Started
        </a>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ padding: 40 }}>
        {/* PDF */}
        <h2 style={{ fontSize: 28 }}>📄 PDF Utilities</h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>
          Convert, compress and manipulate PDFs instantly
        </p>

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
        <h2 style={{ fontSize: 28, marginTop: 60 }}>
          📊 Data Converters
        </h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>
          Powerful data transformations in seconds
        </p>

        <div style={grid}>
          <ToolCard title="CSV → JSON" description="Structured JSON output" href="/tools/csv-to-json" icon="🔁" />
          <ToolCard title="JSON → CSV" description="Flat CSV export" href="/tools/json-to-csv" icon="📄" />
          <ToolCard title="CSV → Excel" description="Spreadsheet ready" href="/tools/csv-to-excel" icon="📊" />
          <ToolCard title="JSON → Excel" description="Excel friendly JSON" href="/tools/json-to-excel" icon="📈" />
          <ToolCard title="CSV Diff" description="Compare CSV files" href="/tools/csv-diff" icon="🔍" />
        </div>

        {/* AI */}
        <h2 style={{ fontSize: 28, marginTop: 60 }}>
          🤖 AI Conversions
        </h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>
          Convert any format to any format using AI
        </p>

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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 20,
};
