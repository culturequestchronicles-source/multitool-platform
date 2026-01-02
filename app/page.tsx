import ToolCard from "@/components/ToolCard";
import ToolSection from "@/components/home/ToolSection";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhatpat.com"),
  title: "Jhatpat — Free Online PDF Tools, Converters, Diff Checkers, Generators & Diagramming",
  description:
    "Jhatpat is a fast, privacy-first web utility platform for PDF tools (merge, split, compress, convert), data converters, diff checkers, generators, and diagramming tools like BPMN, swimlanes, and architecture diagrams.",
  keywords: [
    "PDF merge",
    "PDF compress",
    "CSV to JSON",
    "Password generator",
    "URL shortener",
    "Dummy Data Generator",
    "CSV Diff",
    "Slug Generator",
    "BPMN",
    "Swimlanes",
    "System Architecture Diagram",
    "Org Chart",
    "Flowchart",
    "ER Diagram",
    "Data Architecture",
    "Data Model",
    "Decision Flow",
  ],
  openGraph: {
    title: "Jhatpat — Web Utilities + Diagramming (PDF, Converters, Diff, Generators)",
    description:
      "Free and secure web utilities for PDFs, data conversions, diff checks, generators, and diagramming tools.",
    url: "https://jhatpat.com",
    siteName: "Jhatpat",
    type: "website",
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
  "#BoxShadow",
  "#FreeOnlineTools",
  "#WebUtilities",
  "#Diagramming",
  "#BPMN",
  "#Swimlanes",
  "#Flowchart",
  "#ERD",
  "#OrgChart",
  "#SystemArchitecture",
  "#DataArchitecture",
  "#DataModel",
  "#DecisionFlow",
];

export default function HomePage() {
  return (
    <main style={{ background: "#f7fafc", minHeight: "100vh" }}>
      {/* HERO */}
      <section style={heroStyle}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={pillBadge}>
            <span style={{ opacity: 0.95 }}>jhatpat.com</span>
            <span style={{ opacity: 0.65 }}>•</span>
            <span style={{ opacity: 0.92 }}>Fast • Secure • Free Utilities</span>
          </div>

          <h1 style={heroTitle}>Jhatpat Web Utilities</h1>
          <p style={heroSubtitle}>
            One place for{" "}
            <span style={heroHighlight}>PDF tools</span>,{" "}
            <span style={heroHighlight}>data conversions</span>,{" "}
            <span style={heroHighlight}>diff checks</span>,{" "}
            <span style={heroHighlight}>generators</span>, and{" "}
            <span style={heroHighlight}>diagramming</span>.
          </p>

          <div style={ctaRow}>
            <a href="#tools" style={primaryBtn}>
              Explore Tools
            </a>
            <a href="#diagramming" style={secondaryBtn}>
              Explore Diagramming
            </a>
            <a href="#tags" style={ghostBtn}>
              Browse Capabilities
            </a>
          </div>

          <div style={heroBadgesWrap}>
            <HeroBadge icon="⚡" title="Instant workflows" desc="Start in seconds" />
            <HeroBadge icon="🔒" title="Privacy-first" desc="Client-side processing" />
            <HeroBadge icon="🚀" title="Fast output" desc="Optimized for speed" />
            <HeroBadge icon="🌍" title="Works anywhere" desc="Desktop + Mobile" />
          </div>

          <div style={heroMiniStrip}>
            <div style={heroMiniLeft}>
              <div style={heroMiniTitle}>Popular picks</div>
              <div style={heroMiniChips}>
                <a href="/tools/pdf/merge" style={chip}>
                  Merge PDF
                </a>
                <a href="/tools/generators/tinyurl" style={chip}>
                  TinyURL
                </a>
                <a href="/tools/diagrams/new?type=bpmn" style={chipDark}>
                  Create BPMN
                </a>
              </div>
            </div>

            <div style={heroMiniRight}>
              <div style={heroMiniTitle}>Export-ready</div>
              <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5 }}>
                PDF tools run locally in your browser. Diagramming exports to SVG for easy sharing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ padding: "18px 24px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={trustGrid}>
          <TrustPill title="No signup required" desc="For most utilities" icon="⚡" />
          <TrustPill title="Secure by design" desc="Privacy-first workflows" icon="🛡️" />
          <TrustPill title="Clean UI" desc="Professional + simple" icon="✨" />
          <TrustPill title="Always improving" desc="New tools regularly" icon="🧠" />
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ padding: "50px 24px", maxWidth: 1180, margin: "0 auto" }}>
        <ToolSection title="📄 PDF Utilities" subtitle="Professional PDF manipulation tools">
          <div style={gridStyle}>
            <ToolCard title="Merge PDF" description="Combine multiple PDFs" href="/tools/pdf/merge" icon="🧩" />
            <ToolCard title="Split PDF" description="Split pages easily" href="/tools/pdf/split" icon="✂️" />
            <ToolCard title="Compress PDF" description="Reduce file size" href="/tools/pdf/compress" icon="🗜️" />
            <ToolCard title="PDF → Word" description="Editable DOCX" href="/tools/pdf/pdf-to-word" icon="📝" />
            <ToolCard title="Image → PDF" description="Images to PDF" href="/tools/pdf/image-to-pdf" icon="🖼️" />
            <ToolCard title="Word → PDF" description="DOCX to PDF" href="/tools/pdf/word-to-pdf" icon="📄" />
          </div>
        </ToolSection>

        <ToolSection title="📊 Data & Diff" subtitle="Compare files and convert data formats">
          <div style={gridStyle}>
            <ToolCard title="Diff Checkers" description="Text, CSV, & Excel Diff" href="/tools/diffchecker" icon="🧩" />
            <ToolCard title="CSV Diff" description="Detailed row comparison" href="/tools/csv-diff" icon="⚖️" />
            <ToolCard title="CSV → JSON" description="Structured JSON output" href="/tools/csv-to-json" icon="🔁" />
            <ToolCard title="JSON → CSV" description="Flat CSV export" href="/tools/json-to-csv" icon="📄" />
            <ToolCard title="CSV → Excel" description="Spreadsheet ready" href="/tools/csv-to-excel" icon="📊" />
          </div>
        </ToolSection>

        {/* DIAGRAMMING */}
        <div id="diagramming" />
        <ToolSection
          title="🧩 Diagramming"
          subtitle="Design business processes, architectures, and data models—fast."
          kicker="NEW"
          accent="indigo"
        >
          <div style={diagramHeaderRow}>
            <div style={{ maxWidth: 720 }}>
              <div style={diagramTitle}>Create, collaborate, export.</div>
              <div style={diagramSub}>
                Diagramming tools are saved to your account (magic link login). Choose a template and start building.
              </div>
            </div>

            {/* ✅ HIDDEN: Open Diagrams Hub button */}
            {false && (
              <a href="/tools/diagrams" style={diagramHubBtn}>
                Open Diagrams Hub →
              </a>
            )}
          </div>

          <div style={gridStyle}>
            <ToolCard
              title="BPMN"
              description="Model business processes with tasks, gateways & events"
              href="/tools/diagrams/new?type=bpmn"
              icon="🧠"
              badge="Pro"
              requiresLogin
            />
            <ToolCard
              title="Swimlanes"
              description="Handoffs across teams, systems, or departments"
              href="/tools/diagrams/new?type=swimlanes"
              icon="🏊"
              badge="AI"
              requiresLogin
            />
            <ToolCard
              title="System Architecture"
              description="Components, services, APIs, flows & integrations"
              href="/tools/diagrams/new?type=system-architecture"
              icon="🏗️"
              requiresLogin
            />
            <ToolCard
              title="Org Chart"
              description="Teams, reporting lines, roles & responsibilities"
              href="/tools/diagrams/new?type=org-chart"
              icon="👥"
              requiresLogin
            />
            <ToolCard
              title="Decision Flow"
              description="If/else logic, policies, approvals & branching"
              href="/tools/diagrams/new?type=decision-flow"
              icon="🧭"
              requiresLogin
            />
            <ToolCard
              title="Entity Relationship"
              description="ERD for tables, relations, keys & constraints"
              href="/tools/diagrams/new?type=erd"
              icon="🧬"
              badge="Data"
              requiresLogin
            />
            <ToolCard
              title="Data Architecture"
              description="Pipelines, storage, governance & ownership"
              href="/tools/diagrams/new?type=data-architecture"
              icon="🗄️"
              badge="Data"
              requiresLogin
            />
            <ToolCard
              title="Flow Chart"
              description="Clear step-by-step flows for any process"
              href="/tools/diagrams/new?type=flowchart"
              icon="🔀"
              requiresLogin
            />
            <ToolCard
              title="Data Model"
              description="Conceptual → logical → physical modeling"
              href="/tools/diagrams/new?type=data-model"
              icon="📐"
              badge="Data"
              requiresLogin
            />
          </div>

          <div style={sectionCallout}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 13, color: "#0f172a" }}>Tip</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>
                  Use <b>Swimlanes</b> for team handoffs, <b>BPMN</b> for process detail, and <b>Architecture</b> for
                  system flows. Export to SVG for easy sharing in docs and slides.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* ✅ HIDDEN: Start BPMN button */}
                {false && (
                  <a href="/tools/diagrams/new?type=bpmn" style={calloutBtnDark}>
                    Start BPMN →
                  </a>
                )}

                <a href="/tools/diagrams/new?type=swimlanes" style={calloutBtnLight}>
                  Start Swimlanes →
                </a>
              </div>
            </div>
          </div>
        </ToolSection>

        <ToolSection title="⚡ Generators" subtitle="Developer utilities for IDs, text, and styles">
          <div style={gridStyle}>
            <ToolCard title="Dummy Data" description="Realistic test datasets" href="/tools/generators/dummy-data" icon="🧪" />
            <ToolCard title="Slug Generator" description="URL-friendly strings" href="/tools/generators/slug" icon="🐌" />
            <ToolCard title="Box Shadow" description="Visual CSS generator" href="/tools/generators/box-shadow" icon="🔳" />
            <ToolCard title="GUID Generator" description="Generate unique IDs" href="/tools/generators/guid" icon="🆔" />
            <ToolCard title="Password Generator" description="Secure passwords" href="/tools/generators/password" icon="🔐" />
            <ToolCard title="TinyURL" description="Shorten links" href="/tools/generators/tinyurl" icon="🔗" />
          </div>
        </ToolSection>
      </section>

      {/* TAGS */}
      <section id="tags" style={{ padding: "10px 24px 70px", maxWidth: 1180, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 950, letterSpacing: -0.3 }}>Capabilities</h2>
        <p style={{ marginTop: 8, color: "#6b7280" }}>Search-friendly tags to help users discover tools faster.</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          {TAGS.map((t) => (
            <span key={t} style={tagStyle}>
              {t}
            </span>
          ))}
        </div>

        <footer style={{ marginTop: 40, color: "#6b7280", fontSize: 13, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/about" style={footerLinkStyle}>
              About
            </Link>
            <Link href="/privacy" style={footerLinkStyle}>
              Privacy Policy
            </Link>
            <Link href="/contact" style={footerLinkStyle}>
              Contact & Feedback
            </Link>
          </div>
          <div style={{ marginTop: 10 }}>© {new Date().getFullYear()} Jhatpat. Privacy-first web utilities.</div>
        </footer>
      </section>
    </main>
  );
}

/* ------------------ */
/* Components */
/* ------------------ */

function TrustPill({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div style={pillStyle}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 950 }}>{title}</div>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{desc}</div>
      </div>
    </div>
  );
}

function HeroBadge({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={heroBadge}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 950, fontSize: 13 }}>{title}</div>
        <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 12 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ------------------ */
/* Styles */
/* ------------------ */

const heroStyle: React.CSSProperties = {
  padding: "88px 24px 56px",
  background:
    "radial-gradient(1200px circle at 20% 10%, #1d4ed8 0%, rgba(29,78,216,0.18) 38%, rgba(2,6,23,1) 100%)",
  color: "white",
  textAlign: "center",
};

const heroTitle: React.CSSProperties = {
  fontSize: 58,
  fontWeight: 950,
  marginTop: 18,
  lineHeight: 1.05,
  letterSpacing: -0.9,
};

const heroSubtitle: React.CSSProperties = {
  marginTop: 14,
  fontSize: 18,
  opacity: 0.92,
  lineHeight: 1.65,
  maxWidth: 880,
  marginLeft: "auto",
  marginRight: "auto",
};

const heroHighlight: React.CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.14)",
  padding: "2px 10px",
  borderRadius: 999,
  fontWeight: 950,
};

const ctaRow: React.CSSProperties = {
  marginTop: 28,
  display: "flex",
  gap: 12,
  justifyContent: "center",
  flexWrap: "wrap",
};

const heroBadgesWrap: React.CSSProperties = {
  marginTop: 34,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 12,
  maxWidth: 980,
  marginLeft: "auto",
  marginRight: "auto",
};

const heroBadge: React.CSSProperties = {
  borderRadius: 18,
  padding: 14,
  display: "flex",
  gap: 12,
  alignItems: "center",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const heroMiniStrip: React.CSSProperties = {
  marginTop: 22,
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 12,
  alignItems: "stretch",
  maxWidth: 980,
  marginLeft: "auto",
  marginRight: "auto",
};

const heroMiniLeft: React.CSSProperties = {
  borderRadius: 20,
  padding: 16,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  textAlign: "left",
};

const heroMiniRight: React.CSSProperties = {
  borderRadius: 20,
  padding: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  textAlign: "left",
};

const heroMiniTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  opacity: 0.92,
};

const heroMiniChips: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const chip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "rgba(255,255,255,0.92)",
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none",
};

const chipDark: React.CSSProperties = {
  ...chip,
  background: "rgba(0,0,0,0.22)",
  border: "1px solid rgba(255,255,255,0.16)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 22,
};

const trustGrid: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  fontWeight: 950,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  padding: "14px 22px",
  borderRadius: 14,
  color: "white",
  fontWeight: 950,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.16)",
};

const ghostBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  padding: "14px 22px",
  borderRadius: 14,
  color: "rgba(255,255,255,0.92)",
  fontWeight: 950,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.10)",
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
  fontWeight: 900,
};

const pillStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const diagramHeaderRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
  marginBottom: 18,
};

const diagramTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 950,
  color: "#0f172a",
  letterSpacing: -0.2,
};

const diagramSub: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  color: "#64748b",
  lineHeight: 1.55,
};

const diagramHubBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  background: "white",
  padding: "12px 16px",
  fontSize: 12,
  fontWeight: 950,
  color: "#0f172a",
  textDecoration: "none",
  boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
};

const sectionCallout: React.CSSProperties = {
  marginTop: 18,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  borderRadius: 18,
  padding: 14,
};

const calloutBtnDark: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  background: "#0f172a",
  color: "white",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 950,
  textDecoration: "none",
};

const calloutBtnLight: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  background: "white",
  color: "#0f172a",
  border: "1px solid #e5e7eb",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 950,
  textDecoration: "none",
};

const footerLinkStyle: React.CSSProperties = {
  color: "#4b5563",
  textDecoration: "none",
  fontWeight: 600,
};
