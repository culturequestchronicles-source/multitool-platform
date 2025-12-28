import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 (Turbopack/proxy) safe Supabase server client.
 * Some runtimes don't provide cookieStore.getAll(). We fallback safely.
 */
export async function supabaseServer(req?: Request) {
  const cookieStore: any = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Standard Next cookie store (preferred)
          if (typeof cookieStore.getAll === "function") {
            return cookieStore.getAll();
          }

          // Fallback: parse from request header if provided
          if (req) {
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
          }

          // No cookies available
          return [];
        },

        setAll(cookiesToSet) {
          // Standard Next cookie store (preferred)
          if (typeof cookieStore.set === "function") {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options);
            });
          }
          // If set() is not available, session persistence may not work in this runtime.
        },
      },
    }
  );
}
