import type { Node, Edge } from "reactflow";

export type LaneOrientation = "horizontal" | "vertical";

export type SwimlaneData = {
  kind: "swimlane";
  label: string;
  orientation: LaneOrientation;
  color?: string;
  dividers?: number; // internal separators
  locked?: boolean;
};

const DEFAULT_LANES = ["Service", "Prep", "Dough", "Storage", "Stove", "Fridge", "Oven"];

const LANE_COLORS = [
  "#eff6ff",
  "#ecfeff",
  "#f0fdf4",
  "#fff7ed",
  "#fdf2f8",
  "#f5f3ff",
  "#f8fafc",
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function makeLaneNodes(opts: {
  orientation: LaneOrientation;
  labels?: string[];
  origin?: { x: number; y: number };
}) {
  const orientation = opts.orientation;
  const labels = (opts.labels?.length ? opts.labels : DEFAULT_LANES).slice(0, 12);

  const origin = opts.origin ?? { x: 80, y: 80 };

  // size tuned for ReactFlow canvas
  const laneH = 160;
  const laneW = 320;

  const nodes: Node[] = labels.map((label, i) => {
    const id = `lane_${uid()}`;

    const position =
      orientation === "horizontal"
        ? { x: origin.x, y: origin.y + i * (laneH + 16) }
        : { x: origin.x + i * (laneW + 16), y: origin.y };

    const style =
      orientation === "horizontal"
        ? { width: 1400, height: laneH, zIndex: 0 }
        : { width: laneW, height: 820, zIndex: 0 };

    return {
      id,
      type: "swimlane",
      position,
      draggable: true,
      selectable: true,
      data: {
        kind: "swimlane",
        label,
        orientation,
        color: LANE_COLORS[i % LANE_COLORS.length],
        dividers: 0,
        locked: false,
      } satisfies SwimlaneData,
      style,
    };
  });

  return nodes;
}

function rect(n: Node) {
  const w = (n.style as any)?.width ?? (n as any)?.width ?? 300;
  const h = (n.style as any)?.height ?? (n as any)?.height ?? 160;
  const pos = (n as any).positionAbsolute ?? n.position ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y, w, h };
}

function pointIn(px: number, py: number, r: { x: number; y: number; w: number; h: number }) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function findLaneAtPoint(nodes: Node[], x: number, y: number) {
  const lanes = nodes.filter((n) => (n.data as any)?.kind === "swimlane");
  // pick smallest area lane that contains point (most specific)
  const candidates = lanes
    .map((n) => ({ n, r: rect(n), area: rect(n).w * rect(n).h }))
    .filter(({ r }) => pointIn(x, y, r))
    .sort((a, b) => a.area - b.area);

  return candidates[0]?.n ?? null;
}

export function snapNodeIntoLane(opts: { dragged: Node; lane: Node }) {
  const laneRect = rect(opts.lane);
  const laneData = opts.lane.data as any as SwimlaneData;

  const pad = 24;
  const centerBand = laneData.orientation === "horizontal" ? laneRect.y + laneRect.h / 2 : laneRect.x + laneRect.w / 2;

  const nodeW = (opts.dragged as any)?.width ?? 180;
  const nodeH = (opts.dragged as any)?.height ?? 100;

  let x = opts.dragged.position.x;
  let y = opts.dragged.position.y;

  if (laneData.orientation === "horizontal") {
    // snap Y to lane center band
    y = centerBand - nodeH / 2;
    // clamp inside lane
    x = Math.max(laneRect.x + pad, Math.min(x, laneRect.x + laneRect.w - nodeW - pad));
  } else {
    // snap X to lane center band
    x = centerBand - nodeW / 2;
    // clamp inside lane
    y = Math.max(laneRect.y + pad, Math.min(y, laneRect.y + laneRect.h - nodeH - pad));
  }

  return { x, y, laneId: opts.lane.id };
}

// Safe JSON persistence (remove functions, React elements, cyclic stuff)
export function stripNonSerializableFromNodes(nodes: Node[]) {
  return nodes.map((n) => {
    const nn: any = { ...n };
    // reactflow internal fields occasionally appear
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
