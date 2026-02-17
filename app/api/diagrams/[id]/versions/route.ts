// app/api/diagrams/[id]/versions/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readEditKey } from "@/lib/diagrams/editKey";

export const dynamic = "force-dynamic";

// GET /api/diagrams/:id/versions
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const supabase = supabaseAdmin();

    const editKey = readEditKey(req);
    if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

    const { data: diagram } = await supabase.from("diagrams").select("id, edit_key").eq("id", id).maybeSingle();
    if (!diagram) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    if (diagram.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: versions, error: vErr } = await supabase
      .from("diagram_versions")
      .select("id, version_number, label, created_at, is_auto_saved, retention_tier")
      .eq("diagram_id", id)
      .order("version_number", { ascending: false });

    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 400 });

    return NextResponse.json({ ok: true, versions: versions ?? [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}

// POST /api/diagrams/:id/versions (manual checkpoint)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const supabase = supabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const editKey = readEditKey(req, body);
    if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

    const label = String(body?.label ?? "").trim() || null;

    const { data: diagram } = await supabase
      .from("diagrams")
      .select("id, edit_key, current_snapshot")
      .eq("id", id)
      .maybeSingle();

    if (!diagram) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    if (diagram.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: last } = await supabase
      .from("diagram_versions")
      .select("version_number")
      .eq("diagram_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (last?.version_number ?? 0) + 1;

    const { data: created, error: cErr } = await supabase
      .from("diagram_versions")
      .insert({
        diagram_id: id,
        version_number: nextVersion,
        snapshot: diagram.current_snapshot ?? {},
        is_auto_saved: false,
        retention_tier: "long",
        label,
      })
      .select("id")
      .single();

    if (cErr || !created) return NextResponse.json({ error: cErr?.message ?? "Failed" }, { status: 400 });

    return NextResponse.json({ ok: true, versionId: created.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
