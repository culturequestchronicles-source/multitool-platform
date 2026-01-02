import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function resolveOrigin(req: Request) {
  const explicitOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitOrigin) return explicitOrigin.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  return new URL(req.url).origin;
}

function safeNextPath(input: unknown) {
  // Only allow internal paths to prevent open-redirect issues.
  // Accept "/tools/diagrams/..." or "/tools/diagrams"
  if (typeof input !== "string") return "/tools/diagrams";
  const trimmed = input.trim();
  if (!trimmed) return "/tools/diagrams";

  // Must start with "/" and must NOT start with "//" (protocol-relative)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/tools/diagrams";

  // Optionally restrict to your app area (recommended)
  // If you want to allow other internal pages, remove this restriction.
  if (!trimmed.startsWith("/tools/diagrams")) return "/tools/diagrams";

  return trimmed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    const next = safeNextPath(body?.next);

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const origin = resolveOrigin(req);

    // ✅ Include next in callback URL so /auth/callback can redirect correctly
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, redirectTo }); // helpful for testing
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
