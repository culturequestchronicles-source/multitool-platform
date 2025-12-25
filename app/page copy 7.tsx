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
  { name: "CSV Diff", href: "/tools/csv-diff" },
];

function Section({ title, subtitle, tools }: any) {
  return (
    <section style={{ marginBottom: 60 }}>
      <h2 style={{ fontSize: 28 }}>{title}</h2>
      <p style={{ color: "#555", marginBottom: 20 }}>{subtitle}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {tools.map((tool: any) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              color: "#000",
              background: "#fff",
              transition: "all 0.2s ease",
            }}
          >
            <h3>{tool.name}</h3>
            <p style={{ fontSize: 13, color: "#2563eb" }}>
              Open tool →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, marginBottom: 10 }}>
        AI Conversion Agent
      </h1>
      <p style={{ fontSize: 18, color: "#555", marginBottom: 50 }}>
        Convert data & documents securely — powered by AI
      </p>

      <Section
        title="📄 PDF Utilities"
        subtitle="Convert, compress, and manipulate PDFs instantly"
        tools={pdfTools}
      />

      <Section
        title="📊 Data Converters"
        subtitle="Powerful data transformations in seconds"
        tools={dataTools}
      />
    </main>
  );
}
