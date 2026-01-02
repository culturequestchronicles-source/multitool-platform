import type { NextConfig } from "next";

function buildCsp() {
  // Allow Supabase + websockets + Vercel analytics
  // If you later add PostHog etc, you must add their domains too.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  let supabaseOrigin = "";
  try {
    supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  } catch {
    supabaseOrigin = "";
  }

  const connectSrc = [
    "'self'",
    "vitals.vercel-insights.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://*.supabase.in",
    "wss://*.supabase.in",
  ];

  // If your project URL is a custom host, include it explicitly too
  if (supabaseOrigin) connectSrc.push(supabaseOrigin);

  return [
    "default-src 'self';",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com;",
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' blob: data:;",
    "font-src 'self' data:;",
    `connect-src ${connectSrc.join(" ")};`,
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self';",
  ].join(" ");
}

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/app/api/pdf/pdf-to-word/route": ["./node_modules/pdfjs-dist/**"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: buildCsp() },
        ],
      },
    ];
  },
};

export default nextConfig;
