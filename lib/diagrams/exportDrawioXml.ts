import type { Node, Edge } from "@xyflow/react";

function esc(s: string) {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function styleForKind(kind: string) {
  if (kind.includes("gateway") || kind === "fork_join") return "rhombus;whiteSpace=wrap;html=1;";
  if (kind === "connector") return "ellipse;whiteSpace=wrap;html=1;";
  if (kind === "database") return "shape=cylinder;whiteSpace=wrap;html=1;";
  if (kind === "document") return "shape=document;whiteSpace=wrap;html=1;";
  if (kind === "data_io") return "shape=parallelogram;whiteSpace=wrap;html=1;";
  if (kind === "delay") return "shape=delay;whiteSpace=wrap;html=1;";
  if (kind.endsWith("event") || String(kind).startsWith("intermediate_")) return "ellipse;whiteSpace=wrap;html=1;";
  return "rounded=1;whiteSpace=wrap;html=1;";
}

export function exportDrawioXml(nodes: Node[], edges: Edge[], opts?: { title?: string }) {
  const title = esc(opts?.title ?? "Diagram");

  const cells: string[] = [];
  cells.push(`<mxCell id="0"/>`);
  cells.push(`<mxCell id="1" parent="0"/>`);

  const idMap = new Map<string, string>();
  nodes.forEach((n, idx) => idMap.set(n.id, `n${idx + 2}`));

  for (const n of nodes) {
    const id = idMap.get(n.id)!;
    const label = esc((n.data as any)?.label ?? n.id);
    const x = Math.round(n.position.x ?? 0);
    const y = Math.round(n.position.y ?? 0);
    const w = Math.round((n.data as any)?.width ?? 180);
    const h = Math.round((n.data as any)?.height ?? 100);

    const kind = String((n.data as any)?.kind ?? "task");
    const style = styleForKind(kind);

    cells.push(
      `<mxCell id="${id}" value="${label}" style="${style}" vertex="1" parent="1">
        <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/>
      </mxCell>`
    );
  }

  edges.forEach((e, idx) => {
    const id = `e${idx + 10000}`;
    const src = idMap.get(e.source);
    const tgt = idMap.get(e.target);
    if (!src || !tgt) return;

    const label = esc(((e.data as any)?.label ?? e.label ?? "") as string);

    cells.push(
      `<mxCell id="${id}" value="${label}" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="${src}" target="${tgt}">
        <mxGeometry relative="1" as="geometry"/>
      </mxCell>`
    );
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="jhatpat" version="22.0.0">
  <diagram id="jhatpat" name="${title}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0">
      <root>
        ${cells.join("\n")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}
