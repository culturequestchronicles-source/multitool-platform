"use client";

import React from "react";
import {
  Play,
  Square,
  Diamond,
  Database,
  ArrowRightLeft,
  Columns3,
  SquareDashedBottom,
} from "lucide-react";

export type StencilType = "start" | "process" | "decision" | "data" | "database" | "connector";

function StencilItem({
  type,
  label,
  Icon,
}: {
  type: StencilType;
  label: string;
  Icon: any;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/jhatpat-stencil", type);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 cursor-grab active:cursor-grabbing shadow-sm hover:bg-white hover:shadow transition"
      title="Drag onto canvas"
    >
      <div className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-[11px] text-slate-500">Drag to add</div>
      </div>
    </div>
  );
}

export default function StencilSidebar({
  onAddHorizontalSwimlanes,
  onAddVerticalSwimlanes,
}: {
  onAddHorizontalSwimlanes: () => void;
  onAddVerticalSwimlanes: () => void;
}) {
  return (
    <div className="w-[280px] h-full border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">
          Stencil / Shape Library
        </div>
        <div className="mt-1 text-sm font-semibold text-gray-900">Flowchart Symbols</div>
        <div className="mt-1 text-xs text-gray-500 leading-relaxed">
          Drag a symbol onto the canvas. Then connect using any side handle.
        </div>
      </div>

      <div className="p-3 space-y-2">
        <StencilItem type="start" label="Start / End" Icon={Play} />
        <StencilItem type="process" label="Process" Icon={Square} />
        <StencilItem type="decision" label="Decision" Icon={Diamond} />
        {/* ✅ FIX: lucide-react does NOT export Parallelogram in your version */}
        <StencilItem type="data" label="Data" Icon={SquareDashedBottom} />
        <StencilItem type="database" label="Database" Icon={Database} />
        <StencilItem type="connector" label="Connector" Icon={ArrowRightLeft} />
      </div>

      <div className="mt-auto p-3 border-t border-slate-200 space-y-2 bg-gradient-to-t from-white/70 to-transparent">
        <div className="text-xs font-semibold text-gray-500 uppercase">Swimlanes</div>

        <button
          onClick={onAddHorizontalSwimlanes}
          className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold hover:bg-white hover:shadow-sm transition flex items-center justify-center gap-2"
        >
          <Columns3 className="h-4 w-4" />
          Horizontal Swimlanes
        </button>

        <button
          onClick={onAddVerticalSwimlanes}
          className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold hover:bg-white hover:shadow-sm transition flex items-center justify-center gap-2"
        >
          <Columns3 className="h-4 w-4 rotate-90" />
          Vertical Swimlanes
        </button>

        <div className="text-[11px] text-gray-500 leading-relaxed pt-2">
          Tip: nodes will “stick” inside lanes once placed, and move together with the container.
        </div>
      </div>
    </div>
  );
}
