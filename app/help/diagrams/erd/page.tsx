import Link from "next/link";

export const metadata = {
  title: "ERD User Guide — Jhatpat Help",
  description: "Learn how to create ERD diagrams: entities, fields, PK/FK, notation toggle, and SQL/PDF export.",
};

export default function ErdGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Entity Relationship Diagrams (ERD)</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Build table-style ERDs like pro tools: entities (tables), fields (columns), and relationships (FK links).
            Toggle Crow’s Foot vs Chen notation and export SQL/PDF for documentation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools/diagrams/new?type=erd" className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white">
              Create ERD →
            </Link>
            <Link href="/help" className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">
              ← Help Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <Block title="1) Add entities (tables)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag Entity onto the canvas. Use Weak Entity when you want double-border styling.</li>
            <li>Double-click the header to rename the table.</li>
          </ul>
        </Block>

        <Block title="2) Add/edit fields (columns)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Select an Entity → use the Properties panel → add a new field.</li>
            <li>Edit field name and data type (e.g., uuid, int, varchar(255)).</li>
            <li>Toggle PK / FK / Nullable / Unique per field.</li>
            <li>For FK, select the referenced Entity and referenced PK field.</li>
          </ul>
        </Block>

        <Block title="3) Connect entities (relationships)">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Drag from a handle on one entity to another to create a relationship edge.</li>
            <li>Use the toolbar toggle to switch Notation: Crow’s Foot vs Chen.</li>
          </ul>
        </Block>

        <Block title="4) Import/Export">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Export JSON to share/re-import the ERD state later.</li>
            <li>Export SQL to generate PostgreSQL DDL from your entities + FK field references.</li>
            <li>Import SQL (reverse engineering): paste CREATE TABLE statements to generate entities and FK edges.</li>
            <li>Export PDF to get the diagram image + a data dictionary section.</li>
          </ul>
        </Block>

        <Block title="5) Auto-layout">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>Use Auto-Layout to place entities in a clean grid quickly.</li>
            <li>Then fine-tune by dragging; grid snapping is 15px to keep things aligned.</li>
          </ul>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>If SQL import misses a constraint, share the DDL snippet and we’ll improve the parser.</li>
            <li>If edges overlap, run Auto-Layout, then manually space out highly connected tables.</li>
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

