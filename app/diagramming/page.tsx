import type { Metadata } from "next";
import Link from "next/link";
import { absUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Diagramming — BPMN, ERD, Swimlanes, Architecture | Jhatpat",
  description: "Create diagrams like BPMN, ERD, swimlanes, and architecture diagrams in your browser.",
  alternates: { canonical: absUrl("/diagramming") },
  openGraph: {
    title: "Diagramming — Jhatpat",
    description: "Browser-based diagramming tools for workflows and architecture.",
    url: absUrl("/diagramming"),
    type: "website",
  },
  robots: { index: true, follow: true },
};

const DIAGRAM_PAGES = [
  { href: "/tools/diagrams", title: "Diagrams Hub", desc: "Create and manage diagrams (recents saved locally)." },
  { href: "/tools/diagrams/system-architecture", title: "System Architecture", desc: "Architecture diagram templates and editor." },
  { href: "/tools/diagrams/erd", title: "ER Diagram (ERD)", desc: "Entity relationship diagrams for data modeling." },
  { href: "/tools/diagrams/swimlanes", title: "Swimlanes", desc: "Swimlane diagramming for processes." },
  { href: "/tools/diagrams/data-architecture", title: "Data Architecture", desc: "Data architecture layout and icons." },
  { href: "/tools/diagrams/bpmn", title: "BPMN", desc: "Business process modeling diagrams." },
];

export default function DiagrammingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-black text-slate-900">Diagramming</h1>
      <p className="mt-2 text-sm text-slate-600">
        Diagramming tools for workflows, architecture, and data modeling.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {DIAGRAM_PAGES.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border bg-white p-5 hover:bg-slate-50">
            <div className="text-base font-extrabold text-slate-900">{t.title}</div>
            <div className="mt-1 text-sm text-slate-600">{t.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}

