import { NextResponse } from "next/server";
import { supabaseApi } from "@/lib/supabase/api";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const supabase = await supabaseApi(req);

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    const user = auth.user;

    const { data: row, error: selectErr } = await supabase
      .from("diagrams")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      id,
      authErr: authErr?.message ?? null,
      user: user ? { id: user.id, email: user.email } : null,
      selectError: selectErr?.message ?? null,
      diagramFound: !!row,
      diagram: row ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
