import type { Metadata } from "next";
import { getToolSeo, toolUrl } from "@/lib/seo/tools";

const tool = getToolSeo("/tools/diagrams/new");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: toolUrl(tool.path) },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

