"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { Node } from "@xyflow/react";
import {
  DATA_LAYER_COLORS,
  isDataArchContainer,
  type DataArchitectureLayer,
  type DataArchitectureNodeData,
  type DataFrequency,
  type SecurityLevel,
} from "@/lib/diagrams/dataArchitecture";
import { useDataArchitectureStore } from "@/lib/diagrams/dataArchitectureStore";

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

const PANEL_SHELL =
  "w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col";
const PANEL_HEADER = "px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40";
const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30";
const SELECT =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-indigo-500/30";
const COLOR_FIELD = "w-full h-10 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm";

function asLayer(v: unknown): DataArchitectureLayer {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "source") return "source";
  if (s === "ingestion") return "ingestion";
  if (s === "processing") return "processing";
  if (s === "storage") return "storage";
  if (s === "analytics") return "analytics";
  if (s === "governance") return "governance";
  if (s === "security") return "security";
  return "processing";
}

export default function DataArchitecturePropertiesPanel({
  selectedNode,
  onUpdate,
  onResize,
}: {
  selectedNode: Node | null;
  onUpdate: (id: string, patch: Partial<DataArchitectureNodeData>) => void;
  onResize: (id: string, w: number, h: number) => void;
}) {
  const provider = useDataArchitectureStore((s) => s.provider);
  const isContainer = Boolean(selectedNode && isDataArchContainer(selectedNode));

  const label = String((selectedNode?.data as any)?.label ?? "");
  const subtitle = String((selectedNode?.data as any)?.subtitle ?? "");
  const layer = asLayer((selectedNode?.data as any)?.layer);
  const frequency = String((selectedNode?.data as any)?.meta?.frequency ?? "") as DataFrequency | "";
  const security = String((selectedNode?.data as any)?.meta?.security ?? "") as SecurityLevel | "";
  const owner = String((selectedNode?.data as any)?.meta?.owner ?? "");

  const fill = String((selectedNode?.data as any)?.meta?.color ?? DATA_LAYER_COLORS[layer].fill);
  const border = String((selectedNode?.data as any)?.meta?.border ?? DATA_LAYER_COLORS[layer].border);
  const iconSrc = String((selectedNode?.data as any)?.meta?.iconSrc ?? "");

  const size = useMemo(() => {
    const s = (selectedNode?.data as any)?.size;
    const w = Number(s?.w ?? (isContainer ? 980 : 220));
    const h = Number(s?.h ?? (isContainer ? 520 : 96));
    return { w, h };
  }, [isContainer, selectedNode]);

  const [wDraft, setWDraft] = useState(String(size.w));
  const [hDraft, setHDraft] = useState(String(size.h));
  useEffect(() => {
    setWDraft(String(size.w));
    setHDraft(String(size.h));
  }, [size.h, size.w, selectedNode?.id]);

  const commitResize = useCallback(() => {
    if (!selectedNode) return;
    const w = clamp(Number(wDraft), isContainer ? 340 : 160, isContainer ? 5200 : 720);
    const h = clamp(Number(hDraft), isContainer ? 220 : 72, isContainer ? 4200 : 520);
    setWDraft(String(w));
    setHDraft(String(h));
    onResize(selectedNode.id, w, h);
  }, [hDraft, isContainer, onResize, selectedNode, wDraft]);

  if (!selectedNode) {
    return (
      <div className={PANEL_SHELL}>
        <div className={PANEL_HEADER}>
          <div className="text-xs font-semibold text-slate-500 uppercase">Properties</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">No selection</div>
          <div className="mt-1 text-xs text-slate-600">Click a node or container</div>
        </div>
        <div className="p-4 text-xs text-slate-600 leading-relaxed">
          Select a data object to edit metadata (layer, frequency, security). Select a container to rename and resize the boundary.
        </div>
      </div>
    );
  }

  return (
    <div className={PANEL_SHELL}>
      <div className={PANEL_HEADER}>
        <div className="text-xs font-semibold text-slate-500 uppercase">Properties</div>
        <div className="mt-1 text-sm font-semibold text-slate-900">{isContainer ? "Container" : "Data Object"}</div>
        <div className="mt-1 text-xs text-slate-500 truncate">{selectedNode.id}</div>
      </div>

      <div className="p-4 space-y-5 overflow-auto">
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-1">Label</div>
          <input value={label} onChange={(e) => onUpdate(selectedNode.id, { label: e.target.value } as any)} className={FIELD} />
        </div>

        {!isContainer ? (
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-1">Subtitle</div>
            <input value={subtitle} onChange={(e) => onUpdate(selectedNode.id, { subtitle: e.target.value } as any)} className={FIELD} />
          </div>
        ) : null}

        {!isContainer ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Layer</div>
              <select
                value={layer}
                onChange={(e) => {
                  const next = asLayer(e.target.value);
                  const c = DATA_LAYER_COLORS[next];
                  onUpdate(selectedNode.id, { layer: next, meta: { ...((selectedNode.data as any)?.meta ?? {}), color: c.fill, border: c.border } } as any);
                }}
                className={SELECT}
              >
                <option value="source">Source</option>
                <option value="ingestion">Ingestion</option>
                <option value="processing">Processing</option>
                <option value="storage">Storage</option>
                <option value="analytics">Analytics</option>
                <option value="governance">Governance</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Style</div>
              <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700">
                {provider.toUpperCase()}
              </div>
            </div>
          </div>
        ) : null}

        {!isContainer ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Frequency</div>
              <select
                value={frequency}
                onChange={(e) =>
                  onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), frequency: e.target.value || undefined } } as any)
                }
                className={SELECT}
              >
                <option value="">(none)</option>
                <option value="batch">Batch</option>
                <option value="stream">Stream</option>
                <option value="near_real_time">Near real-time</option>
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Security</div>
              <select
                value={security}
                onChange={(e) =>
                  onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), security: e.target.value || undefined } } as any)
                }
                className={SELECT}
              >
                <option value="">(none)</option>
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>
        ) : null}

        {!isContainer ? (
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-1">Owner</div>
            <input
              value={owner}
              onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), owner: e.target.value } } as any)}
              className={FIELD}
              placeholder="e.g., Data Platform"
            />
          </div>
        ) : null}

        {!isContainer ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Fill</div>
              <input type="color" value={fill} onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), color: e.target.value } } as any)} className={COLOR_FIELD} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Border</div>
              <input type="color" value={border} onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), border: e.target.value } } as any)} className={COLOR_FIELD} />
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-1">Border</div>
            <input type="color" value={border} onChange={(e) => onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), border: e.target.value } } as any)} className={COLOR_FIELD} />
          </div>
        )}

        {!isContainer ? (
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-1">Icon (optional)</div>
            <input
              value={iconSrc}
              onChange={(e) =>
                onUpdate(selectedNode.id, { meta: { ...((selectedNode.data as any)?.meta ?? {}), iconSrc: e.target.value } } as any)
              }
              className={FIELD}
              placeholder='e.g., /icon-packs/aws/icons/s3.svg'
            />
            <div className="mt-1 text-[11px] text-slate-500">
              Provide a same-origin path under <code className="rounded bg-slate-100 px-1.5 py-0.5">/icon-packs/</code>.
            </div>
          </div>
        ) : null}

        <div>
          <div className="text-xs font-semibold text-slate-600 mb-2">Size</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-1">Width</div>
              <input value={wDraft} onChange={(e) => setWDraft(e.target.value)} onBlur={commitResize} onKeyDown={(e) => e.key === "Enter" && commitResize()} className={FIELD} inputMode="numeric" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-1">Height</div>
              <input value={hDraft} onChange={(e) => setHDraft(e.target.value)} onBlur={commitResize} onKeyDown={(e) => e.key === "Enter" && commitResize()} className={FIELD} inputMode="numeric" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

