"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import type { Node } from "@xyflow/react";

const PRESET_FILLS = ["#ffffff", "#f8fafc", "#eef2ff", "#ecfeff", "#fef9c3", "#dcfce7", "#ffe4e6"];
const PRESET_STROKES = ["#0f172a", "#111827", "#334155", "#2563eb", "#16a34a", "#f97316", "#7c3aed", "#db2777"];

const PANEL_SHELL =
  "w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col";
const PANEL_HEADER = "px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40";
const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30";
const COLOR_FIELD = "w-full h-10 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm";

function isSwimlaneNode(n: Node) {
  return String((n.data as any)?.kind ?? "") === "swimlane" || String((n.type as any) ?? "") === "swimlane";
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function PropertiesPanel({
  selectedNode,
  onChangeLabel,
  onChangeFill,
  onChangeStroke,

  onRenameLane,
  onRenameSwimlaneHeader,
  onResizeSwimlane,
  onResizeFlowNode,
}: {
  selectedNode: Node | null;
  onChangeLabel: (id: string, next: string) => void;
  onChangeFill: (id: string, next: string) => void;
  onChangeStroke: (id: string, next: string) => void;

  onRenameLane?: (laneNodeId: string, laneIndex: number, next: string) => void;
  onRenameSwimlaneHeader?: (laneNodeId: string, next: string) => void;
  onResizeSwimlane?: (laneNodeId: string, width: number, height: number) => void;

  onResizeFlowNode?: (nodeId: string, width: number, height: number) => void;
}) {
  const isLane = selectedNode ? isSwimlaneNode(selectedNode) : false;

  const label = String((selectedNode?.data as any)?.label ?? "");
  const kind = String((selectedNode?.data as any)?.kind ?? "");
  const fill = String((selectedNode?.data as any)?.meta?.color ?? "#ffffff");
  const stroke = String((selectedNode?.data as any)?.meta?.border ?? "#0f172a");

  const laneInfo = useMemo(() => {
    if (!selectedNode) return null;
    const laneIndex = (selectedNode.data as any)?.laneIndex;
    const parentId = (selectedNode as any)?.parentId ?? (selectedNode as any)?.parentNode;
    if (laneIndex === undefined && !parentId) return null;
    return { laneIndex, parentId };
  }, [selectedNode]);

  const lanes = useMemo(() => {
    const arr = (selectedNode?.data as any)?.lanes;
    return Array.isArray(arr) ? (arr as string[]) : [];
  }, [selectedNode]);

  const swimW = Number((selectedNode?.data as any)?.width ?? 1100);
  const swimH = Number((selectedNode?.data as any)?.height ?? 620);

  const nodeSize = useMemo(() => {
    const s = (selectedNode?.data as any)?.size;
    return { w: Number(s?.w ?? 170), h: Number(s?.h ?? 70) };
  }, [selectedNode]);

  const [wDraft, setWDraft] = useState(String(swimW));
  const [hDraft, setHDraft] = useState(String(swimH));
  useEffect(() => {
    setWDraft(String(swimW));
    setHDraft(String(swimH));
  }, [swimW, swimH, selectedNode?.id]);

  const [nw, setNw] = useState(String(nodeSize.w));
  const [nh, setNh] = useState(String(nodeSize.h));
  useEffect(() => {
    setNw(String(nodeSize.w));
    setNh(String(nodeSize.h));
  }, [nodeSize.w, nodeSize.h, selectedNode?.id]);

  const commitSwimResize = useCallback(() => {
    if (!selectedNode || !onResizeSwimlane) return;
    const w = clamp(Number(wDraft), 520, 8000);
    const h = clamp(Number(hDraft), 360, 8000);
    setWDraft(String(w));
    setHDraft(String(h));
    onResizeSwimlane(selectedNode.id, w, h);
  }, [hDraft, onResizeSwimlane, selectedNode, wDraft]);

  const commitNodeResize = useCallback(() => {
    if (!selectedNode || !onResizeFlowNode) return;
    if (isLane) return;
    const w = clamp(Number(nw), 90, 800);
    const h = clamp(Number(nh), 50, 800);
    setNw(String(w));
    setNh(String(h));
    onResizeFlowNode(selectedNode.id, w, h);
  }, [isLane, nh, nw, onResizeFlowNode, selectedNode]);

  if (!selectedNode) {
    return (
      <div className={PANEL_SHELL}>
        <div className={PANEL_HEADER}>
          <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">No selection</div>
          <div className="mt-1 text-xs text-gray-500">Click a node or swimlane</div>
        </div>
        <div className="p-4 text-xs text-gray-500 leading-relaxed">
          Select a flow node to edit label/colors/size. Select swimlane to rename lanes and resize the container.
        </div>
      </div>
    );
  }

  return (
    <div className={PANEL_SHELL}>
      <div className={PANEL_HEADER}>
        <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">{isLane ? "Swimlane Container" : "Flow Node"}</div>
        <div className="mt-1 text-xs text-gray-500 truncate">{selectedNode.id}</div>
      </div>

      <div className="p-4 space-y-5 overflow-auto">
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Type</div>
          <div className="rounded-xl border bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800">{kind || (isLane ? "swimlane" : "(unknown)")}</div>
        </div>

        {!isLane && laneInfo ? (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Lane Placement</div>
            <div className="rounded-xl border bg-gray-50 px-3 py-2 text-xs text-gray-700 space-y-1">
              {laneInfo.parentId ? <div>parentId: {String(laneInfo.parentId)}</div> : null}
              {laneInfo.laneIndex !== undefined ? <div>laneIndex: {String(laneInfo.laneIndex)}</div> : null}
            </div>
          </div>
        ) : null}

        {/* Label */}
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">{isLane ? "Swimlane Title" : "Label"}</div>
          <input
            value={label}
            onChange={(e) => {
              const next = e.target.value;
              if (isLane && onRenameSwimlaneHeader) onRenameSwimlaneHeader(selectedNode.id, next);
              else onChangeLabel(selectedNode.id, next);
            }}
            className={FIELD}
          />
          {!isLane ? (
            <div className="mt-1 text-[11px] text-gray-500">Also supports double-click inline editing on the node.</div>
          ) : null}
        </div>

        {/* Flow Size */}
        {!isLane ? (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Size</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 mb-1">Width</div>
                <input
                  value={nw}
                  onChange={(e) => setNw(e.target.value)}
                  onBlur={commitNodeResize}
                  onKeyDown={(e) => e.key === "Enter" && commitNodeResize()}
                  className={FIELD}
                  inputMode="numeric"
                />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-500 mb-1">Height</div>
                <input
                  value={nh}
                  onChange={(e) => setNh(e.target.value)}
                  onBlur={commitNodeResize}
                  onKeyDown={(e) => e.key === "Enter" && commitNodeResize()}
                  className={FIELD}
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="mt-1 text-[11px] text-gray-500">Tip: You can also resize directly using the resize handles on the node.</div>
          </div>
        ) : null}

        {/* Fill + Border */}
        {!isLane ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Fill</div>
                <input type="color" value={fill} onChange={(e) => onChangeFill(selectedNode.id, e.target.value)} className={COLOR_FIELD} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Border</div>
                <input type="color" value={stroke} onChange={(e) => onChangeStroke(selectedNode.id, e.target.value)} className={COLOR_FIELD} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-600">Quick Presets</div>

              <div className="flex flex-wrap gap-2">
                {PRESET_FILLS.map((c) => (
                  <button key={c} type="button" className="h-7 w-7 rounded-lg border" style={{ background: c }} title={`Fill ${c}`} onClick={() => onChangeFill(selectedNode.id, c)} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_STROKES.map((c) => (
                  <button key={c} type="button" className="h-7 w-7 rounded-lg border" style={{ background: c }} title={`Border ${c}`} onClick={() => onChangeStroke(selectedNode.id, c)} />
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* Swimlane resize */}
        {isLane ? (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Swimlane Size</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 mb-1">Width</div>
                <input value={wDraft} onChange={(e) => setWDraft(e.target.value)} onBlur={commitSwimResize} onKeyDown={(e) => e.key === "Enter" && commitSwimResize()} className={FIELD} inputMode="numeric" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-500 mb-1">Height</div>
                <input value={hDraft} onChange={(e) => setHDraft(e.target.value)} onBlur={commitSwimResize} onKeyDown={(e) => e.key === "Enter" && commitSwimResize()} className={FIELD} inputMode="numeric" />
              </div>
            </div>
            <div className="mt-1 text-[11px] text-gray-500">Also supports bottom-right resize handle on the swimlane container.</div>
          </div>
        ) : null}

        {/* Swimlane lane rename list */}
        {isLane ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600">Lane Names</div>
            {lanes.length ? (
              <div className="space-y-2">
                {lanes.map((ln, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="text-[11px] font-semibold text-gray-500 w-12">Lane {idx + 1}</div>
                    <input
                      value={String(ln ?? "")}
                      onChange={(e) => onRenameLane?.(selectedNode.id, idx, e.target.value)}
                      className={FIELD}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No lanes found.</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
