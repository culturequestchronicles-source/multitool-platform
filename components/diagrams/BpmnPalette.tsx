"use client";

import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";

export type BpmnPaletteItem =
  | { type: "start_event"; label: string }
  | { type: "end_event"; label: string }
  | { type: "task"; label: string }
  | { type: "subprocess"; label: string }
  | { type: "gateway_xor_split"; label: string }
  | { type: "gateway_xor_merge"; label: string }
  | { type: "intermediate_message"; label: string }
  | { type: "intermediate_timer"; label: string };

const ITEMS: BpmnPaletteItem[] = [
  { type: "start_event", label: "Start Event" },
  { type: "task", label: "Task" },
  { type: "subprocess", label: "Sub-process" },
  { type: "gateway_xor_split", label: "XOR Split" },
  { type: "gateway_xor_merge", label: "XOR Merge" },
  { type: "intermediate_message", label: "Message Event" },
  { type: "intermediate_timer", label: "Timer Event" },
  { type: "end_event", label: "End Event" },
];

export default function BpmnPalette({
  theme,
  setThemeId,
  onAdd,
  onCollapseAll,
  onExpandAll,
  onExportSvg,
}: {
  theme: DiagramTheme;
  setThemeId: (id: string) => void;
  onAdd: (item: BpmnPaletteItem) => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onExportSvg: () => void;
}) {
  return (
    <div className="w-[280px] shrink-0 border-r bg-white p-3">
      <div className="mb-2 text-sm font-semibold">BPMN Stencil</div>

      <div className="space-y-2">
        {ITEMS.map((it) => (
          <button
            key={it.type}
            onClick={() => onAdd(it)}
            className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            {it.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">Theme</div>
        <select
          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
          value={theme.id}
          onChange={(e) => setThemeId(e.target.value)}
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          onClick={onCollapseAll}
        >
          Collapse All
        </button>
        <button
          className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          onClick={onExpandAll}
        >
          Expand All
        </button>
      </div>

      <div className="mt-2">
        <button
          className="w-full rounded-xl bg-black px-3 py-2 text-xs text-white"
          onClick={onExportSvg}
        >
          Export SVG
        </button>
      </div>

      <div className="mt-4 rounded-xl border bg-gray-50 p-3 text-xs text-gray-700">
        <div className="font-semibold">Validation (starter)</div>
        <ul className="mt-1 list-disc pl-4">
          <li>Start: no incoming</li>
          <li>End: no outgoing</li>
          <li>Intermediate Events: 1 in / 1 out</li>
          <li>XOR Split: 1 incoming</li>
          <li>XOR Merge: 1 outgoing</li>
        </ul>
      </div>
    </div>
  );
}
