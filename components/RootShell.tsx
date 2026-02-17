// components/RootShell.tsx
"use client";

import React, { useMemo } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideFooter = useMemo(() => {
    return pathname?.startsWith("/tools/diagrams/");
  }, [pathname]);

  const isDiagramEditor = pathname?.startsWith("/tools/diagrams/");

  return (
    <>
      <Script
        id="adsense-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
      />

      <nav
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0.75rem 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
          }}
        >
          <a
            href="/"
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#2563eb",
              textDecoration: "none",
              letterSpacing: "-1.5px",
            }}
          >
            Jhatpat
          </a>

          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <a href="/tools/generators/tinyurl" style={{ textDecoration: "none", color: "#2563eb", fontWeight: 700, fontSize: "14px" }}>
              Shorten URL
            </a>
            <a href="/tools/generators/dummy-data" style={{ textDecoration: "none", color: "#2563eb", fontWeight: 700, fontSize: "14px" }}>
              Generate Data
            </a>
            <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
            <a href="/#tools" style={{ textDecoration: "none", color: "#4b5563", fontWeight: 500, fontSize: "14px" }}>
              All Tools
            </a>
            <a href="/help" style={{ textDecoration: "none", color: "#4b5563", fontWeight: 500, fontSize: "14px" }}>
              Help
            </a>
          </div>
        </div>
      </nav>

      <main className={isDiagramEditor ? "h-[calc(100dvh-56px)] overflow-hidden" : ""}>{children}</main>

      <Analytics />

      {!hideFooter && (
        <footer
          style={{
            padding: "60px 0 30px",
            color: "#6b7280",
            fontSize: "14px",
            borderTop: "1px solid #e5e7eb",
            marginTop: "80px",
            background: "#ffffff",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "40px",
                textAlign: "left",
                marginBottom: "40px",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12 }}>🚀 Rapid Generation</h3>
                <p>
                  Create <strong>TinyURLs</strong> and <strong>Realistic Dummy Datasets</strong> in seconds.
                  Optimized for developer workflows and testing environments.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12 }}>🔒 Privacy First</h3>
                <p>
                  Whether you're merging PDFs or generating passwords, your data never leaves your machine.
                  We use client-side processing for total security.
                </p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20, fontSize: 13 }}>
              <p>© {new Date().getFullYear()} Jhatpat.com — Built for speed, designed for privacy.</p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
