import type { Node, Edge } from "@xyflow/react";
import { getSmoothStepPath, type Position } from "@xyflow/system";

function esc(s: string) {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSwimlane(n: Node) {
  return String((n.data as any)?.kind ?? "") === "swimlane" || String(n.type ?? "") === "swimlane";
}

function sizeOf(n: Node) {
  const w = (n.data as any)?.size?.w ?? (n.data as any)?.width ?? (n.style as any)?.width ?? (n as any)?.measured?.width ?? 170;
  const h = (n.data as any)?.size?.h ?? (n.data as any)?.height ?? (n.style as any)?.height ?? (n as any)?.measured?.height ?? 70;
  return { w: Number(w) || 170, h: Number(h) || 70 };
}

function absPos(n: Node, byId: Map<string, Node>) {
  const p = n.position ?? { x: 0, y: 0 };
  const parentId = ((n as any).parentId ?? (n as any).parentNode) as string | undefined;
  if (!parentId) return { x: p.x, y: p.y };

  const parent = byId.get(parentId);
  if (!parent) return { x: p.x, y: p.y };

  const pp = parent.position ?? { x: 0, y: 0 };
  return { x: pp.x + p.x, y: pp.y + p.y };
}

function sideFromHandle(handleId?: string | null): "top" | "right" | "bottom" | "left" | null {
  const h = String(handleId ?? "").toLowerCase();
  if (!h) return null;
  if (h.includes("top")) return "top";
  if (h.includes("right")) return "right";
  if (h.includes("bottom")) return "bottom";
  if (h.includes("left")) return "left";
  return null;
}

function oppositeSide(s: "top" | "right" | "bottom" | "left") {
  return s === "top" ? "bottom" : s === "bottom" ? "top" : s === "left" ? "right" : "left";
}

function toPosition(s: "top" | "right" | "bottom" | "left"): Position {
  return s === "top" ? "top" : s === "right" ? "right" : s === "bottom" ? "bottom" : "left";
}

function handlePoint(abs: { x: number; y: number; w: number; h: number }, side: "top" | "right" | "bottom" | "left") {
  const { x, y, w, h } = abs;
  if (side === "top") return { x: x + w / 2, y };
  if (side === "bottom") return { x: x + w / 2, y: y + h };
  if (side === "left") return { x, y: y + h / 2 };
  return { x: x + w, y: y + h / 2 };
}

function chooseAutoSides(src: { x: number; y: number; w: number; h: number }, tgt: { x: number; y: number; w: number; h: number }) {
  const sc = { x: src.x + src.w / 2, y: src.y + src.h / 2 };
  const tc = { x: tgt.x + tgt.w / 2, y: tgt.y + tgt.h / 2 };
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const s = dx >= 0 ? "right" : "left";
    return { source: s as const, target: oppositeSide(s as any) as any };
  }
  const s = dy >= 0 ? "bottom" : "top";
  return { source: s as const, target: oppositeSide(s as any) as any };
}

export function exportSimpleSvg(nodes: Node[], edges: Edge[], opts?: { title?: string }) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // bounds include abs pos
  const rects = nodes.map((n) => {
    const { w, h } = sizeOf(n);
    const p = absPos(n, byId);
    return { x: p.x, y: p.y, w, h };
  });

  const padding = 80;
  const minX = Math.min(...rects.map((r) => r.x), 0) - padding;
  const minY = Math.min(...rects.map((r) => r.y), 0) - padding;
  const maxX = Math.max(...rects.map((r) => r.x + r.w), 800) + padding;
  const maxY = Math.max(...rects.map((r) => r.y + r.h), 600) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  // edges
  const lines = edges
    .map((e) => {
      const s = byId.get(e.source);
      const t = byId.get(e.target);
      if (!s || !t) return "";

      const sp = absPos(s, byId);
      const tp = absPos(t, byId);
      const ss = sizeOf(s);
      const ts = sizeOf(t);
      const sAbs = { x: sp.x, y: sp.y, w: ss.w, h: ss.h };
      const tAbs = { x: tp.x, y: tp.y, w: ts.w, h: ts.h };

      const explicitSourceSide = sideFromHandle((e as any).sourceHandle);
      const explicitTargetSide = sideFromHandle((e as any).targetHandle);
      const autoSides = chooseAutoSides(sAbs, tAbs);
      const sourceSide = (explicitSourceSide ?? autoSides.source) as "top" | "right" | "bottom" | "left";
      const targetSide = (explicitTargetSide ?? autoSides.target) as "top" | "right" | "bottom" | "left";

      const sPtAbs = handlePoint(sAbs, sourceSide);
      const tPtAbs = handlePoint(tAbs, targetSide);

      const sourceX = sPtAbs.x - minX;
      const sourceY = sPtAbs.y - minY;
      const targetX = tPtAbs.x - minX;
      const targetY = tPtAbs.y - minY;

      const stroke = String(((e.style as any)?.stroke ?? "#111827") || "#111827");
      const strokeWidth = Number((e.style as any)?.strokeWidth ?? 2.2) || 2.2;
      const dash = (e.style as any)?.strokeDasharray ? ` stroke-dasharray="${esc(String((e.style as any).strokeDasharray))}"` : "";

      const [pathD, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition: toPosition(sourceSide),
        targetPosition: toPosition(targetSide),
        borderRadius: 10,
      } as any);

      const label = esc(String(((e.data as any)?.label ?? "") || ""));
      const labelSvg = label
        ? `<g>
            <rect x="${labelX - 22}" y="${labelY - 10}" width="${Math.max(44, label.length * 7.2)}" height="20" rx="10" ry="10" fill="#ffffff" stroke="rgba(0,0,0,0.12)"/>
            <text x="${labelX}" y="${labelY + 1}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="11" font-weight="800" fill="#0f172a">${label}</text>
          </g>`
        : "";

      return `<g>
        <path d="${pathD}" fill="none" stroke="${esc(stroke)}" stroke-width="${strokeWidth}"${dash} marker-end="url(#arrow)"/>
        ${labelSvg}
      </g>`;
    })
    .join("\n");

  // shapes (background first, then edges, then foreground nodes)
  const bgShapes: string[] = [];
  const fgShapes: string[] = [];

  for (const n of nodes) {
    const kind = String((n.data as any)?.kind ?? "process");
    const label = esc((n.data as any)?.label ?? "");
    const p = absPos(n, byId);
    const x = p.x - minX;
    const y = p.y - minY;

    const push = (svg: string, layer: "bg" | "fg") => {
      if (!svg.trim()) return;
      (layer === "bg" ? bgShapes : fgShapes).push(svg);
    };

    if (isSwimlane(n)) {
      const { w, h } = sizeOf(n);
      const orientation = ((n.data as any)?.orientation ?? "horizontal") as "horizontal" | "vertical";
      const lanes: string[] = Array.isArray((n.data as any)?.lanes) ? (n.data as any).lanes : ["Lane 1"];
      const laneCount = Math.max(1, lanes.length);

      const headerH = 54;

      if (orientation === "horizontal") {
        const laneNameCol = 170;
        const contentW = Math.max(1, w - laneNameCol);
        const contentH = Math.max(1, h - headerH);
        const bandH = contentH / laneCount;

        const bg = `
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" ry="18" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <rect x="${x}" y="${y}" width="${w}" height="${headerH}" rx="18" ry="18" fill="#f8fafc" stroke="#111827" stroke-width="2"/>
          <text x="${x + 16}" y="${y + headerH / 2}" dominant-baseline="middle" font-family="Arial" font-size="16" font-weight="800">${label || "Swim Lanes"}</text>
          <rect x="${x}" y="${y + headerH}" width="${laneNameCol}" height="${h - headerH}" fill="#f8fafc" opacity="0.75"/>
          <line x1="${x + laneNameCol}" y1="${y + headerH}" x2="${x + laneNameCol}" y2="${y + h}" stroke="#111827" stroke-width="2"/>
        `;

        const bands = lanes
          .map((ln, i) => {
            const top = y + headerH + i * bandH;
            const bandBg = i % 2 === 0 ? `rgba(255,255,255,0.45)` : `rgba(255,255,255,0.30)`;

            const sep = i < laneCount - 1 ? `<line x1="${x}" y1="${top + bandH}" x2="${x + w}" y2="${top + bandH}" stroke="#111827" stroke-width="2"/>` : "";

            return `
              <rect x="${x + laneNameCol}" y="${top}" width="${contentW}" height="${bandH}" fill="${bandBg}"/>
              <text x="${x + laneNameCol / 2}" y="${top + bandH / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${esc(
                ln
              )}</text>
              ${sep}
            `;
          })
          .join("\n");

        push(`${bg}\n${bands}`, "bg");
        continue;
      } else {
        // ✅ vertical: lane headers row at top under header
        const laneHeaderRowH = 44;
        const contentW = Math.max(1, w);
        const contentH = Math.max(1, h - headerH - laneHeaderRowH);
        const bandW = contentW / laneCount;

        const bg = `
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" ry="18" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <rect x="${x}" y="${y}" width="${w}" height="${headerH}" rx="18" ry="18" fill="#f8fafc" stroke="#111827" stroke-width="2"/>
          <text x="${x + 16}" y="${y + headerH / 2}" dominant-baseline="middle" font-family="Arial" font-size="16" font-weight="800">${label || "Swim Lanes"}</text>
          <rect x="${x}" y="${y + headerH}" width="${w}" height="${laneHeaderRowH}" fill="#f8fafc" opacity="0.85"/>
          <line x1="${x}" y1="${y + headerH + laneHeaderRowH}" x2="${x + w}" y2="${y + headerH + laneHeaderRowH}" stroke="#111827" stroke-width="2"/>
        `;

        const cols = lanes
          .map((ln, i) => {
            const left = x + i * bandW;
            const sep = i < laneCount - 1 ? `<line x1="${left + bandW}" y1="${y + headerH}" x2="${left + bandW}" y2="${y + h}" stroke="#111827" stroke-width="2"/>` : "";
            const bandBg = i % 2 === 0 ? `rgba(255,255,255,0.45)` : `rgba(255,255,255,0.30)`;

            return `
              <rect x="${left}" y="${y + headerH + laneHeaderRowH}" width="${bandW}" height="${contentH}" fill="${bandBg}"/>
              <text x="${left + bandW / 2}" y="${y + headerH + laneHeaderRowH / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${esc(
                ln
              )}</text>
              ${sep}
            `;
          })
          .join("\n");

        push(`${bg}\n${cols}`, "bg");
        continue;
      }
    }

    const { w, h } = sizeOf(n);

      // Data Architecture: container boundary
      if (kind === "data_arch_container") {
        const border = esc(String((n.data as any)?.meta?.border ?? "#111827"));
        const style = esc(String((n.data as any)?.containerStyle ?? "container").toUpperCase());
        const styleApproxW = Math.max(52, Math.ceil(style.length * 7.2));
        const labelApproxW = Math.max(64, Math.ceil(label.length * 7.2));
        const pillW = Math.min(w - 24, 18 + styleApproxW + 14 + labelApproxW + 18);
        push(`
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" ry="22" fill="rgba(255,255,255,0.22)" stroke="${border}" stroke-width="2" stroke-dasharray="8 6"/>
          <g>
            <rect x="${x + 12}" y="${y + 10}" width="${pillW}" height="28" rx="14" ry="14" fill="rgba(255,255,255,0.88)" stroke="rgba(15,23,42,0.14)"/>
            <text x="${x + 24}" y="${y + 28}" font-family="Arial" font-size="11" font-weight="900" fill="#334155">${style}</text>
            <text x="${x + 24 + styleApproxW + 14}" y="${y + 28}" font-family="Arial" font-size="12" font-weight="900" fill="#0f172a">${label}</text>
          </g>
        `, "bg");
        continue;
      }

      // Data Architecture: object node (rounded card + optional icon)
      if (kind === "data_arch_object") {
        const fill = esc(String((n.data as any)?.meta?.color ?? "#ffffff"));
        const border = esc(String((n.data as any)?.meta?.border ?? "#0f172a"));
        const subtitle = esc(String((n.data as any)?.subtitle ?? ""));
        const iconSrc = String((n.data as any)?.meta?.iconSrc ?? "").trim();
        const iconSvg = iconSrc
          ? `<image href="${esc(iconSrc)}" x="${x + 14}" y="${y + 14}" width="26" height="26" preserveAspectRatio="xMidYMid meet" />`
          : "";
        const iconLetter = !iconSrc ? esc(String((n.data as any)?.label ?? "").trim().slice(0, 1).toUpperCase() || "\u2022") : "";
        const iconFallback = !iconSrc
          ? `<text x="${x + 30}" y="${y + 32}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="900" fill="#0f172a">${iconLetter}</text>`
          : "";

        push(`
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ry="14" fill="${fill}" stroke="${border}" stroke-width="2"/>
          <rect x="${x + 10}" y="${y + 10}" width="40" height="40" rx="12" ry="12" fill="rgba(255,255,255,0.65)" stroke="rgba(15,23,42,0.12)"/>
          ${iconSvg}
          ${iconFallback}
          <text x="${x + 60}" y="${y + 30}" font-family="Arial" font-size="14" font-weight="900" fill="#0f172a">${label}</text>
          ${subtitle ? `<text x="${x + 60}" y="${y + 46}" font-family="Arial" font-size="11" font-weight="700" fill="rgba(15,23,42,0.70)">${subtitle}</text>` : ""}
        `, "fg");
        continue;
      }

      // decision diamond
      if (kind.includes("decision")) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        push(`
          <polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${label}</text>
        `, "fg");
        continue;
      }

      // start/end pill
      if (kind.includes("start") || kind.includes("end")) {
        push(`
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" ry="${Math.min(w, h) / 2}" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${label}</text>
        `, "fg");
        continue;
      }

      // data parallelogram
      if (kind === "data") {
        push(`
          <polygon points="${x + w * 0.08},${y} ${x + w},${y} ${x + w * 0.92},${y + h} ${x},${y + h}" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${label}</text>
        `, "fg");
        continue;
      }

      // database
      if (kind === "database") {
        const rx = 16;
        push(`
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <ellipse cx="${x + w / 2}" cy="${y + 12}" rx="${Math.max(18, w * 0.35)}" ry="10" fill="rgba(255,255,255,0.6)" stroke="#111827" stroke-width="2"/>
          <ellipse cx="${x + w / 2}" cy="${y + h - 12}" rx="${Math.max(18, w * 0.35)}" ry="10" fill="rgba(255,255,255,0.35)" stroke="#111827" stroke-width="2"/>
          <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${label}</text>
        `, "fg");
        continue;
      }

      // default rounded rect
      push(`
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ry="14" fill="#ffffff" stroke="#111827" stroke-width="2"/>
        <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="800">${label}</text>
      `, kind === "architecture_boundary" ? "bg" : "fg");
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
 <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto">
      <path d="M0,0 L10,3 L0,6 Z" fill="#111827"/>
    </marker>
  </defs>
  <title>${esc(opts?.title ?? "Diagram")}</title>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>
  ${bgShapes.join("\n")}
  ${lines}
  ${fgShapes.join("\n")}
 </svg>`;
}
