import type { Node } from "@xyflow/react";

export function autoLayoutGrid(nodes: Node[], opts?: { startX?: number; startY?: number; colW?: number; rowH?: number; cols?: number }) {
  const startX = opts?.startX ?? 140;
  const startY = opts?.startY ?? 140;
  const colW = opts?.colW ?? 420;
  const rowH = opts?.rowH ?? 320;
  const cols = Math.max(1, opts?.cols ?? 4);

  let i = 0;
  return nodes.map((n) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    i++;
    return {
      ...n,
      position: { x: startX + col * colW, y: startY + row * rowH },
    };
  });
}

