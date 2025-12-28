import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"; // Vercel Analytics
import Script from "next/script"; // For Google AdSense
import Link from "next/link";

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
  description: "Secure web utilities featuring instant TinyURL shortening, realistic dummy data generation for developers, and professional PDF tools. All processing happens in-browser for 100% privacy.",
  keywords: [
    "TinyURL generator", "Dummy Data Generator", "URL Shortener", "JSON Test Data",
    "PDF tools", "Merge PDF", "CSV to JSON", "Slug Generator", "Box Shadow", 
    "GUID Generator", "Web Utilities", "Jhatpat"
  ],
  authors: [{ name: "Jhatpat Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jhatpat.com",
    siteName: "Jhatpat Utilities",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script - Replace ca-pub-XXXXXXXXXXXXXXXX with your actual ID */}
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#fcfcfd", color: "#111827" }}>
        {/* Navigation Bar with Key Highlights */}
        <nav style={navStyle}>
          <div style={navContainer}>
            <Link href="/" style={logoStyle}>Jhatpat</Link>
            <div style={linksStyle}>
              <Link href="/tools/generators/tinyurl" style={highlightLink}>Shorten URL</Link>
              <Link href="/tools/generators/dummy-data" style={highlightLink}>Generate Data</Link>
              <div style={divider} />
              <Link href="/#tools" style={navLink}>All Tools</Link>
            </div>
          </div>
        </nav>

        <main>{children}</main>
        
        {/* Vercel Analytics Component */}
        <Analytics />

        {/* Highlighted Footer Section */}
        <footer style={footerStyle}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'left', marginBottom: '40px' }}>
              <div>
                <h3 style={footerHeading}>🚀 Rapid Generation</h3>
                <p>Create **TinyURLs** and **Realistic Dummy Datasets** in seconds. Optimized for developer workflows and testing environments.</p>
              </div>
              <div>
                <h3 style={footerHeading}>🔒 Privacy First</h3>
                <p>Whether you&apos;re merging PDFs or generating passwords, your data never leaves your machine. We use client-side processing for total security.</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', fontSize: '13px' }}>
              <p>© {new Date().getFullYear()} Jhatpat.com — Built for speed, designed for privacy.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

// Styles
const navStyle: React.CSSProperties = {
  background: "#ffffff",
  borderBottom: "1px solid #e5e7eb",
  padding: "0.75rem 0",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const navContainer: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
};

const logoStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
  color: "#2563eb",
  textDecoration: "none",
  letterSpacing: "-1.5px",
};

const linksStyle: React.CSSProperties = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
};

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#4b5563",
  fontWeight: 500,
  fontSize: "14px",
};

const highlightLink: React.CSSProperties = {
  ...navLink,
  color: "#2563eb",
  fontWeight: 700,
};

const divider: React.CSSProperties = {
  width: "1px",
  height: "20px",
  background: "#e5e7eb",
};

const footerStyle: React.CSSProperties = {
  padding: "60px 0 30px",
  color: "#6b7280",
  fontSize: "14px",
  borderTop: "1px solid #e5e7eb",
  marginTop: "80px",
  background: "#ffffff",
};

const footerHeading: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#111827",
  marginBottom: "12px",
};
