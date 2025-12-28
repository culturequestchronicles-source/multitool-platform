import { NextResponse } from "next/server";
import { supabaseApi } from "@/lib/supabase/api";

export const runtime = "nodejs";

/**
 * POST /api/diagrams/create
 * - Form POST: no body required
 * - JSON POST: { name?: string, diagram_type?: string }
 */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;

  try {
    const supabase = await supabaseApi(req);

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    const user = auth.user;

    if (authErr || !user) {
      return NextResponse.redirect(new URL("/login", origin));
    }

    // Read optional JSON body (safe for form-posts with no JSON)
    let body: any = null;
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await req.json();
      }
    } catch {
      body = null;
    }

    const diagramTypeRaw = body?.diagram_type;
    const diagramType =
      diagramTypeRaw === "business_process_flow" ||
      diagramTypeRaw === "swimlane" ||
      diagramTypeRaw === "system_architecture" ||
      diagramTypeRaw === "org_chart" ||
      diagramTypeRaw === "decision_flow"
        ? diagramTypeRaw
        : "business_process_flow";

    const nameRaw = body?.name;
    const name =
      typeof nameRaw === "string" && nameRaw.trim().length > 0
        ? nameRaw.trim()
        : "Untitled Diagram";

    // Default standards profiles by type (safe defaults)
    const standardsProfile =
      diagramType === "business_process_flow"
        ? { standard: "BPMN", version: "2.0", mode: "process" }
        : diagramType === "swimlane"
        ? { standard: "BPMN", version: "2.0", mode: "collaboration" }
        : diagramType === "system_architecture"
        ? {
            standard: "TOGAF",
            domains: ["Business", "Application", "Data", "Technology"],
            dodaf: { version: "2.02" },
            architecture_types: ["Technical", "Enterprise", "Solution"],
          }
        : diagramType === "org_chart"
        ? { standard: "OrgChart", mode: "tree" }
        : { standard: "DecisionFlow", mode: "branching" };

    const { data: created, error } = await supabase
      .from("diagrams")
      .insert({
        owner_id: user.id,
        name,
        diagram_type: diagramType,
        standards_profile: standardsProfile,
        current_snapshot: {}, // client editor will populate on first save
      })
      .select("id")
      .single();

    if (error || !created) {
      // show real insert errors (RLS/column mismatch/etc.)
      return NextResponse.json(
        { error: error?.message ?? "Failed to create diagram" },
        { status: 400 }
      );
    }

    return NextResponse.redirect(new URL(`/tools/diagrams/${created.id}`, origin));
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
