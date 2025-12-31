import Link from "next/link";

export const metadata = {
  title: "System Architecture Diagramming — Jhatpat",
  description:
    "Create system architecture diagrams: services, APIs, components, data flows, and integrations. Export SVG and share instantly.",
};

export default function SystemArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <span>Diagramming</span>
            <span className="text-slate-400">•</span>
            <span>System Architecture</span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Architecture diagrams that stakeholders understand
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Map services, APIs, databases, queues, and integrations. Keep your
            system documentation current with fast edits and SVG export.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=system-architecture"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white shadow-sm"
            >
              Create Architecture Diagram →
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
              title="Clear component boundaries"
              desc="Represent services, modules, and responsibilities cleanly."
              icon="🧱"
            />
            <Feature
              title="Flows & integrations"
              desc="Show API calls, events, queues, and data movement."
              icon="🔌"
            />
            <Feature
              title="Export & share"
              desc="Export SVG and drop into ADRs, docs, and incident reports."
              icon="📤"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Perfect for"
            items={[
              "High-level system overview",
              "Service maps & dependencies",
              "Integration architecture",
              "Data flow and event-driven systems",
            ]}
          />
          <Card
            title="Best practices"
            items={[
              "Group by domain (billing, auth, orders).",
              "Label interfaces (REST, gRPC, events).",
              "Use lanes to split teams/ownership (optional).",
              "Keep it simple—depth belongs in BPMN/flows.",
            ]}
          />
        </div>

        <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold text-slate-900">
            Want a quick starting point?
          </div>
          <div className="mt-2 text-sm text-slate-700">
            Create a new diagram and begin with core boxes: Client → API → DB →
            Workers → Integrations.
          </div>

          <div className="mt-6">
            <Link
              href="/tools/diagrams/new?type=system-architecture"
              className="inline-flex items-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Launch Architecture →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
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
