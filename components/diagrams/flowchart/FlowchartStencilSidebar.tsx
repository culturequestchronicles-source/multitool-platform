"use client";

import React from "react";
import {
  Play,
  Square,
  Diamond,
  Database,
  ArrowRightLeft,
  SquareDashedBottom,
  AlertTriangle,
  Wand2,
  FileStack,
  Keyboard,
  Cog,
} from "lucide-react";

export type FlowchartStencilType =
  | "fc_start_end"
  | "fc_process"
  | "fc_decision"
  | "fc_user_input"
  | "fc_system_task"
  | "fc_async_callback"
  | "fc_error_cancel"
  | "fc_documents"
  | "fc_data"
  | "fc_database"
  | "fc_connector";

function StencilItem({
  type,
  label,
  Icon,
  hint,
}: {
  type: FlowchartStencilType;
  label: string;
  Icon: any;
  hint: string;
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
        <div className="text-[11px] text-slate-500">{hint}</div>
      </div>
    </div>
  );
}

export default function FlowchartStencilSidebar() {
  return (
    <div className="w-[280px] h-full border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Stencil / Shape Library</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">Flowchart</div>
        <div className="mt-1 text-xs text-gray-500 leading-relaxed">
          Drag a shape onto the canvas. Connect using handles. Use color to communicate meaning (async, error, etc).
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-1">Core</div>
        <StencilItem type="fc_start_end" label="Start / End" Icon={Play} hint="Entry/exit terminals" />
        <StencilItem type="fc_process" label="Process" Icon={Square} hint="Standard action/function" />
        <StencilItem type="fc_decision" label="Decision" Icon={Diamond} hint="Branch (Yes/No, Success/Fail)" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Enterprise</div>
        <StencilItem type="fc_user_input" label="User Input" Icon={Keyboard} hint="Manual user step" />
        <StencilItem type="fc_system_task" label="System Task" Icon={Cog} hint="Automated/system step" />
        <StencilItem type="fc_async_callback" label="Async / Callback" Icon={Wand2} hint="API call, async work" />
        <StencilItem type="fc_error_cancel" label="Error / Cancel" Icon={AlertTriangle} hint="Failure/timeout branch" />
        <StencilItem type="fc_documents" label="Documents (Stack)" Icon={FileStack} hint="Collection/sequence" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Data</div>
        <StencilItem type="fc_data" label="Data (I/O)" Icon={SquareDashedBottom} hint="Input/output payload" />
        <StencilItem type="fc_database" label="Database" Icon={Database} hint="Persistence/storage" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Links</div>
        <StencilItem type="fc_connector" label="Connector" Icon={ArrowRightLeft} hint="Connector node (optional)" />
      </div>

      <div className="mt-auto p-3 border-t border-slate-200 bg-gradient-to-t from-white/70 to-transparent">
        <div className="text-[11px] text-slate-500 leading-relaxed">
          Tip: Keep a clean “happy path” spine. Put errors/timeouts on side branches. Label decision exits (Yes/No).
        </div>
      </div>
    </div>
  );
}
