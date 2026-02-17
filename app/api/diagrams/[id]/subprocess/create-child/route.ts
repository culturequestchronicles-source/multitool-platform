// app/api/diagrams/[id]/subprocess/create-child/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { newEditKey, readEditKey } from "@/lib/diagrams/editKey";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: parentId } = await params;

  try {
    const supabase = supabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const editKey = readEditKey(req, body);
    if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

    const { subprocessNodeId } = body ?? {};

    const { data: parent, error: pErr } = await supabase
      .from("diagrams")
      .select("id, edit_key, name, diagram_type")
      .eq("id", parentId)
      .maybeSingle();

    if (pErr || !parent) return NextResponse.json({ error: "Parent diagram not found" }, { status: 404 });
    if (parent.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const childName = `Child of ${String(parent.name ?? "Diagram").slice(0, 60)}`;

    const childEditKey = newEditKey();

    const standards_profile = {
      parent: {
        diagramId: parentId,
        subprocessNodeId: String(subprocessNodeId ?? "").trim() || undefined,
      },
    };

    const { data: created, error: cErr } = await supabase
      .from("diagrams")
      .insert({
        name: childName,
        diagram_type: parent.diagram_type,
        layout: "freeform",
        standards_profile,
        current_snapshot: {},
        parent_diagram_id: parentId,
        parent_node_id: String(subprocessNodeId ?? "").trim() || null,
        edit_key: childEditKey,
      })
      .select("id")
      .single();

    if (cErr || !created?.id) {
      return NextResponse.json({ error: cErr?.message ?? "Failed to create child" }, { status: 400 });
    }

    // Return child editKey so browser can save it
    return NextResponse.json({ ok: true, childId: created.id, childEditKey }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
