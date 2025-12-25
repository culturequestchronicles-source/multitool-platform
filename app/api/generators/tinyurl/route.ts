import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";

function normalizeUrl(input: string) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url;
}

async function validateReachable(url: string) {
  // HEAD first, fallback to GET if HEAD blocked
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    if (head.ok) return true;

    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });

    return get.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function makeCode() {
  // 7 chars URL-safe
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const original_url = normalizeUrl(url);

    // Basic sanity check
    try {
      new URL(original_url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // ✅ Internet validation every time
    const reachable = await validateReachable(original_url);
    if (!reachable) {
      return NextResponse.json(
        { error: "URL is not reachable. Please check the link and try again." },
        { status: 400 }
      );
    }

    // ✅ Uniqueness mechanism: same original_url returns same code
    const existing = await supabaseServer
      .from("tiny_urls")
      .select("code, original_url")
      .eq("original_url", original_url)
      .maybeSingle();

    if (existing.data?.code) {
      return NextResponse.json({
        code: existing.data.code,
        original_url: existing.data.original_url,
      });
    }

    // Create unique code (retry on collision)
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();

      const insert = await supabaseServer
        .from("tiny_urls")
        .insert({ code, original_url })
        .select("code, original_url")
        .single();

      if (!insert.error && insert.data) {
        return NextResponse.json(insert.data);
      }

      // If collision on code, retry; otherwise return error
      const msg = insert.error?.message || "";
      if (!msg.toLowerCase().includes("duplicate")) {
        return NextResponse.json(
          { error: "Database error: " + msg },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate unique code. Try again." },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
