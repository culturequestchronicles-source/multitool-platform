import { NextResponse } from "next/server";
import { supabaseApi } from "@/lib/supabase/api";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const origin = new URL(req.url).origin;

  try {
    const supabase = await supabaseApi(req);

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    const user = auth.user;
    if (authErr || !user) {
      return NextResponse.redirect(new URL("/login", origin));
    }

    const { data: diagram, error: dErr } = await supabase
      .from("diagrams")
      .select("id, owner_id, current_snapshot")
      .eq("id", id)
      .maybeSingle();

    if (dErr) {
      return NextResponse.json({ error: dErr.message }, { status: 400 });
    }
    if (!diagram) {
      return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    }
    if (diagram.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: latest, error: lErr } = await supabase
      .from("diagram_versions")
      .select("version_number")
      .eq("diagram_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lErr) {
      return NextResponse.json({ error: lErr.message }, { status: 400 });
    }

    const nextNumber = (latest?.version_number ?? 0) + 1;

    const { data: versionRow, error: vErr } = await supabase
      .from("diagram_versions")
      .insert({
        diagram_id: id,
        version_number: nextNumber,
        snapshot: diagram.current_snapshot ?? {},
        created_by: user.id,
        is_auto_saved: false,
        retention_tier: "long",
        label: `Checkpoint ${nextNumber}`,
      })
      .select("id")
      .single();

    if (vErr || !versionRow) {
      return NextResponse.json(
        { error: vErr?.message ?? "Failed to create version" },
        { status: 400 }
      );
    }

    const { error: uErr } = await supabase
      .from("diagrams")
      .update({ current_version_id: versionRow.id })
      .eq("id", id)
      .eq("owner_id", user.id);

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 400 });
    }

    return NextResponse.redirect(new URL(`/tools/diagrams/${id}`, origin));
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
