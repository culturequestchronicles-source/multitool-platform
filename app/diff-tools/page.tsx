import type { Metadata } from "next";
import Link from "next/link";
import { absUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Diff Tools — Text & CSV Comparison | Jhatpat",
  description: "Diff tools to compare text and CSV content in your browser.",
  alternates: { canonical: absUrl("/diff-tools") },
  openGraph: {
    title: "Diff Tools — Jhatpat",
    description: "Compare text and data side-by-side.",
    url: absUrl("/diff-tools"),
    type: "website",
  },
  robots: { index: true, follow: true },
};

const DIFF_TOOLS = [
  { href: "/tools/diffchecker/text", title: "Text Diff Checker", desc: "Compare two text blocks line-by-line." },
  { href: "/tools/csv-diff", title: "CSV Diff", desc: "Compare two CSVs by key column." },
  { href: "/tools/diffchecker", title: "Diff Hub", desc: "Browse available diff checkers." },
];

export default function DiffToolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-black text-slate-900">Diff Tools</h1>
      <p className="mt-2 text-sm text-slate-600">
        Quick comparison tools for text and structured data.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {DIFF_TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border bg-white p-5 hover:bg-slate-50">
            <div className="text-base font-extrabold text-slate-900">{t.title}</div>
            <div className="mt-1 text-sm text-slate-600">{t.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}

