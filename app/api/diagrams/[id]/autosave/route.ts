// app/api/diagrams/[id]/autosave/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readEditKey } from "@/lib/diagrams/editKey";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "Untitled Diagram").slice(0, 120);
    const snapshot = body?.snapshot ?? null;

    if (!snapshot) {
      return NextResponse.json({ ok: false, error: "Missing snapshot" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // ✅ Require edit key and validate against DB
    const editKey = readEditKey(req, body);
    if (!editKey) return NextResponse.json({ ok: false, error: "Missing edit key" }, { status: 401 });

    const { data: diagram, error: dErr } = await supabase
      .from("diagrams")
      .select("id, edit_key")
      .eq("id", id)
      .maybeSingle();

    if (dErr) return NextResponse.json({ ok: false, error: dErr.message }, { status: 400 });
    if (!diagram) return NextResponse.json({ ok: false, error: "Diagram not found" }, { status: 404 });
    if (diagram.edit_key !== editKey) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { error } = await supabase
      .from("diagrams")
      .update({
        name,
        current_snapshot: snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
