// app/api/diagrams/[id]/restore/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readEditKey } from "@/lib/diagrams/editKey";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = supabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const editKey = readEditKey(req, body);
    if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

    const versionId = String(body.versionId ?? "").trim();
    if (!versionId) return NextResponse.json({ error: "versionId required" }, { status: 400 });

    const { data: diagram } = await supabase.from("diagrams").select("id, edit_key").eq("id", id).maybeSingle();
    if (!diagram) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    if (diagram.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: ver } = await supabase
      .from("diagram_versions")
      .select("id, snapshot")
      .eq("id", versionId)
      .eq("diagram_id", id)
      .maybeSingle();

    if (!ver) return NextResponse.json({ error: "Version not found" }, { status: 404 });

    const { error: uErr } = await supabase
      .from("diagrams")
      .update({ current_snapshot: ver.snapshot, current_version_id: ver.id, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (uErr) return NextResponse.json({ error: uErr.message ?? "Restore failed" }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
