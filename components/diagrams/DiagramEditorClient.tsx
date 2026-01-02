"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  ConnectionMode,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import BpmnPalette, { type BpmnPaletteItem } from "@/components/diagrams/BpmnPalette";
import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";
import EditableBpmnNode from "@/components/diagrams/nodes/EditableBpmnNodes";
import SwimlaneNode from "@/components/diagrams/nodes/SwimlaneNode";
import { validateConnection, type BpmnNodeData, type BpmnKind } from "@/lib/diagrams/bpmnRules";
import { exportDrawioXml } from "@/lib/diagrams/exportDrawioXml";
import { exportSimpleSvg } from "@/lib/diagrams/exportSvg";
import { exportBpmnXml } from "@/lib/diagrams/exportBpmnXml";
import { computeVisibility } from "@/lib/diagrams/nesting";
import { applyLayout, type LayoutMode } from "@/lib/diagrams/layout";
import {
  type LaneOrientation,
  createOrUpdateSwimlaneNode,
  findLaneAtPoint,
  snapNodeIntoLane,
  stripNonSerializableFromEdges,
  stripNonSerializableFromNodes,
  type SwimlaneNodeData,
} from "@/lib/diagrams/swimlanes";

import { DiagramEditorProvider, type EditorActions } from "@/components/diagrams/DiagramEditorContext";
import { saveAs } from "file-saver";

/**
 * ✅ NodeTypes cast (xyflow v12 typing vs custom node components)
 */
const NODE_TYPES = {
  bpmn: EditableBpmnNode as unknown as React.ComponentType<any>,
  swimlane: SwimlaneNode as unknown as React.ComponentType<any>,
} satisfies NodeTypes;

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function sameIds(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

type Snap = {
  nodes: Node[];
  edges: Edge[];
  meta?: { themeId?: string; layoutMode?: LayoutMode };
};

function getFocusParam() {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("focus");
  return v && v.trim().length ? v.trim() : null;
}

function LabeledEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd } = props;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const label = String(((props.data as any)?.label ?? props.label ?? "") as string).trim();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "white",
              border: "1px solid rgba(0,0,0,0.15)",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              pointerEvents: "all",
              userSelect: "none",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
const EDGE_TYPES = { labeled: LabeledEdge };

function nodeRect(n: Node) {
  const w = (n as any).width ?? (n.style as any)?.width ?? 180;
  const h = (n as any).height ?? (n.style as any)?.height ?? 100;
  const pos = (n as any).positionAbsolute ?? n.position ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y, w, h };
}

function normalizeLabel(label: string) {
  return String(label ?? "")
    .replace(/\s+Event$/i, "")
    .replace(/^XOR\s+/i, "")
    .trim();
}

function getPaletteKind(item: any): string {
  // Support both shapes:
  // - your usage: item.kind
  // - your palette file: item.type
  return String(item?.kind ?? item?.type ?? "task").trim();
}

function getPaletteColor(item: any): string {
  return String(item?.color ?? "#ffffff").trim();
}

/**
 * ✅ Strict BPMN kind coercion (fixes: "Type 'string' is not assignable to type 'BpmnKind'")
 * - Palette can send any string
 * - We only persist allowed BpmnKind values
 * - Safe fallback: "task"
 */
const BPMN_KINDS = [
  "start_event",
  "end_event",
  "intermediate_message",
  "intermediate_timer",
  "task",
  "subprocess",
  "gateway_xor_split",
  "gateway_xor_merge",
  "data_io",
  "document",
  "database",
  "connector",
  "fork_join",
  "delay",
  "loop_start",
  "loop_end",
] as const satisfies readonly BpmnKind[];

const BPMN_KIND_SET = new Set<string>(BPMN_KINDS as unknown as string[]);

function toBpmnKind(input: unknown): BpmnKind {
  const raw = String(input ?? "").trim();
  if (BPMN_KIND_SET.has(raw)) return raw as BpmnKind;

  // optional: map common aliases to a valid kind (prevents future palette mismatches)
  const lower = raw.toLowerCase();
  if (lower === "gateway" || lower === "xor" || lower === "decision") return "gateway_xor_split";
  if (lower === "start") return "start_event";
  if (lower === "end") return "end_event";

  return "task";
}

function Canvas(props: any) {
  const rf = useReactFlow();

  useEffect(() => {
    if (!props.requestFitKey) return;
    try {
      rf.fitView({ padding: 0.25, duration: 350, maxZoom: 1.1 });
    } catch {}
  }, [props.requestFitKey, rf]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        rf.fitView({ padding: 0.25, duration: 350, maxZoom: 1.1 });
      } catch {}
    }, 120);
    return () => clearTimeout(t);
  }, [rf]);

  useEffect(() => {
    if (!props.focusNodeId) return;
    const node = props.nodes.find((n: any) => n.id === props.focusNodeId);
    if (!node) return;

    props.setSelectedNodeIds([props.focusNodeId]);
    props.setSelectedEdgeIds([]);

    const glowKey = Date.now();
    props.setNodes((nds: any[]) =>
      nds.map((n: any) => (n.id === props.focusNodeId ? { ...n, data: { ...(n.data as any), __focusGlow: glowKey } } : n))
    );

    const t = setTimeout(() => {
      try {
        rf.fitView({ nodes: [node], padding: 0.45, duration: 550, maxZoom: 1.1 });
      } catch {}
    }, 60);

    const clear = setTimeout(() => {
      props.setNodes((nds: any[]) =>
        nds.map((n: any) => (n.id === props.focusNodeId ? { ...n, data: { ...(n.data as any), __focusGlow: null } } : n))
      );
    }, 2500);

    return () => {
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, [props.focusNodeId, props.nodes, rf, props.setNodes, props.setSelectedEdgeIds, props.setSelectedNodeIds]);

  return (
    <ReactFlow
      nodes={props.visibleNodes}
      edges={props.visibleEdges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={props.onNodesChange}
      onEdgesChange={props.onEdgesChange}
      onConnect={props.onConnect}
      isValidConnection={props.isValidConnection}
      nodesConnectable
      connectionMode={ConnectionMode.Loose}
      connectionLineType={ConnectionLineType.SmoothStep}
      defaultEdgeOptions={{
        type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: props.theme.accent },
      }}
      onSelectionChange={props.onSelectionChange}
      onNodeDragStop={props.onNodeDragStop}
      fitView
      fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
      style={{ width: "100%", height: "100%", background: props.theme.canvasBg }}
    >
      <Background gap={22} size={1} color={props.theme.gridDot} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default function DiagramEditorClient({ diagram }: { diagram: any }) {
  const [title, setTitle] = useState<string>(diagram?.name ?? "Untitled Diagram");
  const [themeId, setThemeId] = useState<string>(diagram?.current_snapshot?.meta?.themeId ?? "paper");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(diagram?.current_snapshot?.meta?.layoutMode ?? "free");
  const theme: DiagramTheme = useMemo(() => THEMES.find((t) => t.id === themeId) ?? THEMES[1], [themeId]);

  const initialSnap: Snap = useMemo(() => {
    const snap = diagram?.current_snapshot;
    if (snap?.nodes && snap?.edges) return snap;

    return {
      nodes: [
        {
          id: "start",
          type: "bpmn",
          position: { x: 140, y: 200 },
          data: { kind: "start_event", label: "Start", meta: { color: "#ECFDF5" } },
          style: { zIndex: 10 },
        } as any,
        {
          id: "end",
          type: "bpmn",
          position: { x: 560, y: 260 },
          data: { kind: "end_event", label: "End", meta: { color: "#FEF2F2" } },
          style: { zIndex: 10 },
        } as any,
      ],
      edges: [
        {
          id: "e-start-end",
          source: "start",
          target: "end",
          type: "labeled",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: theme.accent },
          data: { label: "" },
        } as any,
      ],
      meta: { themeId, layoutMode: "free" },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialSnap.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialSnap.edges);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeIds[0]), [edges, selectedEdgeIds]);
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeIds[0]), [nodes, selectedNodeIds]);

  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  useEffect(() => setFocusNodeId(getFocusParam()), []);

  const { visibleNodes, visibleEdges } = useMemo(() => computeVisibility(nodes as any, edges as any), [nodes, edges]);

  const [paletteOpen, setPaletteOpen] = useState(true);
  const [propsOpen, setPropsOpen] = useState(true);

  // keep theme in node data (both BPMN + swimlane nodes read theme from data or context)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const kind = (n.data as any)?.kind;
        const zIndex = kind === "swimlane" ? 0 : 10;
        return { ...n, data: { ...(n.data ?? {}), theme }, style: { ...(n.style as any), zIndex } };
      })
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        type: "labeled",
        style: { ...(e.style ?? {}), strokeWidth: 2, stroke: theme.accent },
        markerEnd: { type: MarkerType.ArrowClosed },
      }))
    );
  }, [theme, setNodes, setEdges]);

  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  const titleRef = useRef(title);
  const metaRef = useRef({ themeId, layoutMode });

  useEffect(() => void (nodesRef.current = nodes), [nodes]);
  useEffect(() => void (edgesRef.current = edges), [edges]);
  useEffect(() => void (titleRef.current = title), [title]);
  useEffect(() => void (metaRef.current = { themeId, layoutMode }), [themeId, layoutMode]);

  const sanitizeSnap = useCallback((snap: Snap): Snap => {
    return {
      ...snap,
      nodes: stripNonSerializableFromNodes(snap.nodes as any) as any,
      edges: stripNonSerializableFromEdges(snap.edges as any) as any,
    };
  }, []);

  const autosaveNow = useCallback(
    async (overrideNodes?: Node[], overrideEdges?: Edge[]) => {
      const snap: Snap = sanitizeSnap({
        nodes: (overrideNodes ?? nodesRef.current) as any,
        edges: (overrideEdges ?? edgesRef.current) as any,
        meta: { ...metaRef.current },
      });

      await fetch(`/api/diagrams/${diagram.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: titleRef.current, snapshot: snap }),
      }).catch(() => {});
    },
    [diagram.id, sanitizeSnap]
  );

  // interval autosave
  useEffect(() => {
    const t = setInterval(() => autosaveNow(), 6000);
    return () => clearInterval(t);
  }, [autosaveNow]);

  // debounce quick bursts (SaaS-grade feel)
  const debouncedSaveRef = useRef<any>(null);
  const requestAutosaveSoon = useCallback(() => {
    if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);
    debouncedSaveRef.current = setTimeout(() => autosaveNow(), 250);
  }, [autosaveNow]);

  const onSelectionChange = useCallback((sel: { nodes?: any[]; edges?: any[] }) => {
    const nextNodeIds = (sel.nodes ?? []).map((n) => n.id).sort();
    const nextEdgeIds = (sel.edges ?? []).map((e) => e.id).sort();
    setSelectedNodeIds((prev) => (sameIds(prev, nextNodeIds) ? prev : nextNodeIds));
    setSelectedEdgeIds((prev) => (sameIds(prev, nextEdgeIds) ? prev : nextEdgeIds));
  }, []);

  const [requestFitKey, setRequestFitKey] = useState<number>(0);

  const isValidConnection = useCallback((c: Connection) => {
    const src = nodesRef.current.find((n) => n.id === c.source);
    const tgt = nodesRef.current.find((n) => n.id === c.target);
    if (!src || !tgt) return false;

    const sourceKind = (src.data as any)?.kind as string | undefined;
    const targetKind = (tgt.data as any)?.kind as string | undefined;
    if (!sourceKind || !targetKind) return false;
    if (sourceKind === "swimlane" || targetKind === "swimlane") return false;

    const sourceOutgoingCount = edgesRef.current.filter((e) => e.source === src.id).length;
    const targetIncomingCount = edgesRef.current.filter((e) => e.target === tgt.id).length;

    const verdict = validateConnection({
      sourceKind: sourceKind as any,
      targetKind: targetKind as any,
      sourceOutgoingCount,
      targetIncomingCount,
    });

    return verdict.ok;
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const src = nodesRef.current.find((n) => n.id === connection.source);
      const tgt = nodesRef.current.find((n) => n.id === connection.target);
      if (!src || !tgt) return;

      const sourceKind = (src.data as any)?.kind as string | undefined;
      const targetKind = (tgt.data as any)?.kind as string | undefined;
      if (sourceKind === "swimlane" || targetKind === "swimlane") return;

      const sourceOutgoingCount = edgesRef.current.filter((e) => e.source === src.id).length;
      const targetIncomingCount = edgesRef.current.filter((e) => e.target === tgt.id).length;

      const verdict = validateConnection({
        sourceKind: sourceKind as any,
        targetKind: targetKind as any,
        sourceOutgoingCount,
        targetIncomingCount,
      });

      if (!verdict.ok) {
        alert(verdict.reason);
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "labeled",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2, stroke: theme.accent },
            data: { label: "" },
          } as any,
          eds
        )
      );

      requestAutosaveSoon();
    },
    [setEdges, theme.accent, requestAutosaveSoon]
  );

  const onNodeDragStop = useCallback(
    (_evt: any, dragged: Node) => {
      if (!dragged?.id) return;
      if ((dragged.data as any)?.kind === "swimlane") return;

      const dRect = nodeRect(dragged);
      const cx = dRect.x + dRect.w / 2;
      const cy = dRect.y + dRect.h / 2;

      const hit = findLaneAtPoint(nodesRef.current as any, cx, cy);
      if (!hit) {
        requestAutosaveSoon();
        return;
      }

      const snapped = snapNodeIntoLane({
        dragged: dragged as any,
        laneNode: hit.laneNode as any,
        laneIndex: hit.laneIndex,
      });

      setNodes((nds) =>
        nds.map((n) =>
          n.id === dragged.id
            ? { ...n, position: { x: snapped.x, y: snapped.y }, style: { ...(n.style as any), zIndex: 10 } }
            : n
        )
      );

      requestAutosaveSoon();
    },
    [setNodes, requestAutosaveSoon]
  );

  const renameSwimlaneHeader = useCallback(
    (laneNodeId: string, label: string) => {
      const nextLabel = (label ?? "").trim() || "Swim Lanes";

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== laneNodeId) return n;
          const data: any = n.data ?? {};
          if (data.kind !== "swimlane") return n;

          return {
            ...n,
            data: {
              ...data,
              label: nextLabel,
            },
          };
        })
      );

      requestAutosaveSoon();
    },
    [setNodes, requestAutosaveSoon]
  );

  // ---------- Editor actions ----------
  const actions: EditorActions = useMemo(
    () => ({
      theme,

      creatingChildFor: null,
      createChildForNode: async (nodeId: string) => {
        await fetch(`/api/diagrams/${diagram.id}/subprocess/create-child`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subprocessNodeId: nodeId }),
        }).catch(() => {});
      },
      openChild: (childId: string) => {
        window.location.href = `/tools/diagrams/${childId}`;
      },

      renameNode: (nodeId: string, label: string) => {
        setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data as any), label } } : n)));
        requestAutosaveSoon();
      },

      toggleCollapsed: (nodeId: string) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...(n.data as any), collapsed: !(n.data as any)?.collapsed } } : n
          )
        );
        requestAutosaveSoon();
      },

      renameSwimlaneHeader,

      upsertSwimlanes: (orientation: LaneOrientation) => {
        setNodes((nds) => {
          const existing = nds.find((n) => (n.data as any)?.kind === "swimlane");
          const laneNode = createOrUpdateSwimlaneNode({
            existingId: existing?.id,
            orientation,
            lanes: (existing?.data as any)?.lanes ?? ["Lane 1", "Lane 2", "Lane 3"],
            origin: existing?.position ?? { x: 120, y: 120 },
            width: (existing?.data as any)?.width,
            height: (existing?.data as any)?.height,
            theme,
            label: (existing?.data as any)?.label ?? "Swim Lanes",
            dividers: (existing?.data as any)?.dividers ?? 0,
            dividerPositions: (existing?.data as any)?.dividerPositions,
            locked: (existing?.data as any)?.locked ?? false,
          });

          const filtered = nds.filter((n) => (n.data as any)?.kind !== "swimlane");
          return [laneNode as any, ...filtered];
        });

        requestAutosaveSoon();
        setRequestFitKey(Date.now());
      },

      aiGenerateSwimlanes: async () => {
        const res = await fetch(`/api/diagrams/${diagram.id}/lanes/ai-generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            actors: [],
            nodes: nodesRef.current.map((n) => n.data),
            edges: edgesRef.current,
          }),
        }).catch(() => null);

        const data = res ? await res.json().catch(() => null) : null;
        const lanes = Array.isArray(data?.lanes) ? data.lanes : ["Lane 1", "Lane 2"];
        const orientation = data?.orientation === "vertical" ? "vertical" : "horizontal";

        setNodes((nds) => {
          const existing = nds.find((n) => (n.data as any)?.kind === "swimlane");
          const laneNode = createOrUpdateSwimlaneNode({
            existingId: existing?.id,
            orientation,
            lanes,
            origin: existing?.position ?? { x: 120, y: 120 },
            theme,
            label: (existing?.data as any)?.label ?? "Swim Lanes",
            dividers: (existing?.data as any)?.dividers ?? 0,
            dividerPositions: (existing?.data as any)?.dividerPositions,
          });
          const filtered = nds.filter((n) => (n.data as any)?.kind !== "swimlane");
          return [laneNode as any, ...filtered];
        });

        requestAutosaveSoon();
        setRequestFitKey(Date.now());
      },

      renameLane: (laneNodeId: string, laneIndex: number, name: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;
            const d = n.data as any as SwimlaneNodeData;
            const next = [...(d.lanes ?? [])];
            next[laneIndex] = name;
            return { ...n, data: { ...(n.data as any), lanes: next } };
          })
        );
        requestAutosaveSoon();
      },

      setLaneDividers: (laneNodeId: string, dividers: number) => {
        setNodes((nds) =>
          nds.map((n) => (n.id === laneNodeId ? { ...n, data: { ...(n.data as any), dividers } } : n))
        );
        requestAutosaveSoon();
      },

      setLaneDividerPositions: (laneNodeId: string, positions: number[]) => {
        setNodes((nds) =>
          nds.map((n) => (n.id === laneNodeId ? { ...n, data: { ...(n.data as any), dividerPositions: positions } } : n))
        );
        requestAutosaveSoon();
      },

      toggleLaneLock: (laneNodeId: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;
            const locked = !Boolean((n.data as any)?.locked);
            return { ...n, draggable: !locked, data: { ...(n.data as any), locked } };
          })
        );
        requestAutosaveSoon();
      },

      resizeLaneContainer: (laneNodeId: string, width: number, height: number) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === laneNodeId
              ? { ...n, data: { ...(n.data as any), width, height }, style: { ...(n.style as any), width, height } }
              : n
          )
        );
        requestAutosaveSoon();
      },

      addLane: (laneNodeId: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;
            const lanes = Array.isArray((n.data as any)?.lanes) ? [...(n.data as any).lanes] : ["Lane 1"];
            lanes.push(`Lane ${lanes.length + 1}`);
            return { ...n, data: { ...(n.data as any), lanes } };
          })
        );
        requestAutosaveSoon();
      },

      removeLane: (laneNodeId: string) => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== laneNodeId) return n;
            const lanes = Array.isArray((n.data as any)?.lanes) ? [...(n.data as any).lanes] : ["Lane 1"];
            if (lanes.length <= 1) return n;
            lanes.pop();
            return { ...n, data: { ...(n.data as any), lanes } };
          })
        );
        requestAutosaveSoon();
      },

      openAiFullProcessModal: () => {
        alert("AI full-process modal: hook this to your existing modal if you have one.");
      },
    }),
    [theme, diagram.id, title, setNodes, renameSwimlaneHeader, requestAutosaveSoon]
  );

  // --------- Palette handlers ----------
  const addBpmn = useCallback(
    (item: BpmnPaletteItem) => {
      const kind = toBpmnKind(getPaletteKind(item)); // ✅ FIXED: BpmnKind
      const id = `${kind}_${uid()}`;

      const safeLabel = normalizeLabel(String((item as any)?.label ?? "Step"));
      const color = getPaletteColor(item);

      const newNode: Node = {
        id,
        type: "bpmn",
        position: { x: 220 + Math.random() * 220, y: 160 + Math.random() * 160 },
        data: {
          kind, // ✅ now valid BpmnKind
          label: safeLabel,
          meta: { color },
        } satisfies BpmnNodeData,
        style: { zIndex: 10 },
      } as any;

      setNodes((nds) => [...nds, newNode]);
      requestAutosaveSoon();
    },
    [setNodes, requestAutosaveSoon]
  );

  const addSwimlane = useCallback(
    (orientation: LaneOrientation) => {
      actions.upsertSwimlanes(orientation);
    },
    [actions]
  );

  // ------- Layout -------
  return (
    <DiagramEditorProvider value={actions}>
      <div className="w-full h-full flex">
        {paletteOpen ? (
          <BpmnPalette
            onAdd={addBpmn}
            onSwimlaneHorizontal={() => addSwimlane("horizontal")}
            onSwimlaneVertical={() => addSwimlane("vertical")}
          />
        ) : null}

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="border-b bg-white px-3 py-2 flex items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 rounded-xl border px-3 py-2 text-sm" />
            <button className="rounded-xl border px-3 py-2 text-sm" onClick={() => setPaletteOpen((v) => !v)}>
              {paletteOpen ? "Hide Palette" : "Show Palette"}
            </button>

            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() => {
                const next = layoutMode === "free" ? "tree_lr" : layoutMode === "tree_lr" ? "tree_tb" : "free";
                setLayoutMode(next);
                const laid = applyLayout(nodesRef.current as any, edgesRef.current as any, next);
                setNodes(laid as any);
                requestAutosaveSoon();
                setRequestFitKey(Date.now());
              }}
            >
              Layout: {layoutMode}
            </button>

            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() => actions.aiGenerateSwimlanes()}
              title="Generate lanes using AI"
            >
              AI Lanes
            </button>

            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() => {
                const xml = exportBpmnXml(nodesRef.current as any, edgesRef.current as any, { title });
                saveAs(new Blob([xml], { type: "application/xml;charset=utf-8" }), `${title || "diagram"}.bpmn.xml`);
              }}
              title="Export BPMN XML"
            >
              Export BPMN
            </button>

            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() => {
                const xml = exportDrawioXml(nodesRef.current as any, edgesRef.current as any, { title });
                saveAs(new Blob([xml], { type: "application/xml;charset=utf-8" }), `${title || "diagram"}.drawio.xml`);
              }}
              title="Export draw.io XML"
            >
              Export Draw.io
            </button>

            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() => {
                const svg = exportSimpleSvg(nodesRef.current as any, edgesRef.current as any, { title });
                saveAs(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${title || "diagram"}.svg`);
              }}
              title="Export SVG"
            >
              Export SVG
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <ReactFlowProvider>
              <Canvas
                theme={theme}
                visibleNodes={visibleNodes}
                visibleEdges={visibleEdges}
                nodes={nodes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onSelectionChange={onSelectionChange}
                onNodeDragStop={onNodeDragStop}
                focusNodeId={focusNodeId}
                setSelectedNodeIds={setSelectedNodeIds}
                setSelectedEdgeIds={setSelectedEdgeIds}
                setNodes={setNodes}
                requestFitKey={requestFitKey}
              />
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </DiagramEditorProvider>
  );
}
