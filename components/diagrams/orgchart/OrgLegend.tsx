"use client";

import React from "react";

export default function OrgLegend() {
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-4 z-[60] w-[340px] rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial" }}
    >
      <div className="text-xs font-extrabold text-slate-900">Legend</div>
      <div className="mt-2 space-y-2 text-[12px] text-slate-700">
        <Row color="#2563eb" label="Engineering (example)" />
        <Row color="#f97316" label="HR (example)" />
        <Row color="#10b981" label="Operations (example)" />
        <Row color="#7c3aed" label="Finance (example)" />
      </div>
      <div className="mt-3 text-[11px] text-slate-500">
        Solid edges = primary manager. Dashed edges = secondary/project manager (matrix).
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

