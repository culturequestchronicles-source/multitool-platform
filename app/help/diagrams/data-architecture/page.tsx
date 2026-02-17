import Link from "next/link";

export const metadata = {
  title: "Data Architecture User Guide — Jhatpat Help",
  description: "Learn how to create SaaS-grade data architecture diagrams on Jhatpat (templates, smart add, containers, and export).",
};

export default function DataArchitectureGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Data Architecture</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Create professional data architecture diagrams that look like reference architectures: sources → ingestion → processing → storage → analytics,
            with governance and security overlays.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=data-architecture"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Create Data Architecture Diagram →
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
        <Block title="0) Quick start (recommended for beginners)">
          <ol className="list-decimal pl-6 text-sm text-slate-700 space-y-2">
            <li>
              In the left sidebar, use <b>Quick start</b> → pick a template (AWS/Azure/GCP) → click <b>Load</b>.
            </li>
            <li>
              Use the <b>+ Source / + Ingestion / + Processing / + Storage / + Analytics</b> buttons (or the <b>+ Add</b> button on any stencil item).
              You don’t need to drag.
            </li>
            <li>
              Click <b>Auto-Layout</b> to tidy the diagram if it feels messy.
            </li>
            <li>
              Export via <b>Export SVG</b> or <b>Export PNG (HD)</b> when you’re ready to share.
            </li>
          </ol>
        </Block>

        <Block title="1) Styles (Generic, AWS, Azure, Google Cloud)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              Pick a style from the <b>left stencil sidebar</b> under <b>Style</b>.
            </li>
            <li>
              Cloud styles use local icon files under{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/icon-packs/</code>.
            </li>
            <li>
              If you export SVG/PNG, icons are inlined so the exported files work when opened from disk.
            </li>
          </ul>
          <div className="mt-4 text-sm text-slate-700">
            Icon pack docs:
            <span className="ml-2 inline-flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/help/diagrams/system-architecture/icon-packs" className="font-bold underline">
                Icon Packs Guide
              </Link>
            </span>
          </div>
        </Block>

        <Block title="2) Use layers (the diagram “story”)">
          <ol className="list-decimal pl-6 text-sm text-slate-700 space-y-2">
            <li>
              <b>Sources</b>: files, OLTP databases, APIs, telemetry/streams.
            </li>
            <li>
              <b>Ingestion</b>: event streams, queues, collectors.
            </li>
            <li>
              <b>Processing</b>: ETL/orchestration, transforms.
            </li>
            <li>
              <b>Storage</b>: object store/lake, warehouse, SQL/NoSQL.
            </li>
            <li>
              <b>Analytics</b>: BI dashboards, ML/feature use cases.
            </li>
            <li>
              <b>Governance/Security</b>: catalog, quality checks, RBAC/policies (often connect with dashed edges).
            </li>
          </ol>
        </Block>

        <Block title="3) Containers (boundaries) + nesting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Use a <b>Container</b> to represent a Lakehouse / Workspace / Resource Group / Domain.</li>
            <li>
              Drag nodes into a container to nest them so they move together.
            </li>
            <li>To remove a node from a container, drag it outside the boundary.</li>
          </ul>
        </Block>

        <Block title="4) Edges (sync vs async)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Solid edges = synchronous / direct dependency.</li>
            <li>Dashed edges = async/event/CDC style flow (recommended for streaming and governance hooks).</li>
            <li>Select an edge → click <b>Edit Edge</b> to set a label and toggle dashed async style.</li>
          </ul>
        </Block>

        <Block title="5) Import / Export">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              <b>Import JSON</b>: upload a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">.json</code> file (other formats are rejected).
            </li>
            <li>
              <b>Export JSON</b>: useful for version control and re-importing.
            </li>
            <li>
              <b>Export SVG</b> / <b>Export PNG (HD)</b>: for docs and presentations.
            </li>
          </ul>
          <div className="mt-4 text-sm text-slate-700">
            Sample JSON:{" "}
            <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">public/samples/data-architecture.aws.sample.json</code>
          </div>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>If the diagram feels crowded, click Auto-Layout and keep the happy path linear (left → right).</li>
            <li>
              If you’re new to diagramming, start with a template and only change labels first. Add details later in the Properties panel.
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

