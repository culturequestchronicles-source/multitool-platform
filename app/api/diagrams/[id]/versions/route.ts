import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/diagrams/:id/versions  -> list versions
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const supabase = await supabaseServer();
    const { data: auth, error: authErr } = await supabase.auth.getUser();

    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Basic access check (owner only). If you later add sharing, extend this.
    const { data: diagram, error: dErr } = await supabase
      .from("diagrams")
      .select("id, owner_id")
      .eq("id", id)
      .single();

    if (dErr || !diagram) {
      return NextResponse.json({ error: dErr?.message ?? "Diagram not found" }, { status: 404 });
    }

    if (diagram.owner_id !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: versions, error: vErr } = await supabase
      .from("diagram_versions")
      .select("id, version_number, label, created_at, created_by, is_auto_saved, retention_tier")
      .eq("diagram_id", id)
      .order("version_number", { ascending: false });

    if (vErr) {
      return NextResponse.json({ error: vErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, versions: versions ?? [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}

// POST /api/diagrams/:id/versions -> create a new version (optional helper)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const supabase = await supabaseServer(req);
    const { data: auth, error: authErr } = await supabase.auth.getUser();

    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const label = String(body.label ?? "").trim() || null;

    // Load diagram + snapshot
    const { data: diagram, error: dErr } = await supabase
      .from("diagrams")
      .select("id, owner_id, current_snapshot")
      .eq("id", id)
      .single();

    if (dErr || !diagram) {
      return NextResponse.json({ error: dErr?.message ?? "Diagram not found" }, { status: 404 });
    }

    if (diagram.owner_id !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Next version number
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
        created_by: auth.user.id,
        is_auto_saved: false,
        retention_tier: "long",
        label,
      })
      .select("id")
      .single();

    if (cErr || !created) {
      return NextResponse.json({ error: cErr?.message ?? "Failed to create version" }, { status: 400 });
    }

    // Set current_version_id
    await supabase.from("diagrams").update({ current_version_id: created.id }).eq("id", id);

    return NextResponse.json({ ok: true, versionId: created.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
