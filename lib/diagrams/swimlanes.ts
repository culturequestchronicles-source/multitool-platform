import type { Node, Edge } from "@xyflow/react";
import type { DiagramTheme } from "@/lib/diagrams/themes";

export type LaneOrientation = "horizontal" | "vertical";

export type SwimlaneNodeData = {
  kind: "swimlane";
  label: string;
  orientation: LaneOrientation;
  lanes: string[];
  width: number;
  height: number;
  dividers: number;
  dividerPositions?: number[];
  locked?: boolean;
  theme?: DiagramTheme;
  laneHeaderColors?: string[];
};

export const SWIMLANE_METRICS = {
  headerH: 54,

  // horizontal layout: lane names on LEFT column
  laneNameColHorizontal: 170,

  // vertical layout: lane names on TOP row (NOT left column)
  laneHeaderRowHVertical: 44,

  pad: 28,
} as const;

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function createOrUpdateSwimlaneNode(opts: {
  existingId?: string;
  orientation: LaneOrientation;
  lanes: string[];
  origin?: { x: number; y: number };
  width?: number;
  height?: number;
  theme?: DiagramTheme;
  label?: string;
  dividers?: number;
  dividerPositions?: number[];
  locked?: boolean;
}) {
  const id = opts.existingId ?? `swimlane_${uid()}`;
  const origin = opts.origin ?? { x: 120, y: 120 };
  const laneCount = Math.max(1, opts.lanes.length);

  const headerH = SWIMLANE_METRICS.headerH;

  const width =
    opts.width ??
    (opts.orientation === "horizontal"
      ? 1100
      : Math.max(760, laneCount * 220)); // vertical grows by columns

  const height =
    opts.height ??
    (opts.orientation === "horizontal"
      ? Math.max(560, headerH + laneCount * 170)
      : 720);

  const locked = Boolean(opts.locked);

  const node: Node = {
    id,
    type: "swimlane",
    position: { x: origin.x, y: origin.y },
    draggable: !locked,
    selectable: true,
    data: {
      kind: "swimlane",
      label: opts.label ?? "Swim Lanes",
      orientation: opts.orientation,
      lanes: opts.lanes,
      width,
      height,
      dividers: opts.dividers ?? 0,
      dividerPositions: opts.dividerPositions,
      locked,
      theme: opts.theme,
    } satisfies SwimlaneNodeData,
    style: {
      width,
      height,
      background: "transparent",
      border: "none",
      zIndex: 0,
    },
  };

  return node;
}

function rect(n: Node) {
  const w = (n.data as any)?.width ?? (n.style as any)?.width ?? (n as any)?.width ?? 980;
  const h = (n.data as any)?.height ?? (n.style as any)?.height ?? (n as any)?.height ?? 520;
  const pos = (n as any).positionAbsolute ?? n.position ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y, w, h };
}

function pointIn(px: number, py: number, r: { x: number; y: number; w: number; h: number }) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function getSwimlaneContainer(nodes: Node[]) {
  return nodes.find((n) => (n.data as any)?.kind === "swimlane") ?? null;
}

export function getLaneBandRect(laneNode: Node, laneIndex: number) {
  const data = laneNode.data as SwimlaneNodeData;
  const r = rect(laneNode);

  const headerH = SWIMLANE_METRICS.headerH;

  const count = Math.max(1, data.lanes.length);

  if (data.orientation === "horizontal") {
    const laneNameCol = SWIMLANE_METRICS.laneNameColHorizontal;

    const contentW = Math.max(1, r.w - laneNameCol);
    const contentH = Math.max(1, r.h - headerH);
    const bandH = contentH / count;

    const top = r.y + headerH + bandH * laneIndex;
    return { x: r.x + laneNameCol, y: top, w: contentW, h: bandH, orientation: "horizontal" as const };
  } else {
    // ✅ vertical: lane names on TOP row under header (no left col)
    const laneHeaderRowH = SWIMLANE_METRICS.laneHeaderRowHVertical;

    const contentW = Math.max(1, r.w);
    const contentH = Math.max(1, r.h - headerH - laneHeaderRowH);
    const bandW = contentW / count;

    const left = r.x + bandW * laneIndex;
    return { x: left, y: r.y + headerH + laneHeaderRowH, w: bandW, h: contentH, orientation: "vertical" as const };
  }
}

export function findLaneAtPoint(nodes: Node[], x: number, y: number) {
  const laneNode = getSwimlaneContainer(nodes);
  if (!laneNode) return null;

  const data = laneNode.data as SwimlaneNodeData;
  const r = rect(laneNode);

  if (!pointIn(x, y, r)) return null;

  const headerH = SWIMLANE_METRICS.headerH;

  // never count header itself as lanes
  if (y < r.y + headerH) return null;

  const count = Math.max(1, data.lanes.length);

  if (data.orientation === "horizontal") {
    const laneNameCol = SWIMLANE_METRICS.laneNameColHorizontal;

    // exclude lane-name column
    if (x < r.x + laneNameCol) return null;

    const contentW = Math.max(1, r.w - laneNameCol);
    const contentH = Math.max(1, r.h - headerH);

    const cx = x - (r.x + laneNameCol);
    const cy = y - (r.y + headerH);

    const idx = Math.min(count - 1, Math.max(0, Math.floor((cy / contentH) * count)));
    if (cx < 0 || cx > contentW || cy < 0 || cy > contentH) return null;

    return { laneNode, laneIndex: idx };
  } else {
    // ✅ vertical: exclude lane header row under header
    const laneHeaderRowH = SWIMLANE_METRICS.laneHeaderRowHVertical;
    if (y < r.y + headerH + laneHeaderRowH) return null;

    const contentW = Math.max(1, r.w);
    const contentH = Math.max(1, r.h - headerH - laneHeaderRowH);

    const cx = x - r.x;
    const cy = y - (r.y + headerH + laneHeaderRowH);

    const idx = Math.min(count - 1, Math.max(0, Math.floor((cx / contentW) * count)));
    if (cx < 0 || cx > contentW || cy < 0 || cy > contentH) return null;

    return { laneNode, laneIndex: idx };
  }
}

export function clampAbsToLane(opts: {
  laneNode: Node;
  laneIndex: number;
  abs: { x: number; y: number };
  nodeSize: { w: number; h: number };
}) {
  const pad = SWIMLANE_METRICS.pad;
  const band = getLaneBandRect(opts.laneNode, opts.laneIndex);

  const minX = band.x + pad;
  const maxX = band.x + band.w - opts.nodeSize.w - pad;
  const minY = band.y + pad;
  const maxY = band.y + band.h - opts.nodeSize.h - pad;

  return {
    x: Math.max(minX, Math.min(opts.abs.x, maxX)),
    y: Math.max(minY, Math.min(opts.abs.y, maxY)),
  };
}

export function snapNodeIntoLane(opts: { dragged: Node; laneNode: Node; laneIndex: number }) {
  const abs = (opts.dragged as any).positionAbsolute ?? opts.dragged.position ?? { x: 0, y: 0 };

  const nodeW =
    (opts.dragged as any)?.data?.size?.w ??
    (opts.dragged as any)?.width ??
    (opts.dragged as any)?.measured?.width ??
    170;

  const nodeH =
    (opts.dragged as any)?.data?.size?.h ??
    (opts.dragged as any)?.height ??
    (opts.dragged as any)?.measured?.height ??
    70;

  const clamped = clampAbsToLane({
    laneNode: opts.laneNode,
    laneIndex: opts.laneIndex,
    abs: { x: abs.x, y: abs.y },
    nodeSize: { w: nodeW, h: nodeH },
  });

  return { x: clamped.x, y: clamped.y, laneContainerId: opts.laneNode.id, laneIndex: opts.laneIndex };
}

export function stripNonSerializableFromNodes(nodes: Node[]) {
  return nodes.map((n) => {
    const nn: any = { ...n };
    delete nn.selected;
    delete nn.dragging;
    delete nn.positionAbsolute;
    return nn;
  });
}

export function stripNonSerializableFromEdges(edges: Edge[]) {
  return edges.map((e) => {
    const ee: any = { ...e };
    delete ee.selected;
    return ee;
  });
}
