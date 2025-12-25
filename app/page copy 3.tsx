import Link from "next/link";

const pdfTools = [
  { name: "Merge PDF", href: "/tools/pdf/merge" },
  { name: "Split PDF", href: "/tools/pdf/split" },
  { name: "Compress PDF", href: "/tools/pdf/compress" },
  { name: "Image → PDF", href: "/tools/pdf/image-to-pdf" },
  { name: "Word → PDF", href: "/tools/pdf/word-to-pdf" },
  { name: "PDF → Word", href: "/tools/pdf/pdf-to-word" },
  { name: "PDF → Image", href: "/tools/pdf/pdf-to-image" },
];

const dataTools = [
  { name: "CSV → JSON", href: "/tools/csv-to-json" },
  { name: "JSON → CSV", href: "/tools/json-to-csv" },
  { name: "CSV Diff Checker", href: "/tools/csv-diff" },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        color: "white",
        padding: "60px 40px",
      }}
    >
      {/* HERO */}
      <section style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          AI Conversion Agent
        </h1>

        <p
          style={{
            fontSize: 20,
            maxWidth: 700,
            color: "#cbd5f5",
            marginBottom: 40,
          }}
        >
          Convert files, data, and documents instantly.  
          Powered by AI. Secure. Fast. Free.
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 60 }}>
          <a
            href="#tools"
            style={{
              padding: "14px 24px",
              background: "#6366f1",
              borderRadius: 10,
              fontWeight: 600,
              color: "white",
              textDecoration: "none",
            }}
          >
            Explore Tools →
          </a>

          <a
            href="/tools/ai-convert"
            style={{
              padding: "14px 24px",
              border: "1px solid #6366f1",
              borderRadius: 10,
              fontWeight: 600,
              color: "#c7d2fe",
              textDecoration: "none",
            }}
          >
            Any-to-Any AI Converter
          </a>
        </div>
      </section>

      {/* TOOLS */}
      <section
        id="tools"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {/* PDF TOOLS */}
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>
          📄 PDF Utilities
        </h2>

        <ToolGrid tools={pdfTools} />

        {/* DATA TOOLS */}
        <h2
          style={{
            fontSize: 28,
            marginTop: 60,
            marginBottom: 16,
          }}
        >
          📊 Data Utilities
        </h2>

        <ToolGrid tools={dataTools} />
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          paddingTop: 30,
          borderTop: "1px solid #1e293b",
          color: "#94a3b8",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} AI Conversion Agent · Built with Next.js & AI
      </footer>
    </main>
  );
}

/* ------------------ */
/* TOOL GRID COMPONENT */
/* ------------------ */

function ToolGrid({
  tools,
}: {
  tools: { name: string; href: string }[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 20,
        marginBottom: 40,
      }}
    >
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          style={{
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: 16,
            padding: 24,
            textDecoration: "none",
            color: "white",
            transition: "transform 0.2s, border 0.2s",
          }}
        >
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>
            {tool.name}
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            Open tool →
          </p>
        </Link>
      ))}
    </div>
  );
}
