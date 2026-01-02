import type { Node, Edge } from "@xyflow/react";

function esc(s: string) {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function exportSimpleSvg(nodes: Node[], edges: Edge[], opts?: { title?: string }) {
  // Very simple renderer (rect/circle/diamond + straight lines)
  const padding = 80;

  const xs = nodes.map((n) => n.position.x);
  const ys = nodes.map((n) => n.position.y);
  const minX = Math.min(...xs, 0) - padding;
  const minY = Math.min(...ys, 0) - padding;
  const maxX = Math.max(...xs, 800) + padding;
  const maxY = Math.max(...ys, 600) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const lines = edges
    .map((e) => {
      const s = nodeById.get(e.source);
      const t = nodeById.get(e.target);
      if (!s || !t) return "";
      const x1 = s.position.x - minX + 80;
      const y1 = s.position.y - minY + 60;
      const x2 = t.position.x - minX + 80;
      const y2 = t.position.y - minY + 60;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111827" stroke-width="2" marker-end="url(#arrow)"/>`;
    })
    .join("\n");

  const shapes = nodes
    .map((n) => {
      const label = esc((n.data as any)?.label ?? "");
      const kind = (n.data as any)?.kind ?? "task";
      const x = n.position.x - minX;
      const y = n.position.y - minY;

      const w = 180;
      const h = 100;

      if (kind.includes("gateway")) {
        // diamond
        const cx = x + w / 2;
        const cy = y + h / 2;
        return `
          <polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" fill="#fff" stroke="#111827" stroke-width="2"/>
          <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14">${label}</text>
        `;
      }

      if (kind.endsWith("event") || kind.startsWith("intermediate_")) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        return `
          <circle cx="${cx}" cy="${cy}" r="42" fill="#fff" stroke="#111827" stroke-width="3"/>
          <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14">${label}</text>
        `;
      }

      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ry="14" fill="#fff" stroke="#111827" stroke-width="2"/>
        <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14">${label}</text>
      `;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto">
      <path d="M0,0 L10,3 L0,6 Z" fill="#111827"/>
    </marker>
  </defs>
  <title>${esc(opts?.title ?? "Diagram")}</title>
  ${lines}
  ${shapes}
</svg>`;

  return svg;
}
