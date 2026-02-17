import type { Node } from "@xyflow/react";

function isArchNode(n: Node) {
  return String((n.data as any)?.kind ?? "") === "architecture" || String(n.type ?? "") === "architecture";
}

function isBoundary(n: Node) {
  return (
    String((n.data as any)?.kind ?? "") === "architecture_boundary" ||
    String(n.type ?? "") === "architecture_boundary"
  );
}

function layerOf(n: Node) {
  return String((n.data as any)?.layer ?? "");
}

function sizeOf(n: Node) {
  const s = (n.data as any)?.size;
  const w = Number(s?.w ?? 240);
  const h = Number(s?.h ?? 110);
  return { w, h };
}

const LAYERS_LR = ["client_edge", "security_routing", "compute_logic", "async_messaging", "persistence", "observability"];
const LAYERS_TB = ["client_edge", "security_routing", "compute_logic", "async_messaging", "persistence", "observability"];

export function autoLayoutArchitecture(nodes: Node[], direction: "LR" | "TB") {
  const archNodes = nodes.filter(isArchNode);
  const boundaries = nodes.filter(isBoundary);
  const others = nodes.filter((n) => !isArchNode(n) && !isBoundary(n));

  const layers = direction === "LR" ? LAYERS_LR : LAYERS_TB;

  const buckets = new Map<string, Node[]>();
  for (const l of layers) buckets.set(l, []);
  for (const n of archNodes) {
    const l = layers.includes(layerOf(n)) ? layerOf(n) : "compute_logic";
    buckets.get(l)?.push(n);
  }

  const startX = 120;
  const startY = 140;
  const colGap = 130;
  const rowGap = 90;

  const positioned: Node[] = [];

  if (direction === "LR") {
    let x = startX;
    for (const layer of layers) {
      const list = buckets.get(layer) ?? [];
      let y = startY;
      for (const n of list) {
        positioned.push({ ...n, position: { x, y } });
        const { h } = sizeOf(n);
        y += h + rowGap;
      }
      x += 260 + colGap;
    }
  } else {
    let y = startY;
    for (const layer of layers) {
      const list = buckets.get(layer) ?? [];
      let x = startX;
      for (const n of list) {
        positioned.push({ ...n, position: { x, y } });
        const { w } = sizeOf(n);
        x += w + colGap;
      }
      y += 150 + rowGap;
    }
  }

  // Keep boundaries as-is unless empty (then keep at back).
  return [...boundaries, ...positioned, ...others];
}

