import { supabaseServer } from "@/lib/supabase/server";

export type DiagramType =
  | "bpmn"
  | "swimlanes"
  | "system-architecture"
  | "org-chart"
  | "decision-flow"
  | "erd"
  | "data-architecture"
  | "flowchart"
  | "data-model";

export async function createDiagramOnServer(req: Request, opts: { name: string; type: DiagramType }) {
  const supabase = await supabaseServer(req);
  const { data: auth, error: authErr } = await supabase.auth.getUser();

  if (authErr || !auth?.user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const baseSnapshot = {
    nodes: [
      {
        id: "start",
        type: "bpmn",
        position: { x: 140, y: 200 },
        data: { kind: "start_event", label: "Start", collapsed: false, meta: {} },
      },
      {
        id: "end",
        type: "bpmn",
        position: { x: 560, y: 260 },
        data: { kind: "end_event", label: "End", collapsed: false, meta: {} },
      },
    ],
    edges: [{ id: "e-start-end", source: "start", target: "end", type: "smoothstep" }],
    meta: { themeId: "paper", layoutMode: "free" },
  };

  const { data, error } = await supabase
    .from("diagrams")
    .insert({
      owner_id: auth.user.id,
      name: opts.name || "Untitled Diagram",
      diagram_type: opts.type,
      layout: "free",
      standards_profile: {},
      current_snapshot: baseSnapshot,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { ok: false as const, status: 400, error: error?.message ?? "Failed to create diagram" };
  }

  return { ok: true as const, status: 200, id: String(data.id) };
}
