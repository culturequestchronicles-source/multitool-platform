import { NextResponse } from "next/server";
import { supabaseApi } from "@/lib/supabase/api";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const supabase = await supabaseApi(req);

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    const user = auth.user;
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const snapshot = body?.snapshot;

    if (!snapshot && !name) {
      return NextResponse.json(
        { error: "Nothing to save. Provide { name?, snapshot? }" },
        { status: 400 }
      );
    }

    const update: any = {
      updated_at: new Date().toISOString(),
    };

    if (name && name.length > 0) update.name = name;
    if (snapshot) update.current_snapshot = snapshot;

    const { error } = await supabase
      .from("diagrams")
      .update(update)
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
