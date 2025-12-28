import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const supabase = await supabaseServer(req);
    const { data: auth, error: authErr } = await supabase.auth.getUser();

    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const versionId = String(body.versionId ?? "").trim();

    if (!versionId) {
      return NextResponse.json({ error: "versionId required" }, { status: 400 });
    }

    // Load diagram (ownership check)
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

    // Load version snapshot
    const { data: ver, error: vErr } = await supabase
      .from("diagram_versions")
      .select("id, snapshot")
      .eq("id", versionId)
      .eq("diagram_id", id)
      .single();

    if (vErr || !ver) {
      return NextResponse.json({ error: vErr?.message ?? "Version not found" }, { status: 404 });
    }

    // Restore snapshot
    const { error: uErr } = await supabase
      .from("diagrams")
      .update({ current_snapshot: ver.snapshot, current_version_id: ver.id })
      .eq("id", id);

    if (uErr) {
      return NextResponse.json({ error: uErr.message ?? "Restore failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
