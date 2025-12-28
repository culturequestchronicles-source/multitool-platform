import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getNodeById(snapshot: any, nodeId: string) {
  const nodes = Array.isArray(snapshot?.nodes) ? snapshot.nodes : [];
  return nodes.find((n: any) => n?.id === nodeId);
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function isMissingRelation(err: any) {
  const msg = String(err?.message ?? "").toLowerCase();
  const code = String(err?.code ?? "");
  return code === "42P01" || msg.includes("does not exist") || msg.includes("undefined_table");
}

async function safeMaybeInsertPermission(supabase: any, diagramId: string, userId: string) {
  const { error } = await supabase.from("diagram_permissions").insert({
    diagram_id: diagramId,
    user_id: userId,
    role: "owner",
  });

  if (error) {
    // If permissions table doesn't exist, ignore. Otherwise log.
    if (!isMissingRelation(error)) console.error("diagram_permissions insert error:", error);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: parentDiagramId } = await ctx.params;

    const supabase = await supabaseServer(req);
    const { data: auth, error: authErr } = await supabase.auth.getUser();

    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const subprocessNodeId = String(body.subprocessNodeId ?? "").trim();
    if (!subprocessNodeId) {
      return NextResponse.json({ error: "subprocessNodeId required" }, { status: 400 });
    }

    const { data: parent, error: parentErr } = await supabase
      .from("diagrams")
      .select("id, owner_id, name, diagram_type, layout, standards_profile, current_snapshot")
      .eq("id", parentDiagramId)
      .single();

    if (parentErr || !parent) {
      return NextResponse.json(
        { error: parentErr?.message ?? "Parent diagram not found" },
        { status: 404 }
      );
    }

    // Ownership check (sharing paused)
    if (parent.owner_id !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this diagram" }, { status: 403 });
    }

    const parentSnap = parent.current_snapshot ?? { nodes: [], edges: [], meta: {} };
    const node = getNodeById(parentSnap, subprocessNodeId);

    if (!node) {
      return NextResponse.json({ error: "Node not found in current snapshot" }, { status: 400 });
    }
    if (node?.data?.kind !== "subprocess") {
      return NextResponse.json({ error: "Selected node is not a subprocess" }, { status: 400 });
    }
    if (node?.data?.childDiagramId) {
      return NextResponse.json(
        { error: "A child diagram already exists for this node", childDiagramId: node.data.childDiagramId },
        { status: 409 }
      );
    }

    const childName = `${parent.name} — Subprocess Detail`;

    const childStandards = {
      ...(parent.standards_profile ?? {}),
      parent: { diagramId: parentDiagramId, subprocessNodeId },
    };

    // Safer unique node ids for child snapshot
    const startId = `start_${uid()}`;
    const taskId = `task_${uid()}`;
    const endId = `end_${uid()}`;

    const childInitialSnapshot = {
      nodes: [
        {
          id: startId,
          type: "bpmn",
          position: { x: 100, y: 150 },
          data: { kind: "start_event", label: "Start", collapsed: false, meta: {} },
        },
        {
          id: taskId,
          type: "bpmn",
          position: { x: 300, y: 140 },
          data: { kind: "task", label: "Task", collapsed: false, meta: {} },
        },
        {
          id: endId,
          type: "bpmn",
          position: { x: 600, y: 150 },
          data: { kind: "end_event", label: "End", collapsed: false, meta: {} },
        },
      ],
      edges: [
        { id: `e_${uid()}`, source: startId, target: taskId, type: "smoothstep" },
        { id: `e_${uid()}`, source: taskId, target: endId, type: "smoothstep" },
      ],
      meta: { themeId: parentSnap?.meta?.themeId ?? "paper" },
    };

    const { data: child, error: childErr } = await supabase
      .from("diagrams")
      .insert({
        owner_id: auth.user.id,
        name: childName,
        diagram_type: parent.diagram_type || "bpmn",
        layout: parent.layout || "free",
        standards_profile: childStandards,
        current_snapshot: childInitialSnapshot,
      })
      .select("id")
      .single();

    if (childErr || !child) {
      return NextResponse.json(
        { error: childErr?.message ?? "Failed to create child diagram record" },
        { status: 400 }
      );
    }

    const childDiagramId = String(child.id);

    // Patch parent snapshot node with childDiagramId
    const updatedNodes = (Array.isArray(parentSnap.nodes) ? parentSnap.nodes : []).map((n: any) => {
      if (n?.id !== subprocessNodeId) return n;
      return { ...n, data: { ...(n.data ?? {}), childDiagramId } };
    });

    const patchedParentSnap = { ...parentSnap, nodes: updatedNodes };

    const { error: patchError } = await supabase
      .from("diagrams")
      .update({ current_snapshot: patchedParentSnap })
      .eq("id", parentDiagramId);

    if (patchError) {
      // Not fatal for child creation, but user will lose link on refresh if this fails.
      console.error("Parent patch failed:", patchError);
    }

    await safeMaybeInsertPermission(supabase, childDiagramId, auth.user.id);

    return NextResponse.json({ ok: true, childDiagramId }, { status: 200 });
  } catch (e: any) {
    console.error("CRITICAL API ERROR:", e);
    return NextResponse.json(
      { error: e?.message ?? "An internal server error occurred" },
      { status: 500 }
    );
  }
}
