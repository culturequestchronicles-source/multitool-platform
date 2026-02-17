import Link from "next/link";

export const metadata = {
  title: "Swimlanes User Guide — Jhatpat Help",
  description: "Learn how to create, edit, and export Swimlane diagrams on Jhatpat.",
};

export default function SwimlanesGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Swimlanes</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Swimlanes help you show ownership and handoffs. Lanes represent teams/systems, and nodes represent work.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools/diagrams/new?type=swimlanes" className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white">
              Create Swimlane Diagram →
            </Link>
            <Link href="/help" className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">
              ← Help Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <Block title="1) Add lanes">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Use the Swimlanes section in the left sidebar to add Horizontal or Vertical swimlanes.</li>
            <li>Rename lanes from the right Properties panel by selecting the swimlane container.</li>
          </ul>
        </Block>

        <Block title="2) Add symbols (nodes)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag a symbol from the stencil onto the canvas.</li>
            <li>Drop inside a lane to snap into position and stay attached to that lane.</li>
            <li>Drag again to move; drop into another lane to re-snap.</li>
          </ul>
        </Block>

        <Block title="3) Connect nodes">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag from a node handle to another node to create an orthogonal connector.</li>
            <li>Keep edges readable by spacing nodes horizontally within the lane.</li>
          </ul>
        </Block>

        <Block title="4) Export">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Export SVG for docs/slides (crisp at any zoom).</li>
            <li>Export PNG (HD) for screenshots and quick sharing.</li>
          </ul>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>If you see “Read-only”, use “Claim Edit Access” and paste the edit key from the creator device.</li>
            <li>If dragging feels off, refresh the page and try again; then report reproducible steps.</li>
          </ul>
          <div className="mt-4">
            <Link href="/help/faq" className="rounded-2xl border bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50">
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

