"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { Node } from "@xyflow/react";

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function isOrgPerson(n: Node) {
  return String((n.data as any)?.kind ?? "") === "org_person" || String(n.type ?? "") === "org_person";
}

function isOrgGroup(n: Node) {
  return String((n.data as any)?.kind ?? "") === "org_group" || String(n.type ?? "") === "org_group";
}

export default function OrgPropertiesPanel({
  selectedNode,
  allNodes,
  onUpdate,
  onResize,
}: {
  selectedNode: Node | null;
  allNodes: Node[];
  onUpdate: (id: string, patch: any) => void;
  onResize: (id: string, w: number, h: number) => void;
}) {
  const isPerson = selectedNode ? isOrgPerson(selectedNode) : false;
  const isGroup = selectedNode ? isOrgGroup(selectedNode) : false;

  const deptColor = String((selectedNode?.data as any)?.deptColor ?? "#0f172a");
  const department = String((selectedNode?.data as any)?.department ?? "");
  const name = String((selectedNode?.data as any)?.name ?? "");
  const title = String((selectedNode?.data as any)?.title ?? "");
  const avatarUrl = String((selectedNode?.data as any)?.avatarUrl ?? "");
  const employmentType = String((selectedNode?.data as any)?.employmentType ?? "full_time");
  const division = String((selectedNode?.data as any)?.division ?? "");
  const group = String((selectedNode?.data as any)?.group ?? "");

  const parentNodeId = String((selectedNode?.data as any)?.parentNodeId ?? "");

  const nodeSize = useMemo(() => {
    const s = (selectedNode?.data as any)?.size;
    const w = Number(s?.w ?? (isGroup ? 360 : 260));
    const h = Number(s?.h ?? (isGroup ? 44 : 120));
    return { w, h };
  }, [isGroup, selectedNode]);

  const [wDraft, setWDraft] = useState(String(nodeSize.w));
  const [hDraft, setHDraft] = useState(String(nodeSize.h));
  useEffect(() => {
    setWDraft(String(nodeSize.w));
    setHDraft(String(nodeSize.h));
  }, [nodeSize.h, nodeSize.w, selectedNode?.id]);

  const commitResize = useCallback(() => {
    if (!selectedNode) return;
    const w = clamp(Number(wDraft), isGroup ? 220 : 220, isGroup ? 900 : 520);
    const h = clamp(Number(hDraft), isGroup ? 36 : 110, isGroup ? 120 : 320);
    setWDraft(String(w));
    setHDraft(String(h));
    onResize(selectedNode.id, w, h);
  }, [hDraft, isGroup, onResize, selectedNode, wDraft]);

  const managerOptions = useMemo(() => {
    const people = (allNodes ?? []).filter((n) => isOrgPerson(n));
    return people.map((n) => {
      const nm = String((n.data as any)?.name ?? n.id);
      const dept = String((n.data as any)?.department ?? "");
      return { id: n.id, label: dept ? `${nm} — ${dept}` : nm };
    });
  }, [allNodes]);

  if (!selectedNode) {
    return (
      <div className="w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
          <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">No selection</div>
          <div className="mt-1 text-xs text-gray-500">Click a person card or group label</div>
        </div>
        <div className="p-4 text-xs text-gray-500 leading-relaxed">
          Select a node to edit department color, name/title, and reporting metadata.
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">{isPerson ? "Person" : isGroup ? "Group" : "Node"}</div>
        <div className="mt-1 text-xs text-gray-500 truncate">{selectedNode.id}</div>
      </div>

      <div className="p-4 space-y-5 overflow-auto">
        {isGroup ? (
          <>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Label</div>
              <input
                value={String((selectedNode.data as any)?.label ?? "")}
                onChange={(e) => onUpdate(selectedNode.id, { label: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Accent Color</div>
              <input
                type="color"
                value={String((selectedNode.data as any)?.color ?? "#0f172a")}
                onChange={(e) => onUpdate(selectedNode.id, { color: e.target.value })}
                className="w-full h-10 rounded-xl border p-1"
              />
            </div>
          </>
        ) : null}

        {isPerson ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Department</div>
                <input
                  value={department}
                  onChange={(e) => onUpdate(selectedNode.id, { department: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Dept Color</div>
                <input
                  type="color"
                  value={deptColor}
                  onChange={(e) => onUpdate(selectedNode.id, { deptColor: e.target.value })}
                  className="w-full h-10 rounded-xl border p-1"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Name</div>
              <input
                value={name}
                onChange={(e) => onUpdate(selectedNode.id, { name: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Job Title</div>
              <input
                value={title}
                onChange={(e) => onUpdate(selectedNode.id, { title: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Avatar URL (optional)</div>
              <input
                value={avatarUrl}
                onChange={(e) => onUpdate(selectedNode.id, { avatarUrl: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Employment</div>
                <select
                  value={employmentType}
                  onChange={(e) => onUpdate(selectedNode.id, { employmentType: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                >
                  <option value="full_time">Full-time</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Group</div>
                <select
                  value={group}
                  onChange={(e) => onUpdate(selectedNode.id, { group: e.target.value || null })}
                  className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                >
                  <option value="">(none)</option>
                  <option value="core">Core</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Division (for divisional charts)</div>
              <input
                value={division}
                onChange={(e) => onUpdate(selectedNode.id, { division: e.target.value || null })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="e.g. North America, Product A"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Primary Manager (for functional/matrix)</div>
              <select
                value={parentNodeId}
                onChange={(e) => onUpdate(selectedNode.id, { parentNodeId: e.target.value || null })}
                className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
              >
                <option value="">(none)</option>
                {managerOptions
                  .filter((o) => o.id !== selectedNode.id)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
              </select>
              <div className="mt-1 text-[11px] text-gray-500">
                This field is used by Auto‑Layout and collapse/expand visibility.
              </div>
            </div>
          </>
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
