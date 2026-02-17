// app/api/diagrams/[id]/ai/suggest/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readEditKey } from "@/lib/diagrams/editKey";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const supabase = supabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const editKey = readEditKey(req, body);

  if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

  const { data: diagram } = await supabase.from("diagrams").select("id, edit_key").eq("id", id).maybeSingle();
  if (!diagram) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (diagram.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const prompt = String(body?.prompt ?? "").slice(0, 4000);

  return NextResponse.json(
    {
      ok: true,
      diagram_id: id,
      suggestions: [
        "Add a Task after Start: 'Receive Request'",
        "Add an XOR Gateway: 'Valid?' with two branches",
        "Add an End Event for 'Rejected' and another End for 'Approved'",
      ],
      prompt,
    },
    { status: 200 }
  );
}
