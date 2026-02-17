"use client";

import React from "react";
import { DATA_LAYER_COLORS, type DataArchitectureLayer } from "@/lib/diagrams/dataArchitecture";

const LAYERS: DataArchitectureLayer[] = ["ingestion", "processing", "storage", "analytics"];

export default function DataArchitectureLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[60] w-[340px] rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="text-xs font-extrabold text-slate-900">Color System</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {LAYERS.map((l) => {
          const c = DATA_LAYER_COLORS[l];
          return (
            <div key={l} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: c.border }}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-slate-800">{c.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-slate-600">
        Tip: Keep a clean left→right spine. Use dashed edges for async/event flows.
      </div>
    </div>
  );
}

