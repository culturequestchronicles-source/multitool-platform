import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (uses SERVICE ROLE key).
 * IMPORTANT: Never expose this key to the browser.
 */
export function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase credentials are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
