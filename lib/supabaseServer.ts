import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (uses SERVICE ROLE key).
 * IMPORTANT: Never expose this key to the browser.
 */
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
