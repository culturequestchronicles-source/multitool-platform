import Link from "next/link";

export const metadata = {
  title: "Data Architecture Diagramming — Jhatpat",
  description:
    "Create professional data architecture diagrams: sources, ingestion, processing, storage, analytics, governance and security. Export SVG/PNG and JSON.",
};

export default function DataArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <span>Diagramming</span>
            <span className="text-slate-400">•</span>
            <span>Data Architecture</span>
            <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-[11px] font-extrabold text-white">
              Data
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Data architecture diagrams that look like reference architectures
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Start from a template, add nodes without dragging, group them inside containers (lakehouse, domains), and export to SVG/PNG or JSON for version control.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=data-architecture"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white shadow-sm"
            >
              Create Data Architecture Diagram →
            </Link>
            <Link
              href="/help/diagrams/data-architecture"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              User Guide →
            </Link>
            <Link
              href="/tools/diagrams"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Browse all diagram tools
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Feature
              title="Smart, color-coded layers"
              desc="Ingestion (blue), Processing (purple), Storage (green), Analytics (orange)."
              icon="🧭"
            />
            <Feature
              title="Containers / boundaries"
              desc="Group nodes into a Lakehouse, Workspace, Domain or Resource Group boundary."
              icon="🧱"
            />
            <Feature
              title="Export + version control"
              desc="Export SVG/PNG for docs and JSON for re-importing and Git diffs."
              icon="📦"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Best for"
            items={[
              "Modern Data Stack diagrams",
              "Lakehouse architectures",
              "Streaming + batch pipelines",
              "Governance & security overlays",
            ]}
          />
          <Card
            title="Pro tips"
            items={[
              "Start with a template, then rename nodes first.",
              "Use the + Add buttons in the stencil if you don’t want to drag.",
              "Add one container per domain or platform boundary.",
              "Use dashed edges for async/event flows.",
              "Run Auto-Layout after rough placement.",
              "Keep labels short; put details in subtitle and metadata.",
            ]}
          />
        </div>

        <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold text-slate-900">Start with a clean template</div>
          <div className="mt-2 text-sm text-slate-700">
            Templates help beginners create a professional diagram without knowing layout rules.
          </div>
          <div className="mt-6">
            <Link
              href="/tools/diagrams/new?type=data-architecture"
              className="inline-flex items-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Launch Data Architecture →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div className="mt-3 text-sm font-extrabold text-slate-900">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{desc}</div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5">✓</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
