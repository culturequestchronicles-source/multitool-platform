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
        <h1 style={{ fontSize: 52, fontWeight: 900 }}>AI Conversion Agent</h1>
        <p style={{ marginTop: 16, fontSize: 20, opacity: 0.9 }}>
          Convert, compare & transform files instantly — powered by AI
        </p>

        <a
          href="#tools"
          style={{
            display: "inline-block",
            marginTop: 36,
            background: "#2563eb",
            padding: "16px 34px",
            borderRadius: 14,
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 16,
          }}
        >
          Explore Tools
        </a>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ padding: 50 }}>
        {/* PDF UTILITIES */}
        <SectionHeader
          title="📄 PDF Utilities"
          subtitle="Convert, compress and manipulate PDFs instantly"
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

        {/* DATA CONVERTERS */}
        <SectionHeader
          title="📊 Data Converters"
          subtitle="Powerful data transformations in seconds"
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
          subtitle="Compare files side-by-side with visual differences"
        />

        <div style={grid}>
          <ToolCard
            title="Text Diff Checker"
            description="Compare text line-by-line"
            href="/tools/diffchecker"
            icon="📝"
          />
          <ToolCard
            title="CSV Diff Checker"
            description="Highlight row & column differences"
            href="/tools/csv-diff"
            icon="🔍"
          />
          <ToolCard
            title="Excel Diff Checker"
            description="Compare Excel sheets visually"
            href="/tools/excel-diff"
            icon="📊"
          />
        </div>

        {/* ✅ NEW: GENERATORS */}
        <SectionHeader
          title="⚡ Generators"
          subtitle="Generate IDs, passwords, CSS snippets, slugs, test data and more"
        />

        <div style={grid}>
          <ToolCard
            title="GUID Generator"
            description="Generate unique IDs for your data"
            href="/tools/generators/guid"
            icon="🆔"
          />
          <ToolCard
            title="Strong Password Generator"
            description="Create secure passwords instantly"
            href="/tools/generators/password"
            icon="🔐"
          />
          <ToolCard
            title="Box Shadow CSS Generator"
            description="Design and copy box-shadow CSS"
            href="/tools/generators/box-shadow"
            icon="🧊"
          />
          <ToolCard
            title="Slug Generator"
            description="SEO-friendly URL slugs in seconds"
            href="/tools/generators/slug"
            icon="🔗"
          />
          <ToolCard
            title="Dummy Data Generator"
            description="Generate realistic test data"
            href="/tools/generators/dummy-data"
            icon="🧪"
          />
          <ToolCard
  title="TinyURL Generator"
  description="Shorten links with reachability validation"
  href="/tools/generators/tinyurl"
  icon="🔗"
/>

          <ToolCard
            title="AI Prompts Generator"
            description="Create helpful prompt templates"
            href="/tools/generators/ai-prompts"
            icon="✨"
          />
          <ToolCard
            title="ChatGPT Prompt Generator"
            description="General-purpose prompt builder"
            href="/tools/generators/chatgpt-prompts"
            icon="💬"
          />
          <ToolCard
            title="Prompt Generator for Coders"
            description="Prompts for debugging & coding tasks"
            href="/tools/generators/coder-prompts"
            icon="🧑‍💻"
          />
          <ToolCard
            title="Safety Prompt Generator"
            description="Prompts that add guardrails & clarity"
            href="/tools/generators/safety-prompts"
            icon="🛡️"
          />
        </div>

        {/* AI */}
        <SectionHeader
          title="🤖 AI Conversions"
          subtitle="Convert any format to any format using AI"
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

/* ------------------ */
/* SHARED COMPONENTS */
/* ------------------ */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h2 style={{ fontSize: 30, marginTop: 60 }}>{title}</h2>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>{subtitle}</p>
    </>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 22,
};
