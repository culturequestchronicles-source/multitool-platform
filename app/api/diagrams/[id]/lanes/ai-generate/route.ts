import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * AI Swimlane generation.
 * Input: title, actors[], nodes[], edges[]
 * Output: { orientation: "horizontal"|"vertical", lanes: string[] }
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: diagramId } = await ctx.params;

    const supabase = await supabaseServer(req);
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "Business Process");
    const actors: string[] = Array.isArray(body?.actors) ? body.actors.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const nodes = Array.isArray(body?.nodes) ? body.nodes : [];
    const edges = Array.isArray(body?.edges) ? body.edges : [];

    // Basic ownership check (matches your other route style)
    const { data: parent, error: parentErr } = await supabase
      .from("diagrams")
      .select("id, owner_id")
      .eq("id", diagramId)
      .single();

    if (parentErr || !parent) return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    if (parent.owner_id !== auth.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Safe fallback: if no key, return lanes from actors
      const lanes = actors.length ? actors.slice(0, 8) : ["Actor 1", "Actor 2"];
      return NextResponse.json({ orientation: "horizontal", lanes, note: "OPENAI_API_KEY missing; used fallback." });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    // Prompt: compact and deterministic
    const prompt = `
You are a BPMN swimlane assistant.
Goal: propose swimlanes (actors/roles/teams) for a process diagram.
Return STRICT JSON only:
{
  "orientation": "horizontal" | "vertical",
  "lanes": string[]
}
Rules:
- lanes must be short labels (1-4 words)
- 2 to 10 lanes
- prefer actors[] if provided, otherwise infer from node actors fields and labels
- orientation: horizontal for typical role-based, vertical if many parallel departments
Input:
title=${JSON.stringify(title)}
actors=${JSON.stringify(actors)}
nodes=${JSON.stringify(nodes)}
edges=${JSON.stringify(edges)}
`.trim();

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return NextResponse.json({ error: `OpenAI error (${resp.status}): ${t.slice(0, 400)}` }, { status: 400 });
    }

    const data = await resp.json().catch(() => ({}));

    // Responses API text extraction
    const text =
      data?.output?.[0]?.content?.map((c: any) => c?.text).filter(Boolean).join("\n") ||
      data?.output_text ||
      "";

    // Parse JSON safely
    let parsed: any = null;
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const candidate = jsonStart >= 0 && jsonEnd >= 0 ? text.slice(jsonStart, jsonEnd + 1) : text;
      parsed = JSON.parse(candidate);
    } catch {
      parsed = null;
    }

    const orientation = parsed?.orientation === "vertical" ? "vertical" : "horizontal";
    const lanesRaw = Array.isArray(parsed?.lanes) ? parsed.lanes : [];
    const lanes = lanesRaw.map((s: any) => String(s).trim()).filter(Boolean).slice(0, 12);

    if (!lanes.length) {
      const fallback = actors.length ? actors.slice(0, 8) : ["Customer", "Agent"];
      return NextResponse.json({ orientation: "horizontal", lanes: fallback, note: "AI returned no lanes; used fallback." });
    }

    return NextResponse.json({ orientation, lanes }, { status: 200 });
  } catch (e: any) {
    console.error("AI lanes error:", e);
    return NextResponse.json({ error: e?.message ?? "Internal server error" }, { status: 500 });
  }
}
