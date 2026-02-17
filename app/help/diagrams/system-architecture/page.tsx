import Link from "next/link";

export const metadata = {
  title: "System Architecture User Guide — Jhatpat Help",
  description: "Learn how to build SaaS-grade system/application architecture diagrams on Jhatpat.",
};

export default function SystemArchitectureGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">System Architecture</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Create professional architecture diagrams with layered layout, explicit security/auth flows, CQRS read/write
            paths, CDC streams, and async messaging.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools/diagrams/new?type=system-architecture"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Create Architecture Diagram →
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
        <Block title="0) Styles (Generic, AWS, Azure, Google Cloud)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              Pick a style from the <b>left stencil sidebar</b> under <b>Style</b>.
            </li>
            <li>
              Vendor styles load icons from local manifests served from:
              <span className="ml-2 inline-flex flex-wrap gap-2">
                <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">/icon-packs/aws/manifest.json</code>
                <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">/icon-packs/azure/manifest.json</code>
                <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">/icon-packs/gcp/manifest.json</code>
              </span>
            </li>
            <li>
              You can override the icon per node: select a node â†’ <b>Properties</b> â†’ <b>Icon Key</b> (matches a key in
              the selected style manifest).
            </li>
            <li>If a manifest is missing, the UI shows a warning and nodes fall back to generic icons.</li>
          </ul>
          <div className="mt-4 text-sm text-slate-700">
            Icon pack docs:
            <span className="ml-2 inline-flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/help/diagrams/system-architecture/icon-packs" className="font-bold underline">
                Guide
              </Link>
              <Link href="/icon-packs/aws/README.md" className="font-bold underline">
                AWS
              </Link>
              <Link href="/icon-packs/azure/README.md" className="font-bold underline">
                Azure
              </Link>
              <Link href="/icon-packs/gcp/README.md" className="font-bold underline">
                Google Cloud
              </Link>
            </span>
          </div>
        </Block>
        <Block title="1) Use layered structure (SaaS-grade)">
          <ol className="list-decimal pl-6 text-sm text-slate-700 space-y-2">
            <li>
              Client/Edge: Users, Web/Mobile, CDN.
            </li>
            <li>
              Security/Routing: WAF, API Gateway, Auth (OIDC).
            </li>
            <li>
              Compute/Logic: Microservices, K8s, Serverless.
            </li>
            <li>
              Async/Messaging: Event bus, queues/topics.
            </li>
            <li>
              Persistence: SQL/NoSQL/object store/search.
            </li>
            <li>
              Observability: metrics, logging, tracing.
            </li>
          </ol>
          <div className="mt-4 text-sm text-slate-700">
            Use <b>Auto‑Layout</b> to align nodes by layer.
          </div>
        </Block>

        <Block title="2) Sync vs async flows (solid vs dashed)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Solid edges = synchronous request/response.</li>
            <li>Dashed edges = async events/messages/CDC.</li>
            <li>Select an edge → click <b>Edit Edge</b> to toggle dashed async style and set labels.</li>
          </ul>
        </Block>

        <Block title="3) Enterprise patterns (CQRS + CDC + Saga)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              CQRS: separate <b>Command API</b> (write) from <b>Query API</b> (read).
            </li>
            <li>
              CDC: connect Write DB → CDC Stream → Read Model/Search (dashed).
            </li>
            <li>
              Saga: use a saga/orchestrator node and dashed flows to coordinate distributed transactions.
            </li>
          </ul>
        </Block>

        <Block title="4) High availability (multi‑region)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Use Region Boundary nodes to represent Region A/Region B.</li>
            <li>Place replicated storage in the failover region to communicate DR posture.</li>
          </ul>
        </Block>

        <Block title="5) Boundaries & nesting (regions, VPCs, groups)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag a boundary (Region/VPC/Group) from the stencil onto the canvas.</li>
            <li>
              Drag components <b>into</b> a boundary to nest them so they move together.
            </li>
            <li>To remove a component from a boundary, drag it outside the boundary box.</li>
          </ul>
        </Block>

        <Block title="6) Export">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Export SVG/PNG for documentation.</li>
            <li>Export Mermaid to store the diagram textually in version control.</li>
          </ul>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>If edges look messy, add whitespace between layers and keep the happy path linear.</li>
            <li>
              If vendor icons don’t appear, confirm the relevant manifest exists under{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/icon-packs/</code>.
            </li>
            <li>If your diagram feels crowded, split into two diagrams: High‑level + Deep‑dive per domain.</li>
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
