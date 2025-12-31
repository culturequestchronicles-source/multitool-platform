import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await supabaseServer(req);
  await supabase.auth.signOut();
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/login", origin));
}
