import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Use in Route Handlers (app/api/**).
 * Next 16 safe: cookieStore might not have getAll().
 */
export async function supabaseApi(req: Request) {
  const cookieStore: any = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof cookieStore.getAll === "function") {
            return cookieStore.getAll();
          }

          // Fallback: parse Cookie header
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
          if (typeof cookieStore.set === "function") {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options);
            });
          }
        },
      },
    }
  );
}
