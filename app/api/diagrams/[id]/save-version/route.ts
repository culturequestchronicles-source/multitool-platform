// app/api/diagrams/[id]/save-version/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readEditKey } from "@/lib/diagrams/editKey";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const origin = new URL(req.url).origin;

  try {
    const supabase = supabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const editKey = readEditKey(req, body);
    if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

    // ✅ verify edit key + load snapshot
    const { data: diagram, error: dErr } = await supabase
      .from("diagrams")
      .select("id, edit_key, current_snapshot")
      .eq("id", id)
      .maybeSingle();

    if (dErr) return NextResponse.json({ error: dErr.message }, { status: 400 });
    if (!diagram) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    if (diagram.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Find latest version number
    const { data: latest, error: lErr } = await supabase
      .from("diagram_versions")
      .select("version_number")
      .eq("diagram_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lErr) return NextResponse.json({ error: lErr.message }, { status: 400 });

    const nextNumber = (latest?.version_number ?? 0) + 1;

    const label = String(body?.label ?? "").trim() || `Checkpoint ${nextNumber}`;

    // Insert new version
    const { data: versionRow, error: vErr } = await supabase
      .from("diagram_versions")
      .insert({
        diagram_id: id,
        version_number: nextNumber,
        snapshot: diagram.current_snapshot ?? {},
        created_by: null,
        is_auto_saved: false,
        retention_tier: "long",
        label,
      })
      .select("id")
      .single();

    if (vErr || !versionRow?.id) {
      return NextResponse.json({ error: vErr?.message ?? "Failed to create version" }, { status: 400 });
    }

    // Update diagram pointer
    const { error: uErr } = await supabase
      .from("diagrams")
      .update({ current_version_id: versionRow.id })
      .eq("id", id);

    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });

    // Redirect back to the editor
    return NextResponse.redirect(new URL(`/tools/diagrams/${id}`, origin));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
