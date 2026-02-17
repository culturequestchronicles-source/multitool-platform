// app/api/diagrams/[id]/lanes/ai-generate/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readEditKey } from "@/lib/diagrams/editKey";

export const runtime = "nodejs";

function uniqNonEmpty(arr: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const a of arr) {
    const v = String(a ?? "").trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = supabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const editKey = readEditKey(req, body);
    if (!editKey) return NextResponse.json({ error: "Missing edit key" }, { status: 401 });

    const { data: diagram } = await supabase.from("diagrams").select("id, edit_key").eq("id", id).maybeSingle();
    if (!diagram) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (diagram.edit_key !== editKey) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const actors: string[] = Array.isArray(body?.actors) ? body.actors : [];
    const lanes = uniqNonEmpty(actors);

    return NextResponse.json(
      { orientation: "horizontal", lanes: lanes.length ? lanes : ["Lane 1", "Lane 2", "Lane 3"] },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
