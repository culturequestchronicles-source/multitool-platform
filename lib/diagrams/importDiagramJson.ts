import type { Edge, Node } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type { DiagramType } from "@/lib/diagrams/createDiagram";
import { createOrUpdateSwimlaneNode, type LaneOrientation, clampAbsToLane, type SwimlaneNodeData, SWIMLANE_METRICS } from "@/lib/diagrams/swimlanes";
import type { ErdCardinality, ErdField, ErdNotation } from "@/lib/diagrams/erd";
import type { FlowchartLayoutDirection } from "@/lib/diagrams/flowchartStore";
import type { OrgChartType } from "@/lib/diagrams/orgChartStore";
import { autoLayoutOrg } from "@/lib/diagrams/orgLayout";

type Snap = { nodes: Node[]; edges: Edge[]; meta?: any };

export type DiagramJsonImportContext = {
  diagramType: DiagramType;
  themeId: string;
  erdNotation?: ErdNotation;
  flowchartDirection?: FlowchartLayoutDirection;
  orgChartType?: OrgChartType;
};

export type DiagramJsonImportResult = {
  snapshot: Snap;
  warnings: string[];
};

function isPlainObject(v: unknown): v is Record<string, any> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function asString(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function safeId(input: string, fallbackPrefix: string) {
  const trimmed = asString(input).trim();
  if (trimmed) return trimmed;
  return `${fallbackPrefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function slugId(s: string) {
  const v = asString(s).trim().toLowerCase();
  const slug = v.replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_+|_+$/g, "");
  return slug || "item";
}

function toNumber(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeParentRefs(nodes: Node[]): Node[] {
  return nodes.map((n) => {
    const nn: any = { ...n };
    if (!nn.parentId && nn.parentNode) nn.parentId = nn.parentNode;
    delete nn.parentNode;
    delete nn.positionAbsolute;
    delete nn.selected;
    delete nn.dragging;
    return nn as Node;
  });
}

function hardenSnapshot(snapshot: Snap, warnings: string[]): Snap {
  const nodesRaw = Array.isArray(snapshot.nodes) ? snapshot.nodes : [];
  const edgesRaw = Array.isArray(snapshot.edges) ? snapshot.edges : [];

  const nodes: Node[] = [];
  for (const n of nodesRaw as any[]) {
    if (!n || typeof n !== "object") {
      warnings.push("Dropped an invalid node entry (not an object).");
      continue;
    }
    const id = asString((n as any).id).trim();
    const type = asString((n as any).type).trim();
    const pos = (n as any).position;
    const x = toNumber(pos?.x, NaN);
    const y = toNumber(pos?.y, NaN);
    if (!id) {
      warnings.push("Dropped a node without an id.");
      continue;
    }
    if (!type) {
      warnings.push(`Dropped node "${id}" (missing type).`);
      continue;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      warnings.push(`Node "${id}" had an invalid position; defaulted to (0,0).`);
    }
    nodes.push({
      ...(n as any),
      id,
      type,
      position: { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 },
    } as any);
  }

  const nodeIdSet = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = [];
  for (const e of edgesRaw as any[]) {
    if (!e || typeof e !== "object") {
      warnings.push("Dropped an invalid edge entry (not an object).");
      continue;
    }
    const id = asString((e as any).id).trim() || safeId("", "e");
    const source = asString((e as any).source).trim();
    const target = asString((e as any).target).trim();
    if (!source || !target) {
      warnings.push(`Dropped edge "${id}" (missing source/target).`);
      continue;
    }
    if (!nodeIdSet.has(source) || !nodeIdSet.has(target)) {
      warnings.push(`Dropped edge "${id}" (source/target not found in nodes).`);
      continue;
    }
    edges.push({ ...(e as any), id, source, target } as any);
  }

  return { ...snapshot, nodes, edges };
}

function normalizeEdges(edges: Edge[]): Edge[] {
  return edges.map((e) => {
    const ee: any = { ...e };
    delete ee.selected;
    return ee as Edge;
  });
}

function ensureMeta(meta: any, themeId: string) {
  const m = isPlainObject(meta) ? { ...meta } : {};
  if (!m.themeId) m.themeId = themeId;
  if (!m.layoutMode) m.layoutMode = "free";
  return m;
}

function looksLikeNativeSnapshot(input: unknown): input is Snap {
  if (!isPlainObject(input)) return false;
  const nodes = (input as any).nodes;
  const edges = (input as any).edges;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return false;

  // Avoid falsely treating "simplified import" payloads (which also contain nodes/edges arrays)
  // as XYFlow snapshots. A native snapshot node must have id/type/position.
  if (nodes.length === 0) return true;

  for (const n of nodes) {
    if (!isPlainObject(n)) return false;
    if (typeof (n as any).id !== "string" || !(n as any).id.trim()) return false;
    if (typeof (n as any).type !== "string" || !(n as any).type.trim()) return false;
    const p = (n as any).position;
    if (!isPlainObject(p)) return false;
    const x = (p as any).x;
    const y = (p as any).y;
    if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) return false;
  }

  return true;
}

function assertDiagramTypeMatch(ctx: DiagramJsonImportContext, payload: any, warnings: string[]) {
  const t = asString(payload?.diagram_type || payload?.diagramType || payload?.type).toLowerCase().trim();
  if (!t) return;
  // accept common variants from /tools/diagrams/new?type=...
  const normalized =
    t === "swimlanes" || t === "swimlane"
      ? "swimlane"
      : t === "system-architecture" || t === "system_architecture"
        ? "system_architecture"
        : t === "data-architecture" || t === "data_architecture"
          ? "data_architecture"
        : t === "org-chart" || t === "org_chart"
          ? "org_chart"
          : t === "flow-chart" || t === "flow_chart"
            ? "flowchart"
            : t;

  if (normalized && normalized !== ctx.diagramType) {
    warnings.push(`JSON specifies type "${normalized}" but you are importing into "${ctx.diagramType}". Import uses the current editor type.`);
  }
}

function importNativeSnapshot(ctx: DiagramJsonImportContext, input: Snap): DiagramJsonImportResult {
  const warnings: string[] = [];
  assertDiagramTypeMatch(ctx, input as any, warnings);

  const nodes = normalizeParentRefs((input.nodes ?? []) as any);
  const edges = normalizeEdges((input.edges ?? []) as any);

  const hardened = hardenSnapshot({ nodes, edges, meta: ensureMeta((input as any).meta, ctx.themeId) }, warnings);
  return { snapshot: hardened, warnings };
}

type SwimlaneImportJson = {
  diagram_type?: string;
  type?: string;
  title?: string;
  label?: string;
  orientation?: LaneOrientation;
  lanes: string[];
  width?: number;
  height?: number;
  nodes?: Array<{
    id?: string;
    label?: string;
    kind?: string;
    lane?: string;
    laneIndex?: number;
    x?: number;
    y?: number;
    size?: { w?: number; h?: number };
    meta?: { color?: string; border?: string };
  }>;
  edges?: Array<{ id?: string; source: string; target: string; label?: string; async?: boolean }>;
};

function looksLikeSwimlaneImportJson(v: unknown): v is SwimlaneImportJson {
  if (!isPlainObject(v)) return false;
  if (!Array.isArray((v as any).lanes)) return false;
  return true;
}

function importSwimlaneJson(ctx: DiagramJsonImportContext, input: SwimlaneImportJson): DiagramJsonImportResult {
  const warnings: string[] = [];
  assertDiagramTypeMatch(ctx, input as any, warnings);

  const lanes = (input.lanes ?? []).map((x) => asString(x).trim()).filter(Boolean);
  if (!lanes.length) throw new Error('Swimlane JSON must include "lanes" (non-empty array of strings).');

  const orientation: LaneOrientation = input.orientation === "vertical" ? "vertical" : "horizontal";
  const label = asString(input.title || input.label).trim() || "Swim Lanes";

  const rawNodes = Array.isArray(input.nodes) ? input.nodes : [];
  const nodeCount = rawNodes.length;
  const laneCount = lanes.length;

  const minW =
    orientation === "horizontal"
      ? 900
      : Math.max(760, laneCount * 220);
  const minH =
    orientation === "horizontal"
      ? Math.max(520, SWIMLANE_METRICS.headerH + laneCount * 150)
      : 680;

  const width = Math.max(minW, toNumber(input.width, minW + Math.min(1400, Math.max(0, nodeCount - 6) * 120)));
  const height = Math.max(minH, toNumber(input.height, minH));

  const laneHeaderColors = lanes.map((_, i) => ["#7C3AED", "#F97316", "#2563EB", "#16A34A", "#DB2777", "#0D9488"][i % 6]);

  const laneNode = createOrUpdateSwimlaneNode({
    existingId: "swimlane_root",
    orientation,
    lanes,
    origin: { x: 120, y: 120 },
    width,
    height,
    label,
  }) as any as Node;

  (laneNode.data as SwimlaneNodeData).laneHeaderColors = laneHeaderColors;

  const laneAbs = laneNode.position ?? { x: 120, y: 120 };

  const nodes: Node[] = [laneNode];

  // Place nodes by lane + order. If x/y provided, treat them as absolute canvas coordinates.
  const createdNodeIds: string[] = [];
  const laneSeqIndex = new Map<number, number>();
  for (let idx = 0; idx < rawNodes.length; idx++) {
    const r = rawNodes[idx];
    const id = asString(r?.id).trim() || `flow_${idx + 1}`;
    const kind = asString(r?.kind).trim() || "process";
    const label = asString(r?.label).trim() || "Step";

    const laneIndex =
      typeof r?.laneIndex === "number" && Number.isFinite(r.laneIndex)
        ? Math.max(0, Math.min(laneCount - 1, Math.floor(r.laneIndex)))
        : r?.lane
          ? Math.max(0, lanes.findIndex((ln) => ln.toLowerCase() === asString(r.lane).trim().toLowerCase()))
          : 0;

    const fixedLaneIndex = laneIndex >= 0 ? laneIndex : 0;
    const seq = laneSeqIndex.get(fixedLaneIndex) ?? 0;
    laneSeqIndex.set(fixedLaneIndex, seq + 1);

    const sizeW = toNumber(r?.size?.w, 170);
    const sizeH = toNumber(r?.size?.h, 70);

    const band = (() => {
      // Minimal equivalent of getLaneBandRect() without importing internal rect() helper.
      const headerH = SWIMLANE_METRICS.headerH;
      const pad = SWIMLANE_METRICS.pad;
      if (orientation === "horizontal") {
        const laneNameCol = SWIMLANE_METRICS.laneNameColHorizontal;
        const contentW = Math.max(1, width - laneNameCol);
        const contentH = Math.max(1, height - headerH);
        const bandH = contentH / laneCount;
        const top = laneAbs.y + headerH + bandH * fixedLaneIndex;
        return { x: laneAbs.x + laneNameCol, y: top, w: contentW, h: bandH, pad };
      } else {
        const laneHeaderRowH = SWIMLANE_METRICS.laneHeaderRowHVertical;
        const contentW = Math.max(1, width);
        const contentH = Math.max(1, height - headerH - laneHeaderRowH);
        const bandW = contentW / laneCount;
        const left = laneAbs.x + bandW * fixedLaneIndex;
        return { x: left, y: laneAbs.y + headerH + laneHeaderRowH, w: bandW, h: contentH, pad };
      }
    })();

    const desiredAbs = {
      x: Number.isFinite(Number(r?.x)) ? Number(r?.x) : band.x + band.pad + seq * 240,
      y: Number.isFinite(Number(r?.y)) ? Number(r?.y) : band.y + band.pad + 40,
    };

    const clamped = clampAbsToLane({
      laneNode: laneNode as any,
      laneIndex: fixedLaneIndex,
      abs: desiredAbs,
      nodeSize: { w: sizeW, h: sizeH },
    });

    const relPos = { x: clamped.x - laneAbs.x, y: clamped.y - laneAbs.y };

    nodes.push({
      id,
      type: "flow",
      parentId: laneNode.id,
      extent: "parent" as any,
      position: relPos,
      data: {
        kind,
        label,
        laneIndex: fixedLaneIndex,
        meta: { color: r?.meta?.color ?? "#ffffff", border: r?.meta?.border ?? "#0f172a" },
        size: r?.size ? { w: sizeW, h: sizeH } : undefined,
      },
      style: { zIndex: 30 },
    } as any);
    createdNodeIds.push(id);
  }

  const validNodeIds = new Set([laneNode.id, ...createdNodeIds]);
  const edges: Edge[] = (Array.isArray(input.edges) ? input.edges : []).map((e) => {
    const id = safeId(asString(e?.id), "e");
    const async = Boolean((e as any)?.async);
    return {
      id,
      source: asString(e?.source).trim(),
      target: asString(e?.target).trim(),
      type: "labeled",
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { label: asString(e?.label).trim(), async: async || undefined },
      style: async ? { strokeDasharray: "6 4" } : undefined,
    } as any;
  }).filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target));

  // Auto-layout imported swimlane nodes to avoid stacked/overlapping vertical edges:
  // - Compute a left-to-right level per node from edges (DAG-ish)
  // - Ensure each lane uses unique columns (bump level on conflicts)
  // - Expand swimlane width if needed so nodes stay inside lanes
  const layouted = (() => {
    const flowNodes = nodes.filter((n) => n.id !== laneNode.id);
    if (!flowNodes.length) return nodes;

    const laneCount = Math.max(1, lanes.length);
    const colGap = 300;
    const rowInset = 40;
    const pad = SWIMLANE_METRICS.pad;
    const headerH = SWIMLANE_METRICS.headerH;

    const laneNameCol = orientation === "horizontal" ? SWIMLANE_METRICS.laneNameColHorizontal : 0;
    const laneHeaderRowH = orientation === "vertical" ? SWIMLANE_METRICS.laneHeaderRowHVertical : 0;

    const maxNodeW = Math.max(
      170,
      ...flowNodes.map((n) => toNumber((n.data as any)?.size?.w ?? (n as any).width, 170))
    );
    const maxNodeH = Math.max(
      70,
      ...flowNodes.map((n) => toNumber((n.data as any)?.size?.h ?? (n as any).height, 70))
    );

    // adjacency for level computation
    const byId = new Map(flowNodes.map((n) => [n.id, n]));
    const out = new Map<string, string[]>();
    const indeg = new Map<string, number>();
    for (const n of flowNodes) {
      out.set(n.id, []);
      indeg.set(n.id, 0);
    }
    for (const e of edges) {
      if (!byId.has(e.source) || !byId.has(e.target)) continue;
      out.get(e.source)!.push(e.target);
      indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
    }

    const q: string[] = [];
    for (const [id, d] of indeg.entries()) if (d === 0) q.push(id);

    const order: string[] = [];
    while (q.length) {
      const n = q.shift()!;
      order.push(n);
      for (const to of out.get(n) ?? []) {
        indeg.set(to, (indeg.get(to) ?? 0) - 1);
        if ((indeg.get(to) ?? 0) === 0) q.push(to);
      }
    }
    for (const id of byId.keys()) if (!order.includes(id)) order.push(id);

    const level = new Map<string, number>();
    for (const id of order) level.set(id, 0);
    for (const id of order) {
      const base = level.get(id) ?? 0;
      for (const to of out.get(id) ?? []) level.set(to, Math.max(level.get(to) ?? 0, base + 1));
    }

    // lane-level conflict resolution: keep columns unique within a lane
    const usedByLane = Array.from({ length: laneCount }, () => new Set<number>());
    const stable = flowNodes
      .map((n) => ({ id: n.id, laneIndex: Math.max(0, Math.min(laneCount - 1, toNumber((n.data as any)?.laneIndex, 0))) }))
      .sort((a, b) => (level.get(a.id) ?? 0) - (level.get(b.id) ?? 0) || a.id.localeCompare(b.id));

    let maxLevel = 0;
    for (const item of stable) {
      let l = level.get(item.id) ?? 0;
      while (usedByLane[item.laneIndex].has(l)) l++;
      usedByLane[item.laneIndex].add(l);
      level.set(item.id, l);
      maxLevel = Math.max(maxLevel, l);
    }

    // Expand container if needed so the right-most column stays inside the lane.
    const requiredW =
      orientation === "horizontal"
        ? laneNameCol + pad * 2 + (maxLevel + 1) * colGap + maxNodeW + 40
        : pad * 2 + (maxLevel + 1) * colGap + maxNodeW + 40;
    const nextW = Math.max(width, requiredW);
    if (nextW !== width) {
      (laneNode.data as any).width = nextW;
      (laneNode.style as any).width = nextW;
    }

    const nextContentW = Math.max(1, nextW - laneNameCol);
    const nextContentH =
      orientation === "horizontal"
        ? Math.max(1, height - headerH)
        : Math.max(1, height - headerH - laneHeaderRowH);
    const bandH = orientation === "horizontal" ? nextContentH / laneCount : nextContentH;
    const bandW = orientation === "vertical" ? Math.max(1, nextW) / laneCount : nextContentW;

    const placed = flowNodes.map((n) => {
      const laneIndex = Math.max(0, Math.min(laneCount - 1, toNumber((n.data as any)?.laneIndex, 0)));
      const l = level.get(n.id) ?? 0;

      const bandX = orientation === "horizontal" ? laneNameCol : bandW * laneIndex;
      const bandY = orientation === "horizontal" ? bandH * laneIndex : headerH + laneHeaderRowH;

      const desiredAbs = {
        x: laneAbs.x + bandX + pad + l * colGap,
        y: laneAbs.y + (orientation === "horizontal" ? headerH + bandY + pad + rowInset : bandY + pad + rowInset),
      };

      const clamped = clampAbsToLane({
        laneNode: laneNode as any,
        laneIndex,
        abs: desiredAbs,
        nodeSize: { w: toNumber((n.data as any)?.size?.w, 170), h: toNumber((n.data as any)?.size?.h, maxNodeH) },
      });

      const relPos = { x: clamped.x - laneAbs.x, y: clamped.y - laneAbs.y };
      return { ...n, position: relPos };
    });

    return [laneNode, ...placed];
  })();

  const hardened = hardenSnapshot({ nodes: layouted, edges, meta: ensureMeta({ themeId: ctx.themeId, layoutMode: "free" }, ctx.themeId) }, warnings);
  return { snapshot: hardened, warnings };
}

type FlowchartImportJson = {
  diagram_type?: string;
  type?: string;
  title?: string;
  nodes?: Array<{ id?: string; label?: string; kind?: string; x?: number; y?: number; meta?: any; size?: any }>;
  steps?: Array<{ id?: string; label?: string; kind?: string }>;
  edges?: Array<{ id?: string; source: string; target: string; label?: string; async?: boolean }>;
  connections?: Array<{ source?: string; from?: string; target?: string; to?: string; label?: string; async?: boolean }>;
};

function looksLikeFlowchartImportJson(v: unknown): v is FlowchartImportJson {
  if (!isPlainObject(v)) return false;
  const nodes = (v as any).nodes ?? (v as any).steps;
  return Array.isArray(nodes);
}

function topoLayout(ids: string[], edges: Array<{ source: string; target: string }>) {
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const id of ids) {
    adj.set(id, []);
    indeg.set(id, 0);
  }
  for (const e of edges) {
    if (!adj.has(e.source) || !adj.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  const q: string[] = [];
  for (const [id, d] of indeg.entries()) if (d === 0) q.push(id);

  const order: string[] = [];
  while (q.length) {
    const n = q.shift()!;
    order.push(n);
    for (const to of adj.get(n) ?? []) {
      indeg.set(to, (indeg.get(to) ?? 0) - 1);
      if ((indeg.get(to) ?? 0) === 0) q.push(to);
    }
  }

  // cycles: append remaining deterministically
  for (const id of ids) if (!order.includes(id)) order.push(id);
  return order;
}

function importFlowchartJson(ctx: DiagramJsonImportContext, input: FlowchartImportJson): DiagramJsonImportResult {
  const warnings: string[] = [];
  assertDiagramTypeMatch(ctx, input as any, warnings);

  const rawNodes = Array.isArray(input.nodes) ? input.nodes : Array.isArray(input.steps) ? input.steps : [];
  if (!rawNodes.length) throw new Error('Flowchart JSON must include "nodes" or "steps" (non-empty array).');

  const normalizedNodes = rawNodes.map((n, idx) => {
    const id = asString((n as any)?.id).trim() || `fc_${idx + 1}`;
    return { ...n, id };
  });

  const rawEdges = Array.isArray(input.edges) ? input.edges : [];
  const conns = Array.isArray(input.connections) ? input.connections : [];
  const normalizedConnections = conns.map((c) => ({
    source: asString((c as any).source ?? (c as any).from).trim(),
    target: asString((c as any).target ?? (c as any).to).trim(),
    label: asString((c as any).label).trim(),
    async: Boolean((c as any).async),
  }));

  const ids = normalizedNodes.map((n) => asString((n as any).id).trim());
  const idSet = new Set(ids);

  const simpleEdges = [...rawEdges.map((e) => ({ source: asString(e.source).trim(), target: asString(e.target).trim() })), ...normalizedConnections].filter(
    (e) => idSet.has(e.source) && idSet.has(e.target)
  );

  const direction: FlowchartLayoutDirection = ctx.flowchartDirection ?? "TB";
  const order = topoLayout(ids, simpleEdges);

  const nodes: Node[] = order.map((id, idx) => {
    const n = normalizedNodes.find((x) => asString((x as any)?.id).trim() === id) ?? {};
    const kind = asString((n as any)?.kind).trim() || "process";
    const label = asString((n as any)?.label).trim() || "Step";
    const hasXY = Number.isFinite(Number((n as any)?.x)) && Number.isFinite(Number((n as any)?.y));

    const col = direction === "LR" ? idx : idx % 4;
    const row = direction === "LR" ? idx % 4 : Math.floor(idx / 4);
    const pos = hasXY
      ? { x: Number((n as any).x), y: Number((n as any).y) }
      : direction === "LR"
        ? { x: 140 + idx * 320, y: 160 + row * 170 }
        : { x: 160 + col * 320, y: 160 + row * 190 };

    return {
      id,
      type: "flowchart",
      position: pos,
      data: {
        kind,
        label,
        meta: (n as any)?.meta,
        size: (n as any)?.size,
      },
      style: { zIndex: 30 },
    } as any;
  });

  const edges: Edge[] = [
    ...(rawEdges ?? []).map((e) => ({
      id: safeId(asString(e?.id), "e"),
      source: asString(e.source).trim(),
      target: asString(e.target).trim(),
      type: "labeled",
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { label: asString(e?.label).trim(), async: Boolean((e as any)?.async) || undefined },
      style: (e as any)?.async ? { strokeDasharray: "6 4" } : undefined,
    })),
    ...normalizedConnections.map((c) => ({
      id: safeId("", "e"),
      source: c.source,
      target: c.target,
      type: "labeled",
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { label: c.label, async: c.async || undefined },
      style: c.async ? { strokeDasharray: "6 4" } : undefined,
    })),
  ].filter((e) => idSet.has(e.source) && idSet.has(e.target)) as any;

  const hardened = hardenSnapshot({ nodes, edges, meta: ensureMeta({ themeId: ctx.themeId, layoutMode: "free" }, ctx.themeId) }, warnings);
  return { snapshot: hardened, warnings };
}

type OrgChartImportJson = {
  diagram_type?: string;
  type?: string;
  chartType?: OrgChartType;
  people?: Array<{
    id?: string;
    name?: string;
    title?: string;
    department?: string;
    deptColor?: string;
    employmentType?: "full_time" | "contractor";
    parentId?: string;
    managerId?: string;
    division?: string | null;
    group?: "core" | "staff" | null;
    x?: number;
    y?: number;
    size?: { w?: number; h?: number };
  }>;
  reports?: Array<{ manager: string; report: string; dashed?: boolean; label?: string }>;
};

function looksLikeOrgChartImportJson(v: unknown): v is OrgChartImportJson {
  if (!isPlainObject(v)) return false;
  return Array.isArray((v as any).people) || Array.isArray((v as any).reports);
}

function importOrgChartJson(ctx: DiagramJsonImportContext, input: OrgChartImportJson): DiagramJsonImportResult {
  const warnings: string[] = [];
  assertDiagramTypeMatch(ctx, input as any, warnings);

  const rawPeople = Array.isArray(input.people) ? input.people : [];
  const rawReports = Array.isArray(input.reports) ? input.reports : [];
  if (!rawPeople.length && !rawReports.length) throw new Error('Org chart JSON must include "people" and/or "reports".');

  const peopleById = new Map<string, any>();
  for (let idx = 0; idx < rawPeople.length; idx++) {
    const p = rawPeople[idx];
    const id = asString(p?.id).trim() || `person_${idx + 1}_${slugId(asString(p?.name))}`;
    peopleById.set(id, { ...p, id });
  }

  // If there are reports but no people list, synthesize person nodes from report ids.
  for (const r of rawReports) {
    const m = asString(r.manager).trim();
    const c = asString(r.report).trim();
    if (m && !peopleById.has(m)) peopleById.set(m, { id: m, name: m, title: "Manager", department: "Department" });
    if (c && !peopleById.has(c)) peopleById.set(c, { id: c, name: c, title: "Report", department: "Department" });
  }

  // Apply parent relationships from either person.parentId/managerId or reports array.
  const parentByChild = new Map<string, string>();
  for (const p of peopleById.values()) {
    const pid = asString(p.parentId ?? p.managerId).trim();
    if (pid) parentByChild.set(p.id, pid);
  }
  for (const r of rawReports) {
    const manager = asString(r.manager).trim();
    const report = asString(r.report).trim();
    if (manager && report) parentByChild.set(report, manager);
  }

  const nodes: Node[] = Array.from(peopleById.values()).map((p, idx) => {
    const hasXY = Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y));
    const pos = hasXY ? { x: Number(p.x), y: Number(p.y) } : { x: 160 + (idx % 4) * 320, y: 160 + Math.floor(idx / 4) * 220 };

    return {
      id: p.id,
      type: "org_person",
      position: pos,
      data: {
        kind: "org_person",
        name: asString(p.name).trim() || "Employee Name",
        title: asString(p.title).trim() || "Job Title",
        department: asString(p.department).trim() || "Department",
        deptColor: p.deptColor,
        employmentType: p.employmentType,
        parentNodeId: parentByChild.get(p.id) ?? null,
        division: p.division ?? null,
        group: p.group ?? null,
        size: p.size ? { w: toNumber(p.size.w, 260), h: toNumber(p.size.h, 120) } : undefined,
      },
      style: { zIndex: 30 },
    } as any;
  });

  const edges: Edge[] = [];
  for (const [child, parent] of parentByChild.entries()) {
    if (!peopleById.has(child) || !peopleById.has(parent)) continue;
    edges.push({
      id: `e_${parent}_${child}`,
      source: parent,
      target: child,
      type: "labeled",
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { label: "" },
    } as any);
  }

  const chartType = (input.chartType ?? ctx.orgChartType ?? "functional") as OrgChartType;
  const laidOut = autoLayoutOrg(nodes, chartType);

  const hardened = hardenSnapshot(
    { nodes: laidOut, edges, meta: ensureMeta({ themeId: ctx.themeId, layoutMode: "free", org: { chartType } }, ctx.themeId) },
    warnings
  );
  return { snapshot: hardened, warnings };
}

type ErdImportJson = {
  diagram_type?: string;
  type?: string;
  entities: Array<{ id?: string; name?: string; label?: string; weak?: boolean; fields?: ErdField[]; x?: number; y?: number; size?: { w?: number; h?: number } }>;
  relations?: Array<{
    id?: string;
    source: string;
    target: string;
    sourceCardinality?: ErdCardinality;
    targetCardinality?: ErdCardinality;
    label?: string;
  }>;
};

function looksLikeErdImportJson(v: unknown): v is ErdImportJson {
  if (!isPlainObject(v)) return false;
  return Array.isArray((v as any).entities);
}

function importErdJson(ctx: DiagramJsonImportContext, input: ErdImportJson): DiagramJsonImportResult {
  const warnings: string[] = [];
  assertDiagramTypeMatch(ctx, input as any, warnings);

  const entities = Array.isArray(input.entities) ? input.entities : [];
  if (!entities.length) throw new Error('ERD JSON must include "entities" (non-empty array).');

  const nodes: Node[] = entities.map((e, idx) => {
    const label = asString(e.label ?? e.name).trim() || "Entity";
    const id = asString(e.id).trim() || `erd_${idx + 1}_${slugId(label)}`;
    const hasXY = Number.isFinite(Number(e.x)) && Number.isFinite(Number(e.y));
    const pos = hasXY ? { x: Number(e.x), y: Number(e.y) } : { x: 160 + (idx % 3) * 420, y: 160 + Math.floor(idx / 3) * 320 };

    return {
      id,
      type: "erd_entity",
      position: pos,
      data: {
        kind: "erd_entity",
        label,
        weak: Boolean(e.weak),
        fields: Array.isArray(e.fields) ? e.fields : [],
        size: e.size ? { w: toNumber(e.size.w, 320), h: toNumber(e.size.h, 240) } : { w: 320, h: 240 },
      },
      style: { zIndex: 30 },
    } as any;
  });

  const byId = new Set(nodes.map((n) => n.id));
  const notation = ctx.erdNotation ?? "crows_foot";

  const edges: Edge[] = (Array.isArray(input.relations) ? input.relations : []).filter((r) => byId.has(r.source) && byId.has(r.target)).map((r) => {
    return {
      id: safeId(asString(r.id), "e"),
      source: r.source,
      target: r.target,
      type: "erd",
      data: {
        kind: "erd_relation",
        notation,
        sourceCardinality: r.sourceCardinality ?? "1..N",
        targetCardinality: r.targetCardinality ?? "1..1",
        label: asString(r.label).trim(),
      },
      style: { stroke: "#111827", strokeWidth: 2.2 },
    } as any;
  });

  const hardened = hardenSnapshot({ nodes, edges, meta: ensureMeta({ themeId: ctx.themeId, layoutMode: "free" }, ctx.themeId) }, warnings);
  return { snapshot: hardened, warnings };
}

export function importDiagramFromJson(ctx: DiagramJsonImportContext, input: unknown): DiagramJsonImportResult {
  if (ctx.diagramType === "swimlane" && looksLikeSwimlaneImportJson(input)) return importSwimlaneJson(ctx, input);
  if (ctx.diagramType === "flowchart" && looksLikeFlowchartImportJson(input)) return importFlowchartJson(ctx, input);
  if (ctx.diagramType === "org_chart" && looksLikeOrgChartImportJson(input)) return importOrgChartJson(ctx, input);
  if (ctx.diagramType === "erd" && looksLikeErdImportJson(input)) return importErdJson(ctx, input);

  if (looksLikeNativeSnapshot(input)) return importNativeSnapshot(ctx, input);

  // Give type-specific hints for accuracy.
  const expected =
    ctx.diagramType === "swimlane"
      ? 'Expected either a native snapshot {nodes, edges} OR swimlane JSON with "lanes" and optional "nodes"/"edges".'
      : ctx.diagramType === "erd"
        ? 'Expected either a native snapshot {nodes, edges} OR ERD JSON with "entities" and optional "relations".'
        : ctx.diagramType === "flowchart"
          ? 'Expected either a native snapshot {nodes, edges} OR flowchart JSON with "nodes"/"steps" and optional "edges"/"connections".'
          : ctx.diagramType === "org_chart"
            ? 'Expected either a native snapshot {nodes, edges} OR org chart JSON with "people" and/or "reports".'
            : 'Expected a native snapshot {nodes, edges}.';

  throw new Error(`Unrecognized JSON format for ${ctx.diagramType}. ${expected}`);
}
