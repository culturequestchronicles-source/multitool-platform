import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("tiny_urls")
    .select("original_url")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to resolve TinyURL" },
      { status: 500 }
    );
  }

  if (!data?.original_url) {
    return NextResponse.json({ error: "TinyURL not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.original_url, 302);
}
