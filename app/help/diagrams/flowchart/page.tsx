import Link from "next/link";

export const metadata = {
  title: "Flow Chart User Guide — Jhatpat Help",
  description: "Learn how to create, edit, and export Flow Charts on Jhatpat.",
};

export default function FlowchartGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Flow Chart</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Build SaaS-grade flowcharts with orthogonal connectors, a clean grid, and a professional legend. Keep a
            “happy path” spine, and place failures/timeouts on side branches.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=flowchart"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Create Flow Chart →
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
        <Block title="1) Add shapes (nodes)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag a shape from the left stencil onto the canvas.</li>
            <li>Double-click a node label to edit it.</li>
            <li>Use the right Properties panel to adjust fill/border colors and size.</li>
          </ul>
        </Block>

        <Block title="2) Connect nodes with orthogonal edges">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag from a node handle to another node to create a connector.</li>
            <li>Connections use right-angle routing by default to keep diagrams readable.</li>
          </ul>
        </Block>

        <Block title="3) Label decision exits (Yes/No)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Click an edge to select it.</li>
            <li>Use the top toolbar button “Edit Edge” to set the label (Yes/No, Success/Fail) and async style.</li>
          </ul>
        </Block>

        <Block title="4) Legend + meaning">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Use “Show/Hide Legend” in the toolbar to toggle the legend overlay.</li>
            <li>Solid edges = sync. Dashed edges = async/API callbacks.</li>
          </ul>
        </Block>

        <Block title="5) Export">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Export SVG for crisp documentation.</li>
            <li>Export PNG (HD) for quick sharing.</li>
            <li>Export Mermaid to reuse the diagram in documentation pipelines and version control.</li>
          </ul>
        </Block>

        <Block title="6) Re-open your last Flow Chart (Recents)">
          <ol className="list-decimal pl-6 text-sm text-slate-700 space-y-2">
            <li>Go to the Diagrams page: <b>/tools/diagrams</b>.</li>
            <li>Under <b>Recent on this device</b>, find your diagram and click <b>Open</b>.</li>
            <li>
              If you have an ID (from the URL), paste it into <b>Open diagram by ID</b>.
            </li>
          </ol>
          <div className="mt-3 text-xs text-slate-600 leading-relaxed">
            Note: Recents are saved <b>in this browser only</b> (public mode, no accounts). If you switch browsers/devices
            or clear site data, the local recents list won’t follow you.
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams"
              className="rounded-2xl border bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Open Diagrams (Recents) →
            </Link>
          </div>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>If you see “Read-only”, use “Claim Edit Access” and paste the edit key from the creator device.</li>
            <li>If edges look messy, increase spacing between nodes and keep the main path linear.</li>
          </ul>
          <div className="mt-4">
            <Link
              href="/help/faq"
              className="rounded-2xl border bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Read FAQ →
            </Link>
          </div>
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
