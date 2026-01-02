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
};

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

  const width =
    opts.width ??
    (opts.orientation === "horizontal" ? 1100 : Math.max(700, laneCount * 240));

  const height =
    opts.height ??
    (opts.orientation === "horizontal" ? Math.max(520, laneCount * 170) : 700);

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
    style: { width, height, zIndex: 0 },
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

export function findLaneAtPoint(nodes: Node[], x: number, y: number) {
  const laneNode = getSwimlaneContainer(nodes);
  if (!laneNode) return null;

  const data = laneNode.data as SwimlaneNodeData;
  const r = rect(laneNode);
  if (!pointIn(x, y, r)) return null;

  const count = Math.max(1, data.lanes.length);

  const idx =
    data.orientation === "horizontal"
      ? Math.min(count - 1, Math.max(0, Math.floor(((y - r.y) / r.h) * count)))
      : Math.min(count - 1, Math.max(0, Math.floor(((x - r.x) / r.w) * count)));

  return { laneNode, laneIndex: idx };
}

export function snapNodeIntoLane(opts: { dragged: Node; laneNode: Node; laneIndex: number }) {
  const laneRect = rect(opts.laneNode);
  const laneData = opts.laneNode.data as SwimlaneNodeData;

  const count = Math.max(1, laneData.lanes.length);
  const pad = 28;

  const nodeW = (opts.dragged as any)?.width ?? 180;
  const nodeH = (opts.dragged as any)?.height ?? 100;

  let x = opts.dragged.position.x;
  let y = opts.dragged.position.y;

  if (laneData.orientation === "horizontal") {
    const bandH = laneRect.h / count;
    const bandTop = laneRect.y + bandH * opts.laneIndex;
    const bandCenter = bandTop + bandH / 2;
    y = bandCenter - nodeH / 2;
    x = Math.max(laneRect.x + pad, Math.min(x, laneRect.x + laneRect.w - nodeW - pad));
  } else {
    const bandW = laneRect.w / count;
    const bandLeft = laneRect.x + bandW * opts.laneIndex;
    const bandCenter = bandLeft + bandW / 2;
    x = bandCenter - nodeW / 2;
    y = Math.max(laneRect.y + pad, Math.min(y, laneRect.y + laneRect.h - nodeH - pad));
  }

  return { x, y, laneContainerId: opts.laneNode.id, laneIndex: opts.laneIndex };
}

export function getDividerPositions(data: SwimlaneNodeData) {
  const count = Math.max(0, Number(data.dividers ?? 0));
  const existing = (data.dividerPositions ?? []).filter((n) => Number.isFinite(n));
  if (count <= 0) return [];

  if (existing.length === count) {
    return existing
      .slice()
      .sort((a, b) => a - b)
      .map((x) => Math.min(0.95, Math.max(0.05, x)));
  }

  return Array.from({ length: count }).map((_, i) => (i + 1) / (count + 1));
}

export function moveDivider(pos: number[], index: number, next: number) {
  const arr = pos.slice();
  arr[index] = next;

  const left = index > 0 ? arr[index - 1] + 0.03 : 0.05;
  const right = index < arr.length - 1 ? arr[index + 1] - 0.03 : 0.95;
  arr[index] = Math.max(left, Math.min(right, arr[index]));

  return arr
    .slice()
    .sort((a, b) => a - b)
    .map((x) => Math.min(0.95, Math.max(0.05, x)));
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
