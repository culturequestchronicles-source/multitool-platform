import type { Metadata, Viewport } from "next";
import "./globals.css";
import RootShell from "@/components/RootShell";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/schema";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jhatpat.com"),
  alternates: { canonical: "https://jhatpat.com" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // optional: stronger directives
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  title: {
    default: "Jhatpat — Fast Web Utilities (TinyURL, Dummy Data, PDF Tools)",
    template: "%s | Jhatpat",
  },
  description:
    "Fast web utilities: TinyURL shortener, realistic dummy data generator, CSV tools, diff checker, and professional PDF tools. Privacy-first and easy to use.",
  keywords: [
    "TinyURL generator",
    "Dummy Data Generator",
    "URL Shortener",
    "JSON Test Data",
    "CSV to JSON",
    "CSV to Excel",
    "Diff checker",
    "PDF tools",
    "Merge PDF",
    "Split PDF",
    "PDF to Word",
    "Word to PDF",
    "Jhatpat",
    "Web Utilities",
  ],
  authors: [{ name: "Jhatpat Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jhatpat.com",
    siteName: "Jhatpat Utilities",
    title: "Jhatpat — Fast Web Utilities",
    description:
      "TinyURL, dummy data, CSV tools, diff checker, and PDF tools. Privacy-first web utilities.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jhatpat — Fast Web Utilities",
    description:
      "TinyURL, dummy data, CSV tools, diff checker, and PDF tools. Privacy-first web utilities.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#fcfcfd",
          color: "#111827",
        }}
      >
        <JsonLd id="jsonld-org" value={organizationJsonLd()} />
        <JsonLd id="jsonld-website" value={websiteJsonLd()} />
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
