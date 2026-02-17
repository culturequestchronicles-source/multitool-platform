import Link from "next/link";

export const metadata = {
  title: "FAQ — Jhatpat Help",
  description: "Frequently asked questions for Swimlanes and ERD diagramming on Jhatpat.",
};

export default function HelpFaqPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">Help Center</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">FAQ</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Common questions and troubleshooting for Swimlanes and ERD.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/help" className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">
              ← Help Home
            </Link>
            <Link href="/help/how-to" className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white">
              How‑to →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <FaqItem q="Why is the editor read‑only on my device?" a="Editing requires an edit key stored in your browser. If you opened a diagram on a different device/browser, you may need to use “Claim Edit Access” and paste the edit key from the device that created it." />
        <FaqItem q="Backspace/Delete removed too much. How do I delete only selected nodes?" a="Select the node(s) you want to remove, then press Backspace/Delete. The swimlane container is protected from keyboard deletion; only selected flow/ERD nodes (and related edges) are removed." />
        <FaqItem q="Why don’t edges show up in exported SVG?" a="If you’re exporting Swimlanes, edges must render above the swimlane background. If you still don’t see edges, re-export and share the SVG file contents so we can verify paths are generated." />
        <FaqItem q="How do I add columns / data types in ERD?" a="Select an ERD Entity, then use the Properties panel: add fields, edit field name/type, and toggle PK/FK/Nullable/Unique. For FK, pick the referenced entity + PK field." />
        <FaqItem q="Crow’s Foot vs Chen — which should I use?" a="Crow’s Foot is common for database design (cardinality markers like 1..N). Chen is useful for conceptual modeling (entities/attributes/relationships). You can toggle notation in the ERD toolbar." />
        <FaqItem q="Can I import SQL to generate an ERD?" a="Yes: ERD → Import SQL. Paste PostgreSQL-style CREATE TABLE statements. The importer is best-effort and focuses on tables/columns/PK/FK. If something doesn’t parse, share the SQL snippet and we’ll harden the parser." />
        <FaqItem q="Can I export a PDF data dictionary?" a="Yes: ERD → Export PDF. Page 1 is the diagram image; following pages include a data dictionary with entities and fields." />
      </section>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{q}</div>
      <div className="mt-2 text-sm leading-7 text-slate-600">{a}</div>
    </div>
  );
}

