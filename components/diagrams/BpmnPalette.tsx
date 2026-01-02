"use client";

import React, { useMemo, useState } from "react";

export type BpmnPaletteItem = {
  kind:
    | "start_event"
    | "end_event"
    | "intermediate_message"
    | "intermediate_timer"
    | "task"
    | "subprocess"
    | "gateway_xor_split"
    | "gateway_xor_merge"
    | "data_io"
    | "document"
    | "database"
    | "connector"
    | "fork_join"
    | "delay"
    | "loop_start"
    | "loop_end";
  label: string;
  description?: string;
  color: string; // used as node meta.color (bg)
  accent?: string; // used for a small dot indicator
};

type Props = {
  onAdd: (item: BpmnPaletteItem) => void;
  onSwimlaneHorizontal: () => void;
  onSwimlaneVertical: () => void;
};

const GROUPS: Array<{
  title: string;
  items: BpmnPaletteItem[];
}> = [
  {
    title: "BPMN Core",
    items: [
      { kind: "start_event", label: "Start Event", description: "Process start", color: "#ECFDF5", accent: "#22C55E" },
      { kind: "task", label: "Task", description: "Work activity", color: "#EFF6FF", accent: "#3B82F6" },
      { kind: "subprocess", label: "Sub-process", description: "Collapsible detail", color: "#F5F3FF", accent: "#8B5CF6" },
      { kind: "gateway_xor_split", label: "XOR Split", description: "Decision (split)", color: "#FFFBEB", accent: "#EAB308" },
      { kind: "gateway_xor_merge", label: "XOR Merge", description: "Decision (merge)", color: "#FFFBEB", accent: "#EAB308" },
      { kind: "intermediate_message", label: "Message Event", description: "Receive message", color: "#F0FDFA", accent: "#14B8A6" },
      { kind: "intermediate_timer", label: "Timer Event", description: "Wait/time", color: "#F0FDFA", accent: "#14B8A6" },
      { kind: "end_event", label: "End Event", description: "Process end", color: "#FEF2F2", accent: "#EF4444" },
    ],
  },
  {
    title: "Enterprise Symbols",
    items: [
      { kind: "data_io", label: "Data I/O", description: "Input/Output", color: "#F0F9FF", accent: "#0EA5E9" },
      { kind: "document", label: "Document", description: "Artifact", color: "#FFFBEB", accent: "#F59E0B" },
      { kind: "database", label: "Database", description: "Store", color: "#F1F5F9", accent: "#64748B" },
      { kind: "connector", label: "Connector", description: "Link", color: "#F8FAFC", accent: "#334155" },
      { kind: "fork_join", label: "Fork/Join", description: "Parallel", color: "#F5F3FF", accent: "#7C3AED" },
      { kind: "delay", label: "Delay", description: "Pause", color: "#FFF7ED", accent: "#FB923C" },
      { kind: "loop_start", label: "Loop Start", description: "Iteration", color: "#ECFCCB", accent: "#84CC16" },
      { kind: "loop_end", label: "Loop End", description: "Iteration", color: "#ECFCCB", accent: "#84CC16" },
    ],
  },
];

function pill(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export default function BpmnPalette({ onAdd, onSwimlaneHorizontal, onSwimlaneVertical }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = pill(q);
    if (!qq) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => pill(`${it.label} ${it.description ?? ""} ${it.kind}`).includes(qq)),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  return (
    <div className="w-[280px] border-r bg-white h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase">BPMN Stencil</div>
        <div className="mt-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search symbols…"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {filtered.map((g) => (
          <div key={g.title}>
            <div className="text-xs font-semibold text-gray-600 mb-2">{g.title}</div>
            <div className="grid grid-cols-1 gap-2">
              {g.items.map((item) => (
                <button
                  key={item.kind}
                  onClick={() => onAdd(item)}
                  className="group flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 hover:shadow-sm hover:bg-gray-50 transition"
                  title={item.description ?? item.label}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl border flex items-center justify-center"
                      style={{ background: item.color, borderColor: "rgba(0,0,0,0.10)" }}
                    >
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.accent ?? "#111827" }} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                      <div className="text-[11px] text-gray-500">{item.description ?? item.kind}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 group-hover:text-gray-600">Add</div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-3 border-t">
          <div className="text-xs font-semibold text-gray-600 mb-2">Swimlanes</div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onSwimlaneHorizontal}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              title="Insert a horizontal swimlane container"
            >
              + Horizontal Swimlane
            </button>
            <button
              onClick={onSwimlaneVertical}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              title="Insert a vertical swimlane container"
            >
              + Vertical Swimlane
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
