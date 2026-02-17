import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;

  const supabase = supabaseServer();

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
