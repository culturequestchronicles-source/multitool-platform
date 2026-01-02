import type { Node, Edge } from "@xyflow/react";

/**
 * We store hierarchy as:
 *   node.data.parentNodeId = "subprocessNodeId"
 *
 * Collapse behavior:
 * - If any ancestor subprocess is collapsed => node.hidden = true
 * - Edges hidden if either endpoint hidden
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

  // IMPORTANT: don't filter nodes/edges arrays; mark hidden instead
  const visibleNodes = nodes.map((n) => ({
    ...n,
    hidden: isHiddenByAncestors(n.id),
  }));

  const hiddenSet = new Set(visibleNodes.filter((n) => n.hidden).map((n) => n.id));

  const visibleEdges = edges.map((e) => ({
    ...e,
    hidden: hiddenSet.has(e.source) || hiddenSet.has(e.target),
  }));

  return { visibleNodes, visibleEdges };
}
