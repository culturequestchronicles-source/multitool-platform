import Link from "next/link";

export const metadata = {
  title: "How‑to — Jhatpat Help",
  description: "Step-by-step how-to guides for diagramming tools on Jhatpat.",
};

export default function HelpHowToPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">Help Center</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">How‑to</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Practical, step‑by‑step recipes for common diagramming tasks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/help" className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">
              ← Help Home
            </Link>
            <Link href="/help/faq" className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">
              FAQ →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <HowTo
          title="Create a Swimlane diagram"
          steps={[
            "Open Swimlanes and create a new diagram.",
            "Drag nodes from the stencil onto the canvas.",
            "Drop nodes inside lanes to snap; nodes stay attached to the lane.",
            "Connect nodes using the handles (drag from a black handle to another node).",
            "Export SVG or PNG when you’re ready to share.",
          ]}
          links={[
            { href: "/tools/diagrams/new?type=swimlanes", label: "Launch Swimlanes →" },
            { href: "/help/diagrams/swimlanes", label: "Swimlanes User Guide →" },
          ]}
        />

        <HowTo
          title="Create an ERD (tables + relationships)"
          steps={[
            "Open ERD and create a new diagram.",
            "Drag Entity nodes onto the canvas.",
            "Select an Entity → add fields in Properties (name/type, PK/FK).",
            "Connect entities using handles to create relationships.",
            "Toggle notation: Crow’s Foot vs Chen.",
            "Export SQL (DDL) or PDF data dictionary for documentation.",
          ]}
          links={[
            { href: "/tools/diagrams/new?type=erd", label: "Launch ERD →" },
            { href: "/help/diagrams/erd", label: "ERD User Guide →" },
          ]}
        />

        <HowTo
          title="Reverse‑engineer from SQL"
          steps={[
            "Open an ERD diagram.",
            "Click Import SQL in the toolbar.",
            "Paste CREATE TABLE statements (PostgreSQL style).",
            "Review entities and FK edges; use Auto‑Layout if needed.",
          ]}
          links={[{ href: "/help/diagrams/erd", label: "ERD Import/Export details →" }]}
        />
        <HowTo
          title="Create a Flow Chart (SaaS-grade)"
          steps={[
            "Open Flow Chart and create a new diagram.",
            "Drag shapes from the stencil onto the canvas.",
            "Connect nodes using handles (orthogonal connectors).",
            "Click an edge â†’ use “Edit Edge” to label exits (Yes/No) and toggle async dashed edges.",
            "Click an edge -> use Edit Edge to label exits (Yes/No) and toggle dashed async edges.",
            "Use Export Mermaid when you want the diagram in documentation or version control.",
          ]}
          links={[
            { href: "/tools/diagrams/new?type=flowchart", label: "Launch Flow Chart â†’" },
            { href: "/help/diagrams/flowchart", label: "Flow Chart User Guide â†’" },
          ]}
        />

        <HowTo
          title="Create an Org Chart (Functional/Divisional/Matrix/Flat)"
          steps={[
            "Open Org Chart and create a new diagram.",
            "Drag Employee/Contractor cards onto the canvas.",
            "Connect Manager → Report to create primary reporting lines.",
            "Use the chart type selector in the toolbar and click Auto‑Layout.",
            "For matrix: select an edge → Edit Edge → mark it dashed (secondary).",
          ]}
          links={[
            { href: "/tools/diagrams/new?type=org-chart", label: "Launch Org Chart →" },
            { href: "/help/diagrams/org-chart", label: "Org Chart User Guide →" },
          ]}
        />

        <HowTo
          title="Create a System Architecture diagram"
          steps={[
            "Open System Architecture and create a new diagram.",
            "In the left stencil sidebar, choose a Style: Generic / AWS / Azure / Google Cloud.",
            "Drag components layer-by-layer (Client → Security → Compute → Messaging → Data → Observability).",
            "Connect nodes with solid sync edges; use Edit Edge to toggle dashed async edges (events/queues/CDC).",
            "Use boundaries for Region/VPC/Cluster and Auto-Layout for clean spacing.",
            "Export Mermaid/SVG/PNG for documentation.",
          ]}
          links={[
            { href: "/tools/diagrams/new?type=system-architecture", label: "Launch System Architecture →" },
            { href: "/help/diagrams/system-architecture", label: "System Architecture User Guide →" },
            { href: "/help/diagrams/system-architecture/icon-packs", label: "Icon Packs Guide →" },
            { href: "/icon-packs/aws/README.md", label: "AWS icons →" },
            { href: "/icon-packs/azure/README.md", label: "Azure icons →" },
            { href: "/icon-packs/gcp/README.md", label: "Google Cloud icons →" },
          ]}
        />

        <HowTo
          title="Create a Data Architecture diagram (beginner-friendly)"
          steps={[
            "Open Data Architecture and create a new diagram.",
            "In the left sidebar, use Quick start → choose a template (AWS/Azure/GCP) → Load.",
            "Use + Source / + Ingestion / + Processing / + Storage / + Analytics to add steps (no dragging required).",
            "Use containers (Lakehouse / Workspace / Domain) to group nodes; nested nodes move together.",
            "Click Auto-Layout to align layers and reduce edge crossings.",
            "Export SVG/PNG for docs, or Export JSON for version control and re-importing.",
          ]}
          links={[
            { href: "/tools/diagrams/new?type=data-architecture", label: "Launch Data Architecture →" },
            { href: "/help/diagrams/data-architecture", label: "Data Architecture User Guide →" },
            { href: "/help/diagrams/system-architecture/icon-packs", label: "Icon Packs Guide →" },
          ]}
        />

        <HowTo
          title="Find your last diagram (Recents)"
          steps={[
            "Open /tools/diagrams.",
            "Under “Recent on this device”, click Open on your last diagram.",
            "If you only have the diagram ID (from the URL), paste it into “Open diagram by ID”.",
            "Optional: bookmark the diagram URL for quick access.",
          ]}
          links={[
            { href: "/tools/diagrams", label: "Open Diagrams (Recents) →" },
            { href: "/help/faq", label: "FAQ →" },
          ]}
        />
      </section>
    </main>
  );
}

function HowTo({
  title,
  steps,
  links,
}: {
  title: string;
  steps: string[];
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-700">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap gap-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
