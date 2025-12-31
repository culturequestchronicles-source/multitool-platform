"use client";

import React from "react";
import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";

export type BpmnPaletteItem =
  | { type: "start_event"; label: string; color: string }
  | { type: "end_event"; label: string; color: string }
  | { type: "task"; label: string; color: string }
  | { type: "subprocess"; label: string; color: string }
  | { type: "gateway_xor_split"; label: string; color: string }
  | { type: "gateway_xor_merge"; label: string; color: string }
  | { type: "intermediate_message"; label: string; color: string }
  | { type: "intermediate_timer"; label: string; color: string };

const ITEMS: BpmnPaletteItem[] = [
  { type: "start_event", label: "Start Event", color: "#16a34a" },
  { type: "task", label: "Task", color: "#2563eb" },
  { type: "subprocess", label: "Sub-process", color: "#0f172a" },
  { type: "gateway_xor_split", label: "XOR Split", color: "#f59e0b" },
  { type: "gateway_xor_merge", label: "XOR Merge", color: "#f59e0b" },
  { type: "intermediate_message", label: "Message Event", color: "#7c3aed" },
  { type: "intermediate_timer", label: "Timer Event", color: "#db2777" },
  { type: "end_event", label: "End Event", color: "#dc2626" },
];

export default function BpmnPalette({
  theme,
  setThemeId,
  onAdd,
  onExportSvg,
  onSwimlaneHorizontal,
  onSwimlaneVertical,
  onAiGenerateSwimlanes,
  onAiGenerateFullProcess,
}: {
  theme: DiagramTheme;
  setThemeId: (id: string) => void;
  onAdd: (item: BpmnPaletteItem) => void;
  onExportSvg: () => void;

  onSwimlaneHorizontal: () => void;
  onSwimlaneVertical: () => void;
  onAiGenerateSwimlanes: () => void;
  onAiGenerateFullProcess: () => void;
}) {
  return (
    <div className="w-[320px] shrink-0 border-r bg-white p-3">
      <div className="mb-2 text-sm font-semibold">BPMN Stencil</div>

      <div className="space-y-2">
        {ITEMS.map((it) => (
          <button
            key={it.type}
            onClick={() => onAdd(it)}
            className="w-full rounded-2xl border px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
              style={{ background: it.color }}
            />
            <span className="align-middle">{it.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">Swim Lanes</div>
        <div className="mt-2 space-y-2">
          <button
            className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => onAdd({ type: "swimlane_horizontal", label: "Swim Lanes (Horizontal)" })}
          >
            Swim Lanes (Horizontal)
          </button>
          <button
            className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => onAdd({ type: "swimlane_vertical", label: "Swim Lanes (Vertical)" })}
          >
            Swim Lanes (Vertical)
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">Theme</div>
        <select
          className="mt-2 w-full rounded-2xl border px-3 py-2 text-sm"
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

      <div className="mt-4">
        <div className="text-sm font-semibold">Swim Lanes</div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            className="rounded-2xl border px-3 py-2 text-xs hover:bg-gray-50"
            onClick={onSwimlaneHorizontal}
          >
            Horizontal
          </button>
          <button
            className="rounded-2xl border px-3 py-2 text-xs hover:bg-gray-50"
            onClick={onSwimlaneVertical}
          >
            Vertical
          </button>
        </div>

        <div className="mt-2 grid gap-2">
          <button
            className="w-full rounded-2xl bg-black px-3 py-2 text-xs text-white"
            onClick={onAiGenerateSwimlanes}
          >
            AI: Generate Swim Lanes
          </button>
          <button
            className="w-full rounded-2xl border px-3 py-2 text-xs hover:bg-gray-50"
            onClick={onAiGenerateFullProcess}
          >
            AI: Generate Full Process
          </button>
        </div>
      </div>

      <div className="mt-3">
        <button
          className="w-full rounded-2xl bg-black px-3 py-2 text-xs text-white"
          onClick={onExportSvg}
        >
          Export SVG
        </button>
        <button
          className="w-full rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          onClick={onExportVisio}
        >
          Export SVG (Visio)
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          onClick={onExportBpmn}
        >
          Export BPMN (Camunda)
        </button>
        <button
          className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          onClick={onExportJson}
        >
          Export JSON
        </button>
      </div>

      <div className="mt-2">
        <button
          className="w-full rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          onClick={onExportPptx}
        >
          Export PPTX
        </button>
      </div>

      <div className="mt-4 rounded-xl border bg-gray-50 p-3 text-xs text-gray-700">
        <div className="font-semibold">AI Assist</div>
        <div className="mt-2 grid gap-2">
          <button
            className="w-full rounded-xl border px-3 py-2 text-xs hover:bg-white"
            onClick={onGenerateSwimlanes}
          >
            Generate Swim Lanes
          </button>
          <button
            className="w-full rounded-xl border px-3 py-2 text-xs hover:bg-white"
            onClick={onGenerateProcess}
          >
            Generate Full Process
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border bg-gray-50 p-3 text-xs text-gray-700">
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
