"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { Node } from "@xyflow/react";

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function isArch(n: Node) {
  return String((n.data as any)?.kind ?? "") === "architecture" || String(n.type ?? "") === "architecture";
}

function isBoundary(n: Node) {
  return String((n.data as any)?.kind ?? "") === "architecture_boundary" || String(n.type ?? "") === "architecture_boundary";
}

export default function ArchitecturePropertiesPanel({
  selectedNode,
  onUpdate,
  onResize,
}: {
  selectedNode: Node | null;
  onUpdate: (id: string, patch: any) => void;
  onResize: (id: string, w: number, h: number) => void;
}) {
  const arch = selectedNode && isArch(selectedNode);
  const boundary = selectedNode && isBoundary(selectedNode);

  const label = String((selectedNode?.data as any)?.label ?? "");
  const subtitle = String((selectedNode?.data as any)?.subtitle ?? "");
  const layer = String((selectedNode?.data as any)?.layer ?? "compute_logic");
  const nodeKind = String((selectedNode?.data as any)?.nodeKind ?? "service");
  const archProvider = String((selectedNode?.data as any)?.archProvider ?? "generic");

  const fill = String((selectedNode?.data as any)?.meta?.fill ?? "#f8fafc");
  const border = String((selectedNode?.data as any)?.meta?.border ?? "#0f172a");
  const iconKey = String((selectedNode?.data as any)?.meta?.iconKey ?? "");

  const size = useMemo(() => {
    const s = (selectedNode?.data as any)?.size;
    const w = Number(s?.w ?? (boundary ? 1100 : 240));
    const h = Number(s?.h ?? (boundary ? 560 : 110));
    return { w, h };
  }, [boundary, selectedNode]);

  const [wDraft, setWDraft] = useState(String(size.w));
  const [hDraft, setHDraft] = useState(String(size.h));
  useEffect(() => {
    setWDraft(String(size.w));
    setHDraft(String(size.h));
  }, [size.h, size.w, selectedNode?.id]);

  const commitResize = useCallback(() => {
    if (!selectedNode) return;
    const w = clamp(Number(wDraft), boundary ? 340 : 180, boundary ? 4000 : 520);
    const h = clamp(Number(hDraft), boundary ? 220 : 90, boundary ? 2600 : 340);
    setWDraft(String(w));
    setHDraft(String(h));
    onResize(selectedNode.id, w, h);
  }, [boundary, hDraft, onResize, selectedNode, wDraft]);

  if (!selectedNode) {
    return (
      <div className="w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
          <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">No selection</div>
          <div className="mt-1 text-xs text-gray-500">Click a component or boundary</div>
        </div>
        <div className="p-4 text-xs text-gray-500 leading-relaxed">
          Select a node to edit labels, layer/type, and styling.
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">
          {arch ? "Architecture Node" : boundary ? "Boundary" : "Node"}
        </div>
        <div className="mt-1 text-xs text-gray-500 truncate">{selectedNode.id}</div>
      </div>

      <div className="p-4 space-y-5 overflow-auto">
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Label</div>
          <input value={label} onChange={(e) => onUpdate(selectedNode.id, { label: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
        </div>

        {arch ? (
          <>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Subtitle (optional)</div>
              <input value={subtitle} onChange={(e) => onUpdate(selectedNode.id, { subtitle: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Layer</div>
                <select
                  value={layer}
                  onChange={(e) => onUpdate(selectedNode.id, { layer: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                >
                  <option value="client_edge">Client/Edge</option>
                  <option value="security_routing">Security/Routing</option>
                  <option value="compute_logic">Compute/Logic</option>
                  <option value="async_messaging">Async/Messaging</option>
                  <option value="persistence">Persistence</option>
                  <option value="observability">Observability</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Type</div>
                <input value={nodeKind} readOnly className="w-full rounded-xl border px-3 py-2 text-sm bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Fill</div>
                <input
                  type="color"
                  value={fill}
                  onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), fill: e.target.value } })}
                  className="w-full h-10 rounded-xl border p-1"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Border</div>
                <input
                  type="color"
                  value={border}
                  onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), border: e.target.value } })}
                  className="w-full h-10 rounded-xl border p-1"
                />
              </div>
            </div>

            {archProvider !== "generic" ? (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Icon Key (optional)</div>
                <input
                  value={iconKey}
                  onChange={(e) =>
                    onUpdate(selectedNode.id, {
                      meta: { ...((selectedNode.data as any)?.meta ?? {}), iconKey: e.target.value },
                    })
                  }
                  placeholder={`Defaults to "${nodeKind}"`}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
                <div className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                  Used with icon packs (e.g. `/public/icon-packs/aws/manifest.json`) to pick an exact icon without guessing.
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {boundary ? (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Border</div>
            <input
              type="color"
              value={border}
              onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), border: e.target.value } })}
              className="w-full h-10 rounded-xl border p-1"
            />
          </div>
        ) : null}

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">Size</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Width</div>
              <input
                value={wDraft}
                onChange={(e) => setWDraft(e.target.value)}
                onBlur={commitResize}
                onKeyDown={(e) => e.key === "Enter" && commitResize()}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Height</div>
              <input
                value={hDraft}
                onChange={(e) => setHDraft(e.target.value)}
                onBlur={commitResize}
                onKeyDown={(e) => e.key === "Enter" && commitResize()}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
