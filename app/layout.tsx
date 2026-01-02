import type { Metadata, Viewport } from "next";
import "./globals.css";
import RootShell from "@/components/RootShell";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jhatpat.com"),
  title: {
    default: "Jhatpat — Fast TinyURL & Realistic Dummy Data Generator",
    template: "%s | Jhatpat",
  },
  description:
    "Secure web utilities featuring instant TinyURL shortening, realistic dummy data generation for developers, and professional PDF tools. All processing happens in-browser for 100% privacy.",
  keywords: [
    "TinyURL generator",
    "Dummy Data Generator",
    "URL Shortener",
    "JSON Test Data",
    "PDF tools",
    "Merge PDF",
    "CSV to JSON",
    "Slug Generator",
    "Box Shadow",
    "GUID Generator",
    "Web Utilities",
    "Jhatpat",
  ],
  authors: [{ name: "Jhatpat Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jhatpat.com",
    siteName: "Jhatpat Utilities",
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
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
