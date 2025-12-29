import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/app/api/pdf/pdf-to-word/route": [
        "./node_modules/pdf-parse/**",
        "./node_modules/pdfjs-dist/**",
      ],
    },
  },
  async headers() {
    return [
      {
        // Fixed source to apply to ALL routes in your application
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data:;",
              "font-src 'self' data:;",
              "connect-src 'self' vitals.vercel-insights.com;",
              "frame-ancestors 'none';", // Extra protection against clickjacking
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
