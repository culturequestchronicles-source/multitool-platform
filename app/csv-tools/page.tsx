import type { Metadata } from "next";
import Link from "next/link";
import { absUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "CSV Tools — Convert CSV, Compare CSV, Export XLSX | Jhatpat",
  description: "CSV tools for converting CSV↔JSON, exporting XLSX, and comparing CSV files by key.",
  alternates: { canonical: absUrl("/csv-tools") },
  openGraph: {
    title: "CSV Tools — Jhatpat",
    description: "Convert, compare, and export CSV data with simple tools.",
    url: absUrl("/csv-tools"),
    type: "website",
  },
  robots: { index: true, follow: true },
};

const CSV_TOOLS = [
  { href: "/tools/csv-to-json", title: "CSV to JSON", desc: "Upload or paste CSV and convert to JSON." },
  { href: "/tools/json-to-csv", title: "JSON to CSV", desc: "Convert JSON arrays into CSV format." },
  { href: "/tools/csv-to-excel", title: "CSV to Excel", desc: "Convert a CSV file into XLSX." },
  { href: "/tools/csv-diff", title: "CSV Diff", desc: "Compare two CSVs using a primary key column." },
];

export default function CsvToolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-black text-slate-900">CSV Tools</h1>
      <p className="mt-2 text-sm text-slate-600">
        Convert and compare CSV data for quick developer workflows.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CSV_TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border bg-white p-5 hover:bg-slate-50">
            <div className="text-base font-extrabold text-slate-900">{t.title}</div>
            <div className="mt-1 text-sm text-slate-600">{t.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}

