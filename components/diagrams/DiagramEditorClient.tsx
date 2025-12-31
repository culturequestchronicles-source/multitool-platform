"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  MarkerType,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import BpmnPalette, { type BpmnPaletteItem } from "@/components/diagrams/BpmnPalette";
import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";
import EditableBpmnNode from "@/components/diagrams/nodes/EditableBpmnNodes";
import SwimlaneNode from "@/components/diagrams/nodes/SwimlaneNode";
import { validateConnection, type BpmnNodeData } from "@/lib/diagrams/bpmnRules";
import { exportSimpleSvg } from "@/lib/diagrams/exportSvg";
import { exportBpmnXml } from "@/lib/diagrams/exportBpmnXml";
import SwimlaneNode, { type SwimlaneNodeData } from "@/components/diagrams/nodes/SwimlaneNode";
import { saveAs } from "file-saver";

import { computeVisibility } from "@/lib/diagrams/nesting";
import { applyLayout, type LayoutMode } from "@/lib/diagrams/layout";
import {
  type LaneOrientation,
  makeLaneNodes,
  findLaneAtPoint,
  snapNodeIntoLane,
  stripNonSerializableFromEdges,
  stripNonSerializableFromNodes,
} from "@/lib/diagrams/swimlanes";

import { DiagramEditorProvider } from "@/components/diagrams/DiagramEditorContext";

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

function FocusHelper({
  focusNodeId,
  nodes,
  setSelectedNodeIds,
  setSelectedEdgeIds,
  setNodes,
}: {
  focusNodeId: string | null;
  nodes: Node[];
  setSelectedNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedEdgeIds: React.Dispatch<React.SetStateAction<string[]>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}) {
  const rf = useReactFlow();

  useEffect(() => {
    if (!focusNodeId) return;
    const node = nodes.find((n) => n.id === focusNodeId);
    if (!node) return;

    setSelectedNodeIds([focusNodeId]);
    setSelectedEdgeIds([]);

    const glowKey = Date.now();
    setNodes((nds) =>
      nds.map((n) =>
        n.id === focusNodeId ? { ...n, data: { ...(n.data as any), __focusGlow: glowKey } } : n
      )
    );

    const t = setTimeout(() => {
      try {
        rf.fitView({ nodes: [node], padding: 0.45, duration: 700 });
      } catch {}
    }, 50);

    const clear = setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === focusNodeId ? { ...n, data: { ...(n.data as any), __focusGlow: null } } : n
        )
      );
    }, 2500);

    return () => {
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, [focusNodeId, nodes, rf, setNodes, setSelectedEdgeIds, setSelectedNodeIds]);

  return null;
}

// ✅ nodeTypes must be stable
const NODE_TYPES = {
  bpmn: EditableBpmnNode,
  swimlane: SwimlaneNode,
};

function nodeRect(n: Node) {
  const w = (n as any).width ?? 180;
  const h = (n as any).height ?? 100;
  const pos = (n as any).positionAbsolute ?? n.position ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y, w, h };
}

export default function DiagramEditorClient({ diagram }: { diagram: any }) {
  const [title, setTitle] = useState<string>(diagram?.name ?? "Untitled Diagram");
  const [themeId, setThemeId] = useState<string>(diagram?.current_snapshot?.meta?.themeId ?? "paper");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(
    diagram?.current_snapshot?.meta?.layoutMode ?? "free"
  );

  const theme: DiagramTheme = useMemo(
    () => THEMES.find((t) => t.id === themeId) ?? THEMES[1],
    [themeId]
  );

  const initialSnap: Snap = useMemo(() => {
    const snap = diagram?.current_snapshot;
    if (snap?.nodes && snap?.edges) return snap;

    return {
      nodes: [
        {
          id: "start",
          type: "bpmn",
          position: { x: 140, y: 200 },
          data: { kind: "start_event", label: "Start", theme, collapsed: false, meta: {} },
        },
        {
          id: "end",
          type: "bpmn",
          position: { x: 560, y: 260 },
          data: { kind: "end_event", label: "End", theme, collapsed: false, meta: {} },
        },
      ],
      edges: [
        {
          id: "e-start-end",
          source: "start",
          target: "end",
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: theme.accent },
        },
      ],
      meta: { themeId, layoutMode: "free" },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialSnap.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialSnap.edges);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeIds[0]),
    [nodes, selectedNodeIds]
  );

  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  useEffect(() => setFocusNodeId(getFocusParam()), []);

  const [creatingChildFor, setCreatingChildFor] = useState<string | null>(null);

  // AI Modal
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiWorking, setAiWorking] = useState(false);

  // ✅ visibility via hidden flags
  const { visibleNodes, visibleEdges } = useMemo(
    () => computeVisibility(nodes, edges),
    [nodes, edges]
  );

  // Apply theme to all nodes/edges when theme changes (safe)
  useEffect(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...(n.data ?? {}), theme } })));
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...(e.style ?? {}), strokeWidth: 2, stroke: theme.accent },
        markerEnd: { type: MarkerType.ArrowClosed },
      }))
    );
  }, [theme, setNodes, setEdges]);

  // ---- refs for stable autosave + click actions ----
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
      nodes: stripNonSerializableFromNodes(snap.nodes),
      edges: stripNonSerializableFromEdges(snap.edges),
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

  useEffect(() => {
    const t = setInterval(() => autosaveNow(), 6000);
    return () => clearInterval(t);
  }, [autosaveNow]);

  const onSelectionChange = useCallback((sel: { nodes?: any[]; edges?: any[] }) => {
    const nextNodeIds = (sel.nodes ?? []).map((n) => n.id).sort();
    const nextEdgeIds = (sel.edges ?? []).map((e) => e.id).sort();
    setSelectedNodeIds((prev) => (sameIds(prev, nextNodeIds) ? prev : nextNodeIds));
    setSelectedEdgeIds((prev) => (sameIds(prev, nextEdgeIds) ? prev : nextEdgeIds));
  }, []);

  const runLayout = useCallback(
    (mode: LayoutMode) => {
      setLayoutMode(mode);
      const laidOut = applyLayout(
        visibleNodes.filter((n) => !n.hidden),
        visibleEdges.filter((e) => !(e as any).hidden),
        mode
      );
      const posById = new Map(laidOut.map((n) => [n.id, n.position]));
      setNodes((nds) =>
        nds.map((n) => (posById.has(n.id) ? { ...n, position: posById.get(n.id)! } : n))
      );
    },
    [setNodes, visibleNodes, visibleEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const src = nodesRef.current.find((n) => n.id === connection.source);
      const tgt = nodesRef.current.find((n) => n.id === connection.target);
      if (!src || !tgt) return;

      const sourceKind = (src.data as any)?.kind as string | undefined;
      const targetKind = (tgt.data as any)?.kind as string | undefined;

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
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2, stroke: theme.accent },
          } as Edge,
          eds
        )
      );
    },
    [setEdges, theme.accent]
  );

  const addSwimlane = useCallback(
    (orientation: "horizontal" | "vertical", lanesInput?: string[]) => {
      let lanes = lanesInput?.filter(Boolean).map((lane) => lane.trim()) ?? [];
      if (!lanes.length) {
        const labelsRaw = window.prompt(
          "Enter swim lane names (comma-separated). Example: Actors, Systems, Departments"
        );
        if (!labelsRaw) return;
        lanes = labelsRaw
          .split(",")
          .map((label) => label.trim())
          .filter(Boolean);
      }
      if (!lanes.length) {
        alert("Please enter at least one swim lane name.");
        return;
      }

      const laneCount = lanes.length;
      const width = orientation === "horizontal" ? 960 : Math.max(240 * laneCount, 520);
      const height = orientation === "horizontal" ? Math.max(160 * laneCount, 320) : 520;

      setNodes((nds) => [
        ...nds,
        {
          id: `swimlane_${uid()}`,
          type: "swimlane",
          position: { x: 120, y: 120 },
          data: {
            kind: "swimlane",
            label: "Swim Lanes",
            orientation,
            lanes,
            width,
            height,
            theme,
          } satisfies SwimlaneNodeData,
        },
      ]);
    },
    [setNodes, theme]
  );

  const addFromPalette = useCallback(
    (item: BpmnPaletteItem) => {
      if (item.type === "swimlane_horizontal") {
        addSwimlane("horizontal");
        return;
      }
      if (item.type === "swimlane_vertical") {
        addSwimlane("vertical");
        return;
      }

      const id = uid();
      const centerX = 420;
      const centerY = 240;

      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "bpmn",
          position: {
            x: centerX + Math.random() * 140 - 70,
            y: centerY + Math.random() * 140 - 70,
          },
          data: {
            kind: item.type,
            label: item.label,
            theme,
            collapsed: false,
            meta: { actors: "" }, // ✅ actors stay metadata
          } satisfies BpmnNodeData & { theme: DiagramTheme },
        },
      ]);
    },
    [addSwimlane, setNodes, theme]
  );

  const deleteSelection = useCallback(() => {
    if (!selectedNodeIds.length && !selectedEdgeIds.length) return;

    setEdges((eds) => eds.filter((e) => !selectedEdgeIds.includes(e.id)));
    setNodes((nds) => nds.filter((n) => !selectedNodeIds.includes(n.id)));
    setEdges((eds) =>
      eds.filter((e) => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target))
    );

    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
  }, [selectedEdgeIds, selectedNodeIds, setEdges, setNodes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (selectedNodeIds.length || selectedEdgeIds.length) {
        e.preventDefault();
        deleteSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelection, selectedEdgeIds.length, selectedNodeIds.length]);

  const updateSelectedNode = (patch: Partial<BpmnNodeData | SwimlaneNodeData>) => {
    const id = selectedNodeIds[0];
    if (!id) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n))
    );
    setTimeout(() => autosaveNow(), 40);
  };

  const updateSelectedMeta = (patch: Partial<NonNullable<BpmnNodeData["meta"]>>) => {
    const id = selectedNodeIds[0];
    if (!id) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const d = n.data as any;
        return { ...n, data: { ...d, meta: { ...(d.meta ?? {}), ...patch } } };
      })
    );
    setTimeout(() => autosaveNow(), 40);
  };

  const fileBaseName = useMemo(
    () => title.replace(/[^\w\-]+/g, "_") || "diagram",
    [title]
  );

  const exportSvg = () => {
    const svg = exportSimpleSvg(
      visibleNodes.filter((n) => !n.hidden),
      visibleEdges.filter((e) => !(e as any).hidden),
      { title }
    );
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, `${fileBaseName}.svg`);
  };

  const exportVisio = () => {
    const svg = exportSimpleSvg(nodes, edges, { title });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, `${fileBaseName}-visio.svg`);
  };

  const exportBpmn = () => {
    const xml = exportBpmnXml(nodes, edges, { title });
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    saveAs(blob, `${fileBaseName}.bpmn`);
  };

  const exportJson = () => {
    const payload = JSON.stringify({ name: title, nodes, edges, meta: { themeId } }, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    saveAs(blob, `${fileBaseName}.json`);
  };

  const exportPptx = useCallback(async () => {
    const { default: JSZip } = await import("jszip");

    const escapeXml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const labels = nodes
      .filter((node) => node.type === "bpmn")
      .map((node) => ({
        label: (node.data as any)?.label ?? node.id,
        x: node.position.x ?? 0,
        y: node.position.y ?? 0,
      }))
      .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
      .map((item, index) => `${index + 1}. ${item.label}`);

    const titleText = escapeXml(title || "Diagram Export");
    const bodyLines = labels.length ? labels : ["No BPMN steps available."];
    const bodyParagraphs = bodyLines
      .map(
        (line) => `
          <a:p>
            <a:r>
              <a:rPr sz="2400" lang="en-US"/>
              <a:t>${escapeXml(line)}</a:t>
            </a:r>
          </a:p>`
      )
      .join("");

    const zip = new JSZip();
    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`
    );

    zip.file(
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
    );

    zip.file(
      "ppt/presentation.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
    );

    zip.file(
      "ppt/_rels/presentation.xml.rels",
      `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`
    );

    zip.file(
      "ppt/slides/slide1.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr sz="3600" lang="en-US"/>
              <a:t>${titleText}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Body"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${bodyParagraphs}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
    );

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${fileBaseName}.pptx`);
  }, [fileBaseName, nodes, title]);

  const saveVersion = useCallback(async () => {
    await autosaveNow(nodesRef.current, edgesRef.current);
    const res = await fetch(`/api/diagrams/${diagram.id}/save-version`, { method: "POST" });
    if (res.redirected) window.location.href = res.url;
  }, [autosaveNow, diagram.id]);

  const openChild = useCallback((childId: string) => {
    window.open(`/tools/diagrams/${childId}`, "_blank", "noopener,noreferrer");
  }, []);

  const createChildForNode = useCallback(
    async (nodeId: string) => {
      if (!nodeId) return;
      if (creatingChildFor) return;
      setCreatingChildFor(nodeId);

      try {
        const res = await fetch(`/api/diagrams/${diagram.id}/subprocess/create-child`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subprocessNodeId: nodeId }),
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(payload?.error ?? `Request failed (${res.status})`);
          return;
        }

        const childDiagramId = payload?.childDiagramId as string | undefined;
        if (!childDiagramId) {
          alert("Child created but server did not return childDiagramId.");
          return;
        }

        const nextNodes = nodesRef.current.map((n) =>
          n.id === nodeId ? { ...n, data: { ...(n.data as any), childDiagramId } } : n
        );

        setNodes(nextNodes);
        setTimeout(() => autosaveNow(nextNodes, edgesRef.current), 60);
        openChild(childDiagramId);
      } catch (e: any) {
        alert(e?.message ?? "Failed to create child (network error)");
      } finally {
        setCreatingChildFor(null);
      }
    },
    [autosaveNow, creatingChildFor, diagram.id, openChild, setNodes]
  );

  // ---- Swimlanes ----
  const upsertSwimlanes = useCallback(
    (orientation: LaneOrientation) => {
      const nonLanes = nodesRef.current.filter((n) => (n.data as any)?.kind !== "swimlane");
      const lanes = makeLaneNodes({ orientation }).map((l) => ({
        ...l,
        data: { ...(l.data as any), theme },
      }));
      const next = [...lanes, ...nonLanes];
      setNodes(next);
      setTimeout(() => autosaveNow(next, edgesRef.current), 80);
    },
    [autosaveNow, setNodes, theme]
  );

  const aiGenerateSwimlanes = useCallback(() => {
    const laneSet = new Set<string>();
    for (const n of nodesRef.current) {
      const d: any = n.data ?? {};
      if (d?.kind === "swimlane") continue;

      const actors = String(d?.meta?.actors ?? "").trim();
      if (!actors) continue;

      actors
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .forEach((a: string) => laneSet.add(a));
    }

    const labels = Array.from(laneSet).slice(0, 12);
    const laneNodes = makeLaneNodes({
      orientation: "horizontal",
      labels: labels.length ? labels : undefined,
    }).map((l) => ({ ...l, data: { ...(l.data as any), theme } }));

    const nonLanes = nodesRef.current.filter((n) => (n.data as any)?.kind !== "swimlane");

    // assign nodes to lanes by first matching actor name
    const laneIdByName = new Map<string, string>();
    for (const ln of laneNodes) laneIdByName.set((ln.data as any).label, ln.id);

    const nextNonLanes = nonLanes.map((n) => {
      const d: any = n.data ?? {};
      const actors = String(d?.meta?.actors ?? "").trim();
      if (!actors) return n;

      const first = actors.split(",").map((s) => s.trim()).find(Boolean);
      if (!first) return n;

      const laneId = laneIdByName.get(first);
      if (!laneId) return n;

      return { ...n, data: { ...d, meta: { ...(d.meta ?? {}), laneId }, laneId } };
    });

    const combined = [...laneNodes, ...nextNonLanes];

    // snap nodes into lanes
    const snapped = combined.map((n) => {
      if ((n.data as any)?.kind === "swimlane") return n;
      const laneId = (n.data as any)?.laneId ?? (n.data as any)?.meta?.laneId;
      if (!laneId) return n;
      const lane = combined.find((x) => x.id === laneId);
      if (!lane) return n;
      const s = snapNodeIntoLane({ dragged: n, lane });
      return { ...n, position: { x: s.x, y: s.y } };
    });

    setNodes(snapped);
    setTimeout(() => autosaveNow(snapped, edgesRef.current), 90);
  }, [autosaveNow, setNodes, theme]);

  const renameLane = useCallback(
    (laneId: string, name: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === laneId ? { ...n, data: { ...(n.data as any), label: name } } : n))
      );
      setTimeout(() => autosaveNow(), 40);
    },
    [autosaveNow, setNodes]
  );

  const setLaneDividers = useCallback(
    (laneId: string, dividers: number) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === laneId ? { ...n, data: { ...(n.data as any), dividers } } : n))
      );
      setTimeout(() => autosaveNow(), 40);
    },
    [autosaveNow, setNodes]
  );

  const toggleLaneLock = useCallback(
    (laneId: string) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== laneId) return n;
          const locked = !(n.data as any)?.locked;
          return { ...n, draggable: !locked, data: { ...(n.data as any), locked } };
        })
      );
      setTimeout(() => autosaveNow(), 40);
    },
    [autosaveNow, setNodes]
  );

  // snap-to-lane placement
  const onNodeDragStop = useCallback(
    (_evt: any, dragged: Node) => {
      if (!dragged?.id) return;
      if ((dragged.data as any)?.kind === "swimlane") return;

      const dRect = nodeRect(dragged);
      const cx = dRect.x + dRect.w / 2;
      const cy = dRect.y + dRect.h / 2;

      const lane = findLaneAtPoint(nodesRef.current, cx, cy);
      if (!lane) return;

      const snapped = snapNodeIntoLane({ dragged, lane });

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== dragged.id) return n;
          const d: any = n.data ?? {};
          return {
            ...n,
            position: { x: snapped.x, y: snapped.y },
            data: { ...d, meta: { ...(d.meta ?? {}), laneId: snapped.laneId }, laneId: snapped.laneId },
          };
        })
      );

      setTimeout(() => autosaveNow(), 60);
    },
    [autosaveNow, setNodes]
  );

  // AI Full Process modal
  const openAiFullProcessModal = useCallback(() => {
    setAiPrompt(
      "Create a pizza order process with handoffs across Service, Prep, Oven, Delivery. Include start, tasks, decisions, and end."
    );
    setAiOpen(true);
  }, []);

  const runAiFullProcess = useCallback(async () => {
    const p = aiPrompt.trim();
    if (!p) return;
    setAiWorking(true);

    try {
      const res = await fetch(`/api/diagrams/${diagram.id}/ai/generate-process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(payload?.error ?? `AI request failed (${res.status})`);
        return;
      }

      const { lanes, nodes: genNodes, edges: genEdges, orientation } = payload ?? {};
      if (!Array.isArray(lanes) || !Array.isArray(genNodes) || !Array.isArray(genEdges)) {
        alert("AI returned an unexpected response.");
        return;
      }

      const laneNodes = makeLaneNodes({
        orientation: orientation === "vertical" ? "vertical" : "horizontal",
        labels: lanes,
      }).map((l) => ({ ...l, data: { ...(l.data as any), theme } }));

      const laneIdByName = new Map<string, string>();
      for (const ln of laneNodes) laneIdByName.set((ln.data as any).label, ln.id);

      const rebuiltNodes: Node[] = [
        ...laneNodes,
        ...genNodes.map((n: any, idx: number) => {
          const id = n.id ?? `ai_${idx}_${uid()}`;
          const laneName = String(n.lane ?? "").trim();
          const laneId = laneIdByName.get(laneName) ?? null;

          return {
            id,
            type: "bpmn",
            position: { x: Number(n.x ?? 220), y: Number(n.y ?? 200) },
            data: {
              kind: n.kind ?? "task",
              label: n.label ?? "Task",
              theme,
              collapsed: false,
              meta: { ...(n.meta ?? {}), laneId, actors: n?.meta?.actors ?? "" },
              laneId,
            },
          };
        }),
      ];

      const rebuiltEdges: Edge[] = genEdges.map((e: any, idx: number) => ({
        id: e.id ?? `ai_e_${idx}_${uid()}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: theme.accent },
      }));

      // snap nodes into lanes
      const snappedNodes = rebuiltNodes.map((n) => {
        if ((n.data as any)?.kind === "swimlane") return n;
        const laneId = (n.data as any)?.laneId ?? (n.data as any)?.meta?.laneId;
        if (!laneId) return n;
        const lane = rebuiltNodes.find((x) => x.id === laneId);
        if (!lane) return n;
        const s = snapNodeIntoLane({ dragged: n, lane });
        return { ...n, position: { x: s.x, y: s.y } };
      });

      setNodes(snappedNodes);
      setEdges(rebuiltEdges);
      setAiOpen(false);
      setTimeout(() => autosaveNow(snappedNodes, rebuiltEdges), 120);
    } catch (e: any) {
      alert(e?.message ?? "AI request failed");
    } finally {
      setAiWorking(false);
    }
  }, [aiPrompt, autosaveNow, diagram.id, setEdges, setNodes, theme, theme.accent]);

  // actions used by node components via context
  const renameNode = useCallback(
    (nodeId: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data as any), label } } : n))
      );
      setTimeout(() => autosaveNow(), 40);
    },
    [autosaveNow, setNodes]
  );

  const toggleCollapsed = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...(n.data as any), collapsed: !(n.data as any)?.collapsed } } : n
        )
      );
      setTimeout(() => autosaveNow(), 40);
    },
    [autosaveNow, setNodes]
  );

  const editorCtxValue = useMemo(
    () => ({
      theme,
      creatingChildFor,
      createChildForNode,
      openChild,
      renameNode,
      toggleCollapsed,
      upsertSwimlanes,
      aiGenerateSwimlanes,
      renameLane,
      setLaneDividers,
      toggleLaneLock,
      openAiFullProcessModal,
    }),
    [
      theme,
      creatingChildFor,
      createChildForNode,
      openChild,
      renameNode,
      toggleCollapsed,
      upsertSwimlanes,
      aiGenerateSwimlanes,
      renameLane,
      setLaneDividers,
      toggleLaneLock,
      openAiFullProcessModal,
    ]
  );

  const canvasStyle: React.CSSProperties = { background: theme.canvasBg };

  const requestAiList = useCallback(async (prompt: string): Promise<string[]> => {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error ?? "AI request failed.");
    }
    const text = (data?.text ?? "").toString();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error("AI response did not include a JSON list.");
    }
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) {
      throw new Error("AI response is not a list.");
    }
    return parsed.map((item) => String(item)).filter(Boolean);
  }, []);

  const generateSwimlanes = useCallback(() => {
    const scenario = window.prompt(
      "Describe the process and the actors/systems involved. Example: Customer order fulfillment."
    );
    if (!scenario) return;
    const orientation =
      window.prompt("Orientation (horizontal or vertical). Leave blank for horizontal.") || "";
    const isVertical = orientation.toLowerCase().startsWith("v");
    requestAiList(
      `Return ONLY a JSON array of swimlane names (actors, systems, or departments) for this process: ${scenario}`
    )
      .then((lanes) => {
        addSwimlane(isVertical ? "vertical" : "horizontal", lanes);
      })
      .catch((err) => {
        alert(err?.message ?? "AI generation failed. You can enter lanes manually.");
        addSwimlane(isVertical ? "vertical" : "horizontal");
      });
  }, [addSwimlane, requestAiList]);

  const generateProcess = useCallback(() => {
    const scenario = window.prompt(
      "Describe the process you want to generate. Example: Purchase approval flow."
    );
    if (!scenario) return;
    requestAiList(
      `Return ONLY a JSON array of BPMN task labels for this process, in order: ${scenario}`
    )
      .then((steps) => {
        if (!steps.length) {
          alert("AI did not return any steps. Try again.");
          return;
        }

    const baseX = 140;
    const baseY = 180;
    const spacingX = 220;
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const startId = `start_${uid()}`;
    flowNodes.push({
      id: startId,
      type: "bpmn",
      position: { x: baseX, y: baseY },
      data: { kind: "start_event", label: "Start", theme, collapsed: false, meta: {} },
    });

    let prevId = startId;
    steps.forEach((step, index) => {
      const id = `task_${uid()}`;
      flowNodes.push({
        id,
        type: "bpmn",
        position: { x: baseX + spacingX * (index + 1), y: baseY },
        data: { kind: "task", label: step, theme, collapsed: false, meta: {} },
      });
      flowEdges.push({
        id: `edge_${uid()}`,
        source: prevId,
        target: id,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: theme.accent },
      });
      prevId = id;
    });

    const endId = `end_${uid()}`;
    flowNodes.push({
      id: endId,
      type: "bpmn",
      position: { x: baseX + spacingX * (steps.length + 1), y: baseY },
      data: { kind: "end_event", label: "End", theme, collapsed: false, meta: {} },
    });
    flowEdges.push({
      id: `edge_${uid()}`,
      source: prevId,
      target: endId,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2, stroke: theme.accent },
    });

    setNodes((nds) => [...nds, ...flowNodes]);
    setEdges((eds) => [...eds, ...flowEdges]);
      })
      .catch((err) => {
        alert(err?.message ?? "AI generation failed. You can enter steps manually.");
        const raw = window.prompt(
          "Enter process steps (one per line). Example:\nRequest\nReview\nApprove\nFulfill"
        );
        if (!raw) return;
        const steps = raw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        if (!steps.length) {
          alert("Please enter at least one step.");
          return;
        }

        const baseX = 140;
        const baseY = 180;
        const spacingX = 220;
        const flowNodes: Node[] = [];
        const flowEdges: Edge[] = [];

        const startId = `start_${uid()}`;
        flowNodes.push({
          id: startId,
          type: "bpmn",
          position: { x: baseX, y: baseY },
          data: { kind: "start_event", label: "Start", theme, collapsed: false, meta: {} },
        });

        let prevId = startId;
        steps.forEach((step, index) => {
          const id = `task_${uid()}`;
          flowNodes.push({
            id,
            type: "bpmn",
            position: { x: baseX + spacingX * (index + 1), y: baseY },
            data: { kind: "task", label: step, theme, collapsed: false, meta: {} },
          });
          flowEdges.push({
            id: `edge_${uid()}`,
            source: prevId,
            target: id,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2, stroke: theme.accent },
          });
          prevId = id;
        });

        const endId = `end_${uid()}`;
        flowNodes.push({
          id: endId,
          type: "bpmn",
          position: { x: baseX + spacingX * (steps.length + 1), y: baseY },
          data: { kind: "end_event", label: "End", theme, collapsed: false, meta: {} },
        });
        flowEdges.push({
          id: `edge_${uid()}`,
          source: prevId,
          target: endId,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: theme.accent },
        });

        setNodes((nds) => [...nds, ...flowNodes]);
        setEdges((eds) => [...eds, ...flowEdges]);
      });
  }, [requestAiList, setNodes, setEdges, theme]);

  useEffect(() => {
    setNodes((nds) => {
      let changed = false;
      const next = nds.map((node) => {
        if (node.type !== "swimlane") return node;
        const data = node.data as SwimlaneNodeData;
        const padding = 80;
        let maxX = data.width;
        let maxY = data.height;
        nds.forEach((candidate) => {
          if (candidate.id === node.id || candidate.type === "swimlane") return;
          const dx = candidate.position.x - node.position.x;
          const dy = candidate.position.y - node.position.y;
          if (dx >= 0 && dy >= 0) {
            const width = (candidate.width as number) ?? 180;
            const height = (candidate.height as number) ?? 120;
            maxX = Math.max(maxX, dx + width + padding);
            maxY = Math.max(maxY, dy + height + padding);
          }
        });
        if (maxX === data.width && maxY === data.height) return node;
        changed = true;
        return {
          ...node,
          data: { ...data, width: maxX, height: maxY },
        };
      });
      return changed ? next : nds;
    });
  }, [nodes, setNodes]);

  return (
    <DiagramEditorProvider value={editorCtxValue}>
      <div className="h-[calc(100vh-72px)] w-full">
        <div className="flex items-center gap-3 border-b bg-white p-3">
          <input
            className="w-full max-w-3xl rounded-2xl border px-4 py-3 text-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => runLayout("free")}
              className={`rounded-xl border px-3 py-2 text-xs ${
                layoutMode === "free" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => runLayout("tree_lr")}
              className={`rounded-xl border px-3 py-2 text-xs ${
                layoutMode === "tree_lr" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              Tree LR
            </button>
            <button
              onClick={() => runLayout("tree_tb")}
              className={`rounded-xl border px-3 py-2 text-xs ${
                layoutMode === "tree_tb" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              Tree TB
            </button>
          </div>

          <button
            onClick={saveVersion}
            className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Save Version
          </button>

          <button
            onClick={deleteSelection}
            disabled={!selectedNodeIds.length && !selectedEdgeIds.length}
            className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            title="Delete selected (Delete/Backspace)"
          >
            Delete
          </button>
        </div>

        <div className="flex h-full">
          <BpmnPalette
            theme={theme}
            setThemeId={setThemeId}
            onAdd={addFromPalette}
            onExportSvg={exportSvg}
            onSwimlaneHorizontal={() => upsertSwimlanes("horizontal")}
            onSwimlaneVertical={() => upsertSwimlanes("vertical")}
            onAiGenerateSwimlanes={aiGenerateSwimlanes}
            onAiGenerateFullProcess={openAiFullProcessModal}
          />

          <div className="flex-1 relative">
            <ReactFlowProvider>
              <ReactFlow
                nodes={visibleNodes}
                edges={visibleEdges}
                nodeTypes={NODE_TYPES}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                onNodeDragStop={onNodeDragStop}
                fitView
                style={canvasStyle}
              >
                <Background gap={22} size={1} color={theme.gridDot} />
                <Controls />
                <MiniMap />
              </ReactFlow>

              <FocusHelper
                focusNodeId={focusNodeId}
                nodes={nodes}
                setSelectedNodeIds={setSelectedNodeIds}
                setSelectedEdgeIds={setSelectedEdgeIds}
                setNodes={setNodes}
              />
            </ReactFlowProvider>

            {/* Properties Panel */}
            <div className="absolute right-3 top-3 w-[320px] rounded-2xl border bg-white p-3 shadow">
              <div className="text-sm font-semibold">Properties</div>

              {!selectedNode ? (
                <div className="mt-2 text-xs text-gray-600">
                  Select a node to edit label and Actors.
                </div>
              ) : (selectedNode.data as any)?.kind === "swimlane" ? (
                <div className="mt-2 text-xs text-gray-600">
                  Right-click lane for rename/dividers/lock.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Label</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      value={(selectedNode.data as any)?.label ?? ""}
                      onChange={(e) => updateSelectedNode({ label: e.target.value } as any)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">Actors / Users</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="e.g., Service, Prep, Oven"
                      value={(selectedNode.data as any)?.meta?.actors ?? ""}
                      onChange={(e) => updateSelectedMeta({ actors: e.target.value })}
                    />
                    <div className="mt-1 text-[11px] text-gray-500">
                      Actors are metadata. Use Swim Lanes buttons or AI to create lanes.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Modal */}
            {aiOpen && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
                  <div className="text-sm font-semibold">AI: Generate Full Process</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Generates swimlanes + nodes + edges from your prompt.
                  </div>

                  <textarea
                    className="mt-3 h-40 w-full rounded-2xl border p-3 text-sm"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      className="rounded-2xl border px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setAiOpen(false)}
                      disabled={aiWorking}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-2xl bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                      onClick={runAiFullProcess}
                      disabled={aiWorking}
                    >
                      {aiWorking ? "Generating…" : "Generate"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DiagramEditorProvider>
  );
}
