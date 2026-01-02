import type { Node, Edge } from "@xyflow/react";

export type LayoutMode = "free" | "tree_lr" | "tree_tb";

/**
 * Very light-weight tree layout:
 * - We compute a spanning tree from "start_event" if present, else first node.
 * - Positions are assigned by depth and order.
 * - Only runs on the provided nodes (caller should pass visible nodes).
 */
export function applyLayout(nodes: Node[], edges: Edge[], mode: LayoutMode): Node[] {
  if (mode === "free") return nodes;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const out = new Map<string, string[]>();
  const inc = new Map<string, number>();

  for (const n of nodes) {
    out.set(n.id, []);
    inc.set(n.id, 0);
  }

  for (const e of edges) {
    if (!nodeById.has(e.source) || !nodeById.has(e.target)) continue;
    out.get(e.source)!.push(e.target);
    inc.set(e.target, (inc.get(e.target) ?? 0) + 1);
  }

  // pick root: start_event if available else node with lowest indegree else first node
  const start = nodes.find((n) => (n.data as any)?.kind === "start_event")?.id;
  let root = start ?? nodes[0]?.id ?? "root";
  if (!start) {
    let best = root;
    let bestIn = Infinity;
    for (const n of nodes) {
      const d = inc.get(n.id) ?? 0;
      if (d < bestIn) {
        bestIn = d;
        best = n.id;
      }
    }
    root = best;
  }

  const depth = new Map<string, number>();
  const order: string[] = [];
  const seen = new Set<string>();

  const q: string[] = [root];
  depth.set(root, 0);
  seen.add(root);

  while (q.length) {
    const cur = q.shift()!;
    order.push(cur);
    const children = out.get(cur) ?? [];
    for (const c of children) {
      if (seen.has(c)) continue;
      seen.add(c);
      depth.set(c, (depth.get(cur) ?? 0) + 1);
      q.push(c);
    }
  }

  // add disconnected nodes after
  for (const n of nodes) {
    if (!seen.has(n.id)) {
      seen.add(n.id);
      depth.set(n.id, 0);
      order.push(n.id);
    }
  }

  // group by depth
  const byDepth = new Map<number, string[]>();
  for (const id of order) {
    const d = depth.get(id) ?? 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(id);
  }

  const gapX = 260;
  const gapY = 160;

  const positioned = nodes.map((n) => ({ ...n }));

  for (const [d, ids] of byDepth.entries()) {
    ids.forEach((id, idx) => {
      const n = positioned.find((x) => x.id === id);
      if (!n) return;

      if (mode === "tree_lr") {
        n.position = { x: d * gapX + 80, y: idx * gapY + 80 };
      } else {
        // tree_tb
        n.position = { x: idx * gapX + 80, y: d * gapY + 80 };
      }
    });
  }

  return positioned;
}
