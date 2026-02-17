import Link from "next/link";

export const metadata = {
  title: "ERD Diagramming — Jhatpat",
  description: "Create ERD diagrams with entities, fields, PK/FK constraints, crow’s-foot notation, and SQL/PDF exports.",
};

export default function ErdLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <span>Diagramming</span>
            <span className="text-slate-400">•</span>
            <span>ERD</span>
            <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-[11px] font-extrabold text-white">
              Data
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Entity Relationship Diagrams (ERD)
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Design database schemas visually: tables, columns, primary keys, foreign keys, and relationships.
            Export SQL and a PDF data dictionary for documentation.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=erd"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white shadow-sm"
            >
              Create ERD →
            </Link>
            <Link
              href="/help/diagrams/erd"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              User Guide
            </Link>
            <Link
              href="/tools/diagrams"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Browse all diagram tools
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Feature title="Table‑style entities" desc="Entities render as professional table cards with fields and PK/FK markers." icon="🧱" />
            <Feature title="Crow’s Foot toggle" desc="Switch notation between Crow’s Foot and Chen as you model." icon="🧭" />
            <Feature title="SQL + PDF exports" desc="Export PostgreSQL DDL and a PDF data dictionary for handoffs." icon="📄" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Best for"
            items={[
              "Database schema design",
              "FK relationship mapping",
              "Architecture & data platform docs",
              "Sharing with engineers and DBAs",
            ]}
          />
          <Card
            title="Pro tips"
            items={[
              "Define PK fields first, then mark FK fields and reference PKs.",
              "Use Auto‑Layout to quickly space out tables, then fine‑tune manually.",
              "Export PDF for stakeholders; export SQL for implementation.",
              "Use Import SQL to reverse‑engineer from DDL (best-effort).",
            ]}
          />
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

