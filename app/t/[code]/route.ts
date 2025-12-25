import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

// NOTE: Next.js 16 types params as a Promise in the context.
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  // TODO: Replace with your actual lookup logic
  // Example: fetch from Supabase and redirect to original URL
  // const originalUrl = await lookupOriginalUrl(code);

  // Temporary safe behavior (so build passes):
  // If code not found, go home.
  const originalUrl = process.env.TINYURL_FALLBACK_URL || "https://jhatpat.com";

  // If you already have a lookup function, use it and validate:
  // if (!originalUrl) return NextResponse.redirect(new URL("/", _req.url));

  return NextResponse.redirect(originalUrl, { status: 302 });
}
