import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

function isHttpUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  const { data, error } = await supabase
    .from("tinyurls")
    .select("original_url")
    .eq("code", code)
    .maybeSingle();

  if (error || !data?.original_url || !isHttpUrl(data.original_url)) {
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }

  return NextResponse.redirect(data.original_url, { status: 302 });
}
