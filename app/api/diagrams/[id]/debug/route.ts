// app/api/diagrams/[id]/debug/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const supabase = supabaseAdmin();

    const { data: row, error: selectErr } = await supabase
      .from("diagrams")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    // ✅ sanitize sensitive fields
    const safe = row ? { ...row } : null;
    if (safe && "edit_key" in safe) delete (safe as any).edit_key;

    return NextResponse.json({
      ok: true,
      id,
      auth: "public-mode",
      selectError: selectErr?.message ?? null,
      diagramFound: !!row,
      diagram: safe,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
