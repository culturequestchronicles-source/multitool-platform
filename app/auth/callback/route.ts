import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const cookieStore: any = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Next.js 16 cookie store sometimes lacks getAll() in route handlers.
          if (typeof cookieStore.getAll === "function") {
            return cookieStore.getAll();
          }

          // Fallback: parse Cookie header (read-only)
          const cookieHeader = req.headers.get("cookie") || "";
          if (!cookieHeader) return [];

          return cookieHeader
            .split(";")
            .map((c) => c.trim())
            .filter(Boolean)
            .map((pair) => {
              const idx = pair.indexOf("=");
              const name = idx >= 0 ? pair.slice(0, idx) : pair;
              const value = idx >= 0 ? pair.slice(idx + 1) : "";
              return { name, value };
            });
        },

        setAll(cookiesToSet) {
          // If cookieStore.set exists, use it
          if (typeof cookieStore.set === "function") {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options);
            });
          }
          // Note: if cookieStore.set doesn't exist in your runtime, Supabase
          // cannot persist the session cookie here. In that case we’ll move
          // auth exchange into a page+server action, but usually set() exists.
        },
      },
    }
  );

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/tools/diagrams", url.origin));
}
