"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
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
import { validateConnection, type BpmnNodeData } from "@/lib/diagrams/bpmnRules";
import { exportSimpleSvg } from "@/lib/diagrams/exportSvg";
import { exportBpmnXml } from "@/lib/diagrams/exportBpmnXml";
import SwimlaneNode, { type SwimlaneNodeData } from "@/components/diagrams/nodes/SwimlaneNode";

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
  meta?: { themeId?: string };
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

export default function DiagramEditorClient({ diagram }: { diagram: any }) {
  const [title, setTitle] = useState<string>(diagram?.name ?? "Untitled Diagram");

  const [themeId, setThemeId] = useState<string>(
    diagram?.current_snapshot?.meta?.themeId ?? "paper"
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
          data: {
            kind: "start_event",
            label: "Start",
            theme,
            collapsed: false,
            meta: {},
          } satisfies BpmnNodeData & { theme: DiagramTheme },
        },
        {
          id: "end",
          type: "bpmn",
          position: { x: 560, y: 260 },
          data: {
            kind: "end_event",
            label: "End",
            theme,
            collapsed: false,
            meta: {},
          } satisfies BpmnNodeData & { theme: DiagramTheme },
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
      meta: { themeId },
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

  // ✅ focus from URL (?focus=NODE_ID)
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  useEffect(() => {
    setFocusNodeId(getFocusParam());
  }, []);

  // ✅ create child spinner state
  const [creatingChildFor, setCreatingChildFor] = useState<string | null>(null);

  // Apply theme to all nodes/edges when theme changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...(n.data ?? {}), theme },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...(e.style ?? {}), strokeWidth: 2, stroke: theme.accent },
        markerEnd: { type: MarkerType.ArrowClosed },
      }))
    );
  }, [theme, setNodes, setEdges]);

  const onSelectionChange = useCallback((sel: { nodes?: any[]; edges?: any[] }) => {
    const nextNodeIds = (sel.nodes ?? []).map((n) => n.id).sort();
    const nextEdgeIds = (sel.edges ?? []).map((e) => e.id).sort();
    setSelectedNodeIds((prev) => (sameIds(prev, nextNodeIds) ? prev : nextNodeIds));
    setSelectedEdgeIds((prev) => (sameIds(prev, nextEdgeIds) ? prev : nextEdgeIds));
  }, []);

  const collapseAll = () => {
    setNodes((nds) =>
      nds.map((n) => {
        const d = n.data as any;
        if (d?.kind === "subprocess") return { ...n, data: { ...d, collapsed: true } };
        return n;
      })
    );
  };

  const expandAll = () => {
    setNodes((nds) =>
      nds.map((n) => {
        const d = n.data as any;
        if (d?.kind === "subprocess") return { ...n, data: { ...d, collapsed: false } };
        return n;
      })
    );
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      const src = nodes.find((n) => n.id === connection.source);
      const tgt = nodes.find((n) => n.id === connection.target);
      if (!src || !tgt) return;

      const sourceKind = (src.data as any)?.kind as string | undefined;
      const targetKind = (tgt.data as any)?.kind as string | undefined;

      const sourceOutgoingCount = edges.filter((e) => e.source === src.id).length;
      const targetIncomingCount = edges.filter((e) => e.target === tgt.id).length;

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
    [nodes, edges, setEdges, theme.accent]
  );

  const addSwimlane = useCallback(
    (orientation: "horizontal" | "vertical") => {
      const labelsRaw = window.prompt(
        "Enter swim lane names (comma-separated). Example: Sales, Finance, Ops"
      );
      if (!labelsRaw) return;
      const lanes = labelsRaw
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean);
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
            meta: {},
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
      eds.filter(
        (e) => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)
      )
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
  };

  const exportSvg = () => {
    const svg = exportSimpleSvg(nodes, edges, { title });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w\-]+/g, "_") || "diagram"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBpmn = () => {
    const xml = exportBpmnXml(nodes, edges, { title });
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w\-]+/g, "_") || "diagram"}.bpmn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const payload = JSON.stringify({ name: title, nodes, edges, meta: { themeId } }, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w\-]+/g, "_") || "diagram"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveVersion = useCallback(async () => {
    const snap: Snap = { nodes, edges, meta: { themeId } };
    await fetch(`/api/diagrams/${diagram.id}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: title, snapshot: snap }),
    });

    const res = await fetch(`/api/diagrams/${diagram.id}/save-version`, { method: "POST" });
    if (res.redirected) window.location.href = res.url;
  }, [nodes, edges, themeId, diagram.id, title]);

  useEffect(() => {
    const t = setInterval(() => {
      const snap: Snap = { nodes, edges, meta: { themeId } };
      fetch(`/api/diagrams/${diagram.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title, snapshot: snap }),
      }).catch(() => {});
    }, 6000);
    return () => clearInterval(t);
  }, [nodes, edges, themeId, title, diagram.id]);

  const autosaveNow = useCallback(
    async (overrideNodes?: Node[], overrideEdges?: Edge[]) => {
      const snap: Snap = {
        nodes: (overrideNodes ?? nodes) as any,
        edges: (overrideEdges ?? edges) as any,
        meta: { themeId },
      };
      await fetch(`/api/diagrams/${diagram.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title, snapshot: snap }),
      }).catch(() => {});
    },
    [diagram.id, edges, nodes, themeId, title]
  );

  const openChildAfterCreate: "new-tab" | "same-tab" = "same-tab";

  const openChild = useCallback(
    (childId: string) => {
      const url = `/tools/diagrams/${childId}`;
      if (openChildAfterCreate === "new-tab") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    },
    [openChildAfterCreate]
  );

  // ✅ The real fix: this function is what the node button calls
  const createChildForNode = useCallback(
    async (nodeId: string) => {
      if (!nodeId) return;

      // prevent double clicks
      setCreatingChildFor(nodeId);

      try {
        const res = await fetch(`/api/diagrams/${diagram.id}/subprocess/create-child`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subprocessNodeId: nodeId }),
        });

        // robust parse (sometimes server returns HTML on 404)
        const contentType = res.headers.get("content-type") || "";
        const payload: any =
          contentType.includes("application/json")
            ? await res.json().catch(() => ({}))
            : await res.text().catch(() => "");

        if (!res.ok) {
          const msg =
            typeof payload === "string"
              ? `Request failed (${res.status}). Route may be missing.`
              : payload?.error ?? `Request failed (${res.status})`;
          alert(msg);
          return;
        }

        const childDiagramId = payload?.childDiagramId as string | undefined;
        if (!childDiagramId) {
          alert("Child created but server did not return childDiagramId.");
          return;
        }

        // patch node in local state
        const nextNodes = nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...(n.data as any), childDiagramId } } : n
        );
        setNodes(nextNodes);

        // persist quickly
        setTimeout(() => {
          autosaveNow(nextNodes, edges);
        }, 50);

        // open child
        openChild(childDiagramId);
      } catch (e: any) {
        alert(e?.message ?? "Failed to create child (network error)");
      } finally {
        setCreatingChildFor(null);
      }
    },
    [diagram.id, nodes, edges, autosaveNow, openChild, setNodes]
  );

  // ✅ Node renderer callbacks must be wired here
  const nodeTypes = useMemo(
    () => ({
      bpmn: (rfProps: any) => (
        <EditableBpmnNode
          {...rfProps}
          creatingChildFor={creatingChildFor}
          onRename={(nodeId: string, label: string) => {
            setNodes((nds) =>
              nds.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data as any), label } } : n))
            );
          }}
          onToggleCollapsed={(nodeId: string) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId
                  ? { ...n, data: { ...(n.data as any), collapsed: !(n.data as any)?.collapsed } }
                  : n
              )
            );
          }}
          onCreateChild={(nodeId: string) => {
            createChildForNode(nodeId);
          }}
          onOpenChild={(childId: string) => {
            openChild(childId);
          }}
        />
      ),
      swimlane: (rfProps: any) => <SwimlaneNode {...rfProps} />,
    }),
    [creatingChildFor, createChildForNode, openChild, setNodes]
  );

  const canvasStyle: React.CSSProperties = { background: theme.canvasBg };

  const generateSwimlanes = useCallback(() => {
    const orientation = window.prompt(
      "Swim lane orientation (horizontal or vertical). Leave blank for horizontal."
    );
    if (orientation && orientation.toLowerCase().startsWith("v")) {
      addSwimlane("vertical");
      return;
    }
    addSwimlane("horizontal");
  }, [addSwimlane]);

  const generateProcess = useCallback(() => {
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
  }, [setNodes, setEdges, theme]);

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
    <div className="h-[calc(100vh-72px)] w-full">
      <div className="flex items-center gap-3 border-b bg-white p-3">
        <input
          className="w-full max-w-3xl rounded-2xl border px-4 py-3 text-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

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
          onCollapseAll={collapseAll}
          onExpandAll={expandAll}
          onExportSvg={exportSvg}
          onExportBpmn={exportBpmn}
          onExportJson={exportJson}
          onGenerateSwimlanes={generateSwimlanes}
          onGenerateProcess={generateProcess}
        />

        <div className="flex-1 relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
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

          {/* Properties Panel (kept as-is) */}
          <div className="absolute right-3 top-3 w-[320px] rounded-2xl border bg-white p-3 shadow">
            <div className="text-sm font-semibold">Properties</div>

            {!selectedNode ? (
              <div className="mt-2 text-xs text-gray-600">
                Select a node to edit labels, actors, apps, risks, and timings.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {selectedNode.type === "swimlane" ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Title</label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        value={(selectedNode.data as any)?.label ?? ""}
                        onChange={(e) => updateSelectedNode({ label: e.target.value } as any)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Lane Names</label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="e.g., Sales, Finance, Operations"
                        value={((selectedNode.data as any)?.lanes ?? []).join(", ")}
                        onChange={(e) =>
                          updateSelectedNode({
                            lanes: e.target.value
                              .split(",")
                              .map((lane) => lane.trim())
                              .filter(Boolean),
                          } as any)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Width</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                          value={(selectedNode.data as any)?.width ?? 0}
                          onChange={(e) =>
                            updateSelectedNode({
                              width: Math.max(200, Number(e.target.value || 0)),
                            } as any)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Height</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                          value={(selectedNode.data as any)?.height ?? 0}
                          onChange={(e) =>
                            updateSelectedNode({
                              height: Math.max(200, Number(e.target.value || 0)),
                            } as any)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Orientation</label>
                      <select
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        value={(selectedNode.data as any)?.orientation ?? "horizontal"}
                        onChange={(e) =>
                          updateSelectedNode({
                            orientation: e.target.value as "horizontal" | "vertical",
                          } as any)
                        }
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Label</label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        value={(selectedNode.data as any)?.label ?? ""}
                        onChange={(e) => updateSelectedNode({ label: e.target.value } as any)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">AHT (min)</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                          value={(selectedNode.data as any)?.meta?.avgHandlingTimeMin ?? ""}
                          onChange={(e) =>
                            updateSelectedMeta({
                              avgHandlingTimeMin: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Cycle (min)</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                          value={(selectedNode.data as any)?.meta?.avgCycleTimeMin ?? ""}
                          onChange={(e) =>
                            updateSelectedMeta({
                              avgCycleTimeMin: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Actors / Users</label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="e.g., Customer, Manufacturer"
                        value={(selectedNode.data as any)?.meta?.actors ?? ""}
                        onChange={(e) => updateSelectedMeta({ actors: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Applications</label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="e.g., SAP, ServiceNow"
                        value={(selectedNode.data as any)?.meta?.applications ?? ""}
                        onChange={(e) => updateSelectedMeta({ applications: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Business Capability</label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="e.g., Order Management"
                        value={(selectedNode.data as any)?.meta?.businessCapability ?? ""}
                        onChange={(e) => updateSelectedMeta({ businessCapability: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Risks & Controls</label>
                      <textarea
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        rows={3}
                        placeholder="e.g., Risk: fraud; Control: 2-step approval"
                        value={(selectedNode.data as any)?.meta?.risksAndControls ?? ""}
                        onChange={(e) => updateSelectedMeta({ risksAndControls: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
