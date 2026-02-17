import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase SSR client bound to Next.js cookies().
 * Use this in Server Actions / Route Handlers when you need the *user* session.
 */
export async function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieStore: any = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof cookieStore.getAll === "function") return cookieStore.getAll();
        return [];
      },
      setAll(cookiesToSet) {
        if (typeof cookieStore.set !== "function") return;
        cookiesToSet.forEach(({ name, value, options }: any) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

