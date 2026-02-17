import Link from "next/link";

export const metadata = {
  title: "Help Center — Jhatpat",
  description: "User guides, FAQs, and how-to articles for diagramming tools on Jhatpat.",
};

export default function HelpHomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <span>Help Center</span>
            <span className="text-slate-400">•</span>
            <span>Diagramming</span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">Guides, FAQs, and How-to</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Learn diagramming end-to-end: create diagrams, drag and connect nodes, edit properties, and export for documentation.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/help/how-to"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white shadow-sm"
            >
              How-to (Start here) →
            </Link>
            <Link
              href="/help/faq"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              FAQ →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Swimlanes User Guide"
            desc="Lanes, snapping, drag behavior, lane edits, and exports."
            href="/help/diagrams/swimlanes"
          />
          <Card
            title="ERD User Guide"
            desc="Entities/fields, PK/FK, Crow’s Foot vs Chen, SQL import/export, PDF data dictionary."
            href="/help/diagrams/erd"
          />
          <Card
            title="Org Chart User Guide"
            desc="People cards, department color coding, hierarchy, matrix secondary lines, and exports."
            href="/help/diagrams/org-chart"
          />
          <Card
            title="System Architecture User Guide"
            desc="Layered architecture diagrams with AWS/Azure/GCP styles, CQRS/CDC/Saga patterns, async vs sync flows, and exports."
            href="/help/diagrams/system-architecture"
          />
          <Card
            title="Data Architecture User Guide"
            desc="Templates + beginner-friendly add, containers, color-coded layers, and exports (SVG/PNG/JSON)."
            href="/help/diagrams/data-architecture"
          />
          <Card
            title="Flow Chart User Guide"
            desc="SaaS-grade flowcharts with legend, orthogonal connectors, decision labels, and Mermaid export."
            href="/help/diagrams/flowchart"
          />
          <Card
            title="How‑to Articles"
            desc="Step‑by‑step recipes for common tasks."
            href="/help/how-to"
          />
          <Card
            title="FAQ"
            desc="Troubleshooting and common questions."
            href="/help/faq"
          />
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-slate-50 transition-colors">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-600">{desc}</div>
      <div className="mt-4 text-sm font-bold text-slate-900">Open →</div>
    </Link>
  );
}
