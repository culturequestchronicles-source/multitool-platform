import type { Metadata } from "next";
import MergePdfClient from "./MergePdfClient";

export const metadata: Metadata = {
  title: "Merge PDF Online — Free & Private | Jhatpat",
  description:
    "Merge multiple PDF files into one instantly. Fast, private, and easy to use.",
  alternates: { canonical: "https://jhatpat.com/tools/pdf/merge" },
  openGraph: {
    title: "Merge PDF Online — Jhatpat",
    description: "Merge multiple PDFs into one instantly. Fast and private.",
    url: "https://jhatpat.com/tools/pdf/merge",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <MergePdfClient />;
}
