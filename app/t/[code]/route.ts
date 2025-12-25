import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  const row = await supabaseServer
    .from("tiny_urls")
    .select("original_url")
    .eq("code", code)
    .maybeSingle();

  if (!row.data?.original_url) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.redirect(row.data.original_url, 302);
}
