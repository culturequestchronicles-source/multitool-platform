"use client";

import Link from "next/link";
import { useMemo } from "react";

type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: string;
  badge?: string;
  requiresLogin?: boolean;
};

export default function ToolCard({
  title,
  description,
  href,
  icon = "⚡",
  badge,
  requiresLogin = false,
}: ToolCardProps) {
  const loginHref = useMemo(() => {
    const dest = href.startsWith("/") ? href : `/${href}`;
    return `/login?next=${encodeURIComponent(dest)}`;
  }, [href]);

  const finalHref = requiresLogin ? loginHref : href;

  return (
    <Link
      href={finalHref}
      style={{
        display: "block",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        background: "white",
        textDecoration: "none",
        color: "#0f172a",
        transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 14px 34px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#cbd5e1";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 24px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e5e7eb";
      }}
      aria-label={`${title} tool`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 950, letterSpacing: -0.2 }}>
              {title}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.45,
              }}
            >
              {description}
            </div>
          </div>
        </div>

        {badge ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#0f172a",
              color: "white",
              border: "1px solid rgba(15,23,42,0.18)",
              height: "fit-content",
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 800 }}>
          {requiresLogin ? "Login required →" : "Open tool →"}
        </div>
        <div style={{ fontSize: 14, color: "#0f172a" }}>→</div>
      </div>
    </Link>
  );
}
