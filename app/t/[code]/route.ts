import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;

  // ✅ IMPORTANT: supabaseServer is a function, must be called
  const supabase = await supabaseServer(req);

  const { data, error } = await supabase
    .from("tiny_urls")
    .select("original_url")
    .eq("code", code)
    .maybeSingle();

  if (error || !data?.original_url) {
    // fallback to home if invalid code
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.redirect(data.original_url);
}
