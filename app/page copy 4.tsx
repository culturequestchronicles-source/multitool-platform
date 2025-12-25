import Link from "next/link";

const sections = [
  {
    title: "📄 PDF Utilities",
    description: "Convert, compress, and manipulate PDFs instantly",
    tools: [
      { name: "Merge PDF", href: "/tools/pdf/merge" },
      { name: "Split PDF", href: "/tools/pdf/split" },
      { name: "Compress PDF", href: "/tools/pdf/compress" },
      { name: "Image → PDF", href: "/tools/pdf/image-to-pdf" },
      { name: "Word → PDF", href: "/tools/pdf/word-to-pdf" },
      { name: "PDF → Word", href: "/tools/pdf/pdf-to-word" },
      { name: "PDF → Image", href: "/tools/pdf/pdf-to-image" },
    ],
  },
  {
    title: "📊 Data Converters",
    description: "Powerful data transformations in seconds",
    tools: [
      { name: "CSV → JSON", href: "/tools/csv-to-json" },
      { name: "JSON → CSV", href: "/tools/json-to-csv" },
      { name: "CSV → Excel", href: "/tools/csv-to-excel" },
      { name: "JSON → Excel", href: "/tools/json-to-excel" },
      { name: "Excel → JSON", href: "/tools/excel-to-json" },
    ],
  },
  {
    title: "🤖 AI Conversion Agent",
    description: "Convert ANY data format to ANY other format using AI",
    tools: [
      { name: "Any → Any Converter (AI)", href: "/tools/ai-convert" },
    ],
  },
];

export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* HERO */}
      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #0f172a, #020617)",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>
          AI Conversion Agent
        </h1>
        <p style={{ fontSize: 18, maxWidth: 700, margin: "0 auto" }}>
          The all-in-one platform to convert PDFs, data files,
          and formats instantly — powered by AI, secure by design.
        </p>

        <div style={{ marginTop: 32 }}>
          <Link
            href="/tools/pdf/merge"
            style={{
              padding: "14px 28px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* TOOL SECTIONS */}
      <section style={{ padding: "60px 20px", maxWidth: 1200, margin: "auto" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>
              {section.title}
            </h2>
            <p style={{ color: "#555", marginBottom: 24 }}>
              {section.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {section.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 20,
                    textDecoration: "none",
                    color: "#000",
                    background: "#fff",
                    boxShadow:
                      "0 4px 10px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s",
                  }}
                >
                  <h3 style={{ fontSize: 18 }}>{tool.name}</h3>
                  <p style={{ fontSize: 13, color: "#666" }}>
                    Open tool →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: 30,
          textAlign: "center",
          borderTop: "1px solid #eee",
          color: "#555",
        }}
      >
        © {new Date().getFullYear()} AI Conversion Agent • Secure • Fast • Free
      </footer>
    </main>
  );
}
