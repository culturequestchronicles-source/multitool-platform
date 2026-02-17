// app/api/diagrams/create/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildStarterSnapshot, type DiagramType } from "@/lib/diagrams/createDiagram";
import { newEditKey } from "@/lib/diagrams/editKey";

export const runtime = "nodejs";

function normalizeDiagramType(input: unknown): DiagramType {
  const raw = String(input ?? "").toLowerCase().trim();

  if (raw === "bpmn" || raw.includes("process")) return "business_process_flow";
  if (raw === "swimlanes" || raw === "swimlane") return "swimlane";
  if (raw === "system-architecture" || raw === "system_architecture") return "system_architecture";
  if (raw === "org-chart" || raw === "org_chart") return "org_chart";
  if (raw === "decision-flow" || raw === "decision_flow") return "decision_flow";
  if (raw === "erd" || raw.includes("entity")) return "erd";
  if (raw === "data-architecture" || raw === "data_architecture") return "data_architecture";
  if (raw === "data-model" || raw === "data_model") return "data_model";
  if (raw === "flowchart" || raw === "flow-chart" || raw === "flow_chart") return "flowchart";

  const allowed: DiagramType[] = [
    "business_process_flow",
    "swimlane",
    "system_architecture",
    "org_chart",
    "decision_flow",
    "erd",
    "data_architecture",
    "data_model",
    "flowchart",
  ];
  if ((allowed as string[]).includes(raw)) return raw as DiagramType;

  return "business_process_flow";
}

function looksLikeNetworkFetchFailure(msg: string) {
  const m = String(msg ?? "").toLowerCase();
  return (
    m.includes("fetch failed") ||
    m.includes("econnreset") ||
    m.includes("etimedout") ||
    m.includes("enotfound") ||
    m.includes("socket") ||
    m.includes("network")
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "Untitled Diagram").slice(0, 120);
    const diagram_type = normalizeDiagramType(body?.diagram_type ?? body?.type);

    const starter = buildStarterSnapshot({ diagram_type, name });

    const supabase = supabaseAdmin();

    // ✅ Create an edit key and store it in DB
    const edit_key = newEditKey();
    if (typeof edit_key !== "string" || edit_key.length !== 64) {
      throw new Error(`Invalid edit key length: expected 64, got ${String(edit_key).length}`);
    }

    // ✅ IMPORTANT: do NOT set "layout" here (DB constraint decides)
    const payload = {
      owner_id: null,
      name,
      description: null,
      diagram_type,
      standards_profile: {},
      current_snapshot: starter,
      is_archived: false,
      edit_key,
    };

    // Retry once on transient network errors so local dev doesn't fail with opaque "fetch failed".
    let data: any = null;
    let error: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const r = await supabase.from("diagrams").insert(payload).select("id").single();
      data = r.data;
      error = r.error;
      if (!error) break;
      const msg = String(error?.message ?? "");
      if (attempt === 1 && looksLikeNetworkFetchFailure(msg)) {
        await new Promise((res) => setTimeout(res, 400));
        continue;
      }
      break;
    }

    if (error || !data?.id) {
      const msg = String(error?.message ?? "Failed to create diagram");
      if (looksLikeNetworkFetchFailure(msg)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Supabase request failed from server runtime. Check internet/DNS/proxy and that NEXT_PUBLIC_SUPABASE_URL is reachable from Node.",
            cause: msg,
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: msg,
          code: (error as any)?.code ?? null,
          details: (error as any)?.details ?? null,
          hint: (error as any)?.hint ?? null,
        },
        { status: 400 }
      );
    }

    // ✅ Return editKey so the client can store it in localStorage
    return NextResponse.json({ ok: true, id: data.id, diagram_type, editKey: edit_key });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
