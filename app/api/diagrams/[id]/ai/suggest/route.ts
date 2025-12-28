import { NextResponse } from "next/server";
import { supabaseApi } from "@/lib/supabase/api";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const supabase = await supabaseApi(req);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const prompt = (body?.prompt ?? "").toString().slice(0, 4000);

  // Placeholder response (so your UI can be built now)
  // Later we’ll replace with real OpenAI call (you already have openai pkg).
  return NextResponse.json({
    ok: true,
    diagram_id: id,
    suggestions: [
      "Add a Task after Start: 'Receive Request'",
      "Add an XOR Gateway: 'Valid?' with two branches",
      "Add an End Event for 'Rejected' and another End for 'Approved'",
    ],
    prompt,
  });
}
