import type { Metadata } from "next";
import ToolSeoSection from "@/components/seo/ToolSeoSection";
import { getToolSeo, toolUrl } from "@/lib/seo/tools";

const tool = getToolSeo("/tools/pdf/image-to-pdf");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: toolUrl(tool.path) },
  openGraph: {
    title: tool.title,
    description: tool.description,
    url: toolUrl(tool.path),
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolSeoSection tool={tool} />
    </>
  );
}

