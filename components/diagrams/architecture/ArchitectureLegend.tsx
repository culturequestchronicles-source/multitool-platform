"use client";

import React from "react";

export default function ArchitectureLegend() {
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-4 z-[60] w-[360px] rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial" }}
    >
      <div className="text-xs font-extrabold text-slate-900">Legend</div>
      <div className="mt-2 space-y-2 text-[12px] text-slate-700">
        <Row label="Solid edge" desc="Synchronous request/response" />
        <Row label="Dashed edge" desc="Async/event/message flow" />
        <Row label="Dashed boundary" desc="Region/VPC/Cluster boundary" />
      </div>
      <div className="mt-3 text-[11px] text-slate-500">
        Tip: keep layers left→right (Client → Security → Compute → Messaging → Data → Observability).
      </div>
    </div>
  );
}

function Row({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-extrabold text-slate-900">{label}</span>
      <span className="text-slate-600">{desc}</span>
    </div>
  );
}

