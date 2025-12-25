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
  { name: "CSV → Excel", href: "/tools/csv-to-excel" },
  { name: "JSON → Excel", href: "/tools/json-to-excel" },
  { name: "CSV Diff", href: "/tools/csv-diff" },
];

function ToolCard({ name, href }: { name: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e5e7eb",
        textDecoration: "none",
        color: "#111",
        transition: "all 0.2s ease",
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{name}</h3>
      <p style={{ fontSize: 13, marginTop: 8, color: "#2563eb" }}>
        Open tool →
      </p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section
        style={{
          padding: "80px 40px",
          background: "linear-gradient(135deg, #020617, #020617)",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 48, fontWeight: 800 }}>
          AI Conversion Agent
        </h1>
        <p style={{ fontSize: 18, marginTop: 16, opacity: 0.85 }}>
          Convert files, data, and documents instantly — securely and intelligently
        </p>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "60px 40px" }}>
        {/* PDF */}
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>📄 PDF Utilities</h2>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Convert, compress, and manipulate PDFs instantly
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {pdfTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>

        {/* DATA */}
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>📊 Data Converters</h2>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Powerful data transformations in seconds
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {dataTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>
    </main>
  );
}
