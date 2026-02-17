"use client";

import React from "react";

export default function FlowchartLegend() {
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-4 z-[60] w-[320px] rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial" }}
    >
      <div className="text-xs font-extrabold text-slate-900">Legend</div>
      <div className="mt-2 space-y-2 text-[12px] text-slate-700">
        <Row color="#e2e8f0" label="Process / Function (neutral)" />
        <Row color="#fef08a" label="Decision (branching)" />
        <Row color="#fbcfe8" label="Async / Callback (API call)" />
        <Row color="#fecaca" label="Error / Cancel / Timeout" />
        <Row color="#cffafe" label="Data / I/O" />
      </div>
      <div className="mt-3 text-[11px] text-slate-500">
        Solid edges = sync. Dashed edges = async/API. Label decision exits as Yes/No or Success/Fail.
      </div>
    </div>
  );
}

function Row({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded border" style={{ background: color }} />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

