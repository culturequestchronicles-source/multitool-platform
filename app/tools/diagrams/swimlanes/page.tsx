import Link from "next/link";

export const metadata = {
  title: "Swimlanes Diagramming — Jhatpat",
  description:
    "Create swimlane diagrams to visualize handoffs across teams, systems, or departments. AI-assisted lane generation and SVG export.",
};

export default function SwimlanesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <span>Diagramming</span>
            <span className="text-slate-400">•</span>
            <span>Swimlanes</span>
            <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-[11px] font-extrabold text-white">
              AI
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Swimlane diagrams for clean handoffs
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Map responsibilities across teams, systems, or departments. Use lanes
            to clarify ownership and reduce ambiguity. Export as SVG for docs and
            slides.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=swimlanes"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white shadow-sm"
            >
              Create Swimlane Diagram →
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
              title="AI lane suggestions"
              desc="Derive lanes from Actors metadata or prompt-based generation."
              icon="🧠"
            />
            <Feature
              title="Snap-to-lane placement"
              desc="Drag nodes and they’ll align inside the correct lane."
              icon="🧲"
            />
            <Feature
              title="Export-ready"
              desc="SVG export makes sharing painless across docs and slides."
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
              "Cross-team workflows",
              "System handoffs",
              "SOPs and playbooks",
              "Support / Operations flows",
            ]}
          />
          <Card
            title="Pro tips"
            items={[
              "Use Actors field (comma separated) for AI lane generation.",
              "Lock lanes after you like layout.",
              "Add dividers to represent sub-areas (e.g., shifts, regions).",
              "Export SVG and paste into Google Docs / Slides.",
            ]}
          />
        </div>

        <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold text-slate-900">
            Start in 10 seconds
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-700">
            <li>Create a new Swimlane diagram</li>
            <li>Add tasks / subprocess nodes</li>
            <li>Fill Actors field (e.g., “Service, Prep, Oven”)</li>
            <li>Click AI: Generate Swim Lanes</li>
          </ol>

          <div className="mt-6">
            <Link
              href="/tools/diagrams/new?type=swimlanes"
              className="inline-flex items-center rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Launch Swimlanes →
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
