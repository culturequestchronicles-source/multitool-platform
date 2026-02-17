import type { Edge, Node } from "@xyflow/react";
import type { DataArchitectureLayer, DataArchitectureNodeData } from "@/lib/diagrams/dataArchitecture";

const LAYER_ORDER: Record<DataArchitectureLayer, number> = {
  source: 0,
  ingestion: 1,
  processing: 2,
  storage: 3,
  analytics: 4,
  governance: 5,
  security: 6,
};

function asLayer(v: unknown): DataArchitectureLayer {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "source") return "source";
  if (s === "ingestion") return "ingestion";
  if (s === "processing") return "processing";
  if (s === "storage") return "storage";
  if (s === "analytics") return "analytics";
  if (s === "governance") return "governance";
  if (s === "security") return "security";
  return "processing";
}

function nodeSize(n: Node) {
  const s = (n.data as any)?.size;
  const w = Number(s?.w ?? (n.style as any)?.width ?? 220);
  const h = Number(s?.h ?? (n.style as any)?.height ?? 96);
  return { w: Math.max(140, Math.min(720, w)), h: Math.max(60, Math.min(520, h)) };
}

export function autoLayoutDataArchitecture(opts: {
  nodes: Node<DataArchitectureNodeData>[];
  edges: Edge[];
  direction: "LR" | "TB";
}) {
  const nodes = (opts.nodes ?? []).map((n) => ({ ...n }));
  const edges = opts.edges ?? [];

  // We only lay out "object" nodes. Containers stay where the user placed them.
  const objects = nodes.filter((n) => String((n.data as any)?.kind ?? "") === "data_arch_object");
  const containers = nodes.filter((n) => String((n.data as any)?.kind ?? "") === "data_arch_container");

  const inDeg = new Map<string, number>();
  const outDeg = new Map<string, number>();
  for (const e of edges) {
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    outDeg.set(e.source, (outDeg.get(e.source) ?? 0) + 1);
  }

  const buckets = new Map<number, Node<DataArchitectureNodeData>[]>();
  for (const n of objects) {
    const layer = asLayer((n.data as any)?.layer);
    const col = LAYER_ORDER[layer] ?? 2;
    if (!buckets.has(col)) buckets.set(col, []);
    buckets.get(col)!.push(n);
  }

  for (const arr of buckets.values()) {
    arr.sort((a, b) => {
      const aScore = (outDeg.get(a.id) ?? 0) - (inDeg.get(a.id) ?? 0);
      const bScore = (outDeg.get(b.id) ?? 0) - (inDeg.get(b.id) ?? 0);
      return bScore - aScore;
    });
  }

  const cols = [...buckets.keys()].sort((a, b) => a - b);

  const colGap = 320;
  const rowGap = 150;
  const originX = 140;
  const originY = 140;

  cols.forEach((col, colIndex) => {
    const arr = buckets.get(col)!;
    arr.forEach((n, rowIndex) => {
      const sz = nodeSize(n);
      const x = opts.direction === "LR" ? originX + colIndex * colGap : originX + rowIndex * colGap;
      const y = opts.direction === "LR" ? originY + rowIndex * rowGap : originY + colIndex * rowGap;
      n.position = { x, y };
      n.data = { ...(n.data as any), size: { w: sz.w, h: sz.h } } as any;
      n.style = { ...(n.style as any), width: sz.w, height: sz.h, zIndex: 30 };
    });
  });

  return [...containers, ...objects].map((n) => {
    const updated = objects.find((o) => o.id === n.id);
    return updated ?? n;
  });
}

