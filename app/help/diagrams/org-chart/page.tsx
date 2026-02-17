import Link from "next/link";

export const metadata = {
  title: "Org Chart User Guide — Jhatpat Help",
  description: "Learn how to create and export SaaS-grade organizational charts on Jhatpat.",
};

export default function OrgChartGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Org Charts</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Create clean, SaaS-grade organizational charts with card-style people nodes, department color coding, and
            orthogonal reporting lines.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=org-chart"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Create Org Chart →
            </Link>
            <Link
              href="/help"
              className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              ← Help Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <Block title="1) Add people cards">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag <b>Employee</b> or <b>Contractor</b> from the left stencil onto the canvas.</li>
            <li>Double-click the name/title to edit inline.</li>
            <li>Use the Properties panel to set department, color, and avatar URL.</li>
          </ul>
        </Block>

        <Block title="2) Create reporting lines (Manager → Report)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag from a manager handle to a report handle to connect.</li>
            <li>Primary reporting lines are solid by default.</li>
          </ul>
        </Block>

        <Block title="3) Expand / collapse branches">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Click the <b>±</b> button on a person card to collapse/expand their subtree.</li>
            <li>Collapsed branches are hidden for readability.</li>
          </ul>
        </Block>

        <Block title="4) Four structure types (Auto‑Layout)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              <b>Functional Top‑Down</b>: uses each person’s <b>Primary Manager</b> to build a hierarchy.
            </li>
            <li>
              <b>Divisional</b>: set <b>Division</b> on people, then Auto‑Layout clusters each division as its own sub‑chart.
            </li>
            <li>
              <b>Matrix</b>: keep the primary manager solid; select an edge and use <b>Edit Edge</b> to mark a dashed secondary line.
            </li>
            <li>
              <b>Flat</b>: set person <b>Group</b> = Core/Staff, then Auto‑Layout creates a minimal‑levels layout.
            </li>
          </ul>
        </Block>

        <Block title="5) Export">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Export SVG/PNG for documentation.</li>
            <li>Export Mermaid to store the structure in version control.</li>
          </ul>
        </Block>

        <Block title="6) Groups (teams + divisions)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              Use <b>Team / Function</b> and <b>Division</b> from the left stencil to add clear section headers.
            </li>
            <li>Resize a group header by selecting it and dragging the resize handles.</li>
            <li>Place group headers behind people cards (they’re designed as lightweight labels).</li>
          </ul>
        </Block>

        <Block title="7) Legend (show/hide)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Use <b>Hide Legend</b> / <b>Show Legend</b> in the toolbar to toggle the department legend overlay.</li>
            <li>Solid edges = primary manager. Dashed edges = secondary/project manager (matrix).</li>
          </ul>
        </Block>

        <Block title="8) Re-open your last org chart">
          <ol className="list-decimal pl-6 text-sm text-slate-700 space-y-2">
            <li>Go to <b>/tools/diagrams</b>.</li>
            <li>Under <b>Recent on this device</b>, click <b>Open</b> for your last diagram.</li>
            <li>If you only have the diagram ID (from the URL), paste it into <b>Open diagram by ID</b>.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams"
              className="rounded-2xl border bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Open Diagrams (Recents) →
            </Link>
          </div>
          <div className="mt-3 text-xs text-slate-600 leading-relaxed">
            Recents are saved in this browser only (public mode). If you switch devices/browsers or clear site data,
            your local recents list won’t follow you.
          </div>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>If connecting feels hard, zoom in and connect from the bottom of manager to the top of report.</li>
            <li>If a branch disappears, check if the manager is collapsed (+ button) and click to expand.</li>
            <li>
              For divisional charts, set <b>Division</b> on people and then run <b>Auto‑Layout</b>.
            </li>
          </ul>
        </Block>
      </section>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
