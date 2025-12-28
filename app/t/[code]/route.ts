import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: _code } = await context.params;
  void _code;

  // TODO: Replace this with your real lookup (Supabase/DB)
  // Example placeholder redirect:
  const destination = "https://example.com";

  return NextResponse.redirect(destination, 302);
}
