import type { Node, Edge } from "@xyflow/react";

/**
 * We store hierarchy as:
 *   node.data.parentNodeId = "subprocessNodeId"
 *
 * Collapse behavior:
 * - If any ancestor subprocess is collapsed => node.hidden = true
 * - Edges hidden if either endpoint hidden
 *
 * IMPORTANT FOR DRAG SMOOTHNESS:
 * - Do NOT recreate every node/edge object on every render.
 * - Keep object references stable unless a property actually changed.
 *   (XYFlow drag becomes jittery if you replace objects continuously.)
 */
export function computeVisibility(nodes: Node[], edges: Edge[]) {
  const nodeById = new Map<string, Node>(nodes.map((n) => [n.id, n]));

  const isCollapsed = (id: string) => Boolean((nodeById.get(id)?.data as any)?.collapsed);

  const parentOf = (id: string): string | null => {
    const pid = (nodeById.get(id)?.data as any)?.parentNodeId;
    return typeof pid === "string" && pid.length ? pid : null;
    };

  const isHiddenByAncestors = (id: string) => {
    let p = parentOf(id);
    let guard = 0;
    while (p && guard < 50) {
      if (isCollapsed(p)) return true;
      p = parentOf(p);
      guard++;
    }
    return false;
  };

  // Keep node references stable when hidden flag doesn't change
  const visibleNodes = nodes.map((n) => {
    const nextHidden = isHiddenByAncestors(n.id);
    if ((n as any).hidden === nextHidden) return n;
    return { ...n, hidden: nextHidden };
  });

  const hiddenSet = new Set(visibleNodes.filter((n: any) => n.hidden).map((n) => n.id));

  // Keep edge references stable when hidden flag doesn't change
  const visibleEdges = edges.map((e) => {
    const nextHidden = hiddenSet.has(e.source) || hiddenSet.has(e.target);
    if ((e as any).hidden === nextHidden) return e;
    return { ...e, hidden: nextHidden };
  });

  return { visibleNodes, visibleEdges };
}
