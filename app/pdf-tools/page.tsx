import type { Metadata } from "next";
import Link from "next/link";
import { absUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "PDF Tools — Merge, Split, Compress, Convert | Jhatpat",
  description:
    "PDF tools for merging, splitting, compressing, and converting files. Simple workflows with instant downloads.",
  alternates: { canonical: absUrl("/pdf-tools") },
  openGraph: {
    title: "PDF Tools — Jhatpat",
    description: "Merge, split, compress, and convert PDFs with fast utility tools.",
    url: absUrl("/pdf-tools"),
    type: "website",
  },
  robots: { index: true, follow: true },
};

const PDF_TOOLS = [
  { href: "/tools/pdf/merge", title: "Merge PDF", desc: "Combine multiple PDFs into one file." },
  { href: "/tools/pdf/split", title: "Split PDF", desc: "Split a PDF into separate page PDFs." },
  { href: "/tools/pdf/compress", title: "Compress PDF", desc: "Reduce PDF file size." },
  { href: "/tools/pdf/pdf-to-word", title: "PDF to Word", desc: "Convert a PDF into a DOCX file." },
  { href: "/tools/pdf/word-to-pdf", title: "Word to PDF", desc: "Convert a DOCX file into PDF." },
  { href: "/tools/pdf/image-to-pdf", title: "Image to PDF", desc: "Combine images into a single PDF." },
  { href: "/tools/pdf/pdf-to-image", title: "PDF to Image", desc: "Convert PDF pages to PNG and download a ZIP." },
];

export default function PdfToolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-black text-slate-900">PDF Tools</h1>
      <p className="mt-2 text-sm text-slate-600">
        Quick utilities to merge, split, compress, and convert PDFs.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PDF_TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border bg-white p-5 hover:bg-slate-50">
            <div className="text-base font-extrabold text-slate-900">{t.title}</div>
            <div className="mt-1 text-sm text-slate-600">{t.desc}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border bg-slate-50 p-5 text-sm text-slate-700">
        <div className="font-extrabold text-slate-900">Tip</div>
        <div className="mt-1">
          Some converters use server APIs to process uploads. Avoid uploading sensitive documents.
        </div>
      </div>
    </main>
  );
}

