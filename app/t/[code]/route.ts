import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  // TODO: Replace this with your real lookup (Supabase/DB)
  // Example placeholder redirect:
  const destination = "https://example.com";

  return NextResponse.redirect(destination, 302);
}
