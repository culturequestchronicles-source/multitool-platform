"use client";

import React from "react";
import Link from "next/link";
import { Building2, Users, User, GitMerge } from "lucide-react";

export type OrgStencilType = "org_person" | "org_contractor" | "org_team" | "org_division";

function StencilItem({
  type,
  label,
  hint,
  Icon,
}: {
  type: OrgStencilType;
  label: string;
  hint: string;
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
        <div className="text-[11px] text-slate-500">{hint}</div>
      </div>
    </div>
  );
}

export default function OrgChartStencilSidebar() {
  return (
    <div className="w-[280px] h-full border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Stencil / Shape Library</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">Org Chart</div>
        <div className="mt-1 text-xs text-gray-500 leading-relaxed">
          Drag people and teams onto the canvas. Connect <b>Manager → Report</b>. Use Auto‑Layout for clean spacing.
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-1">People</div>
        <StencilItem type="org_person" label="Employee" Icon={User} hint="Card with department banner + avatar" />
        <StencilItem type="org_contractor" label="Contractor" Icon={User} hint="Distinct marker for non‑FTE" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Groups</div>
        <StencilItem type="org_team" label="Team / Function" Icon={Users} hint="Group label node (optional)" />
        <StencilItem type="org_division" label="Division" Icon={Building2} hint="Division header node (optional)" />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Matrix</div>
        <StencilItem type="org_team" label="Project Manager" Icon={GitMerge} hint="Use dashed secondary reporting edges" />
      </div>

      <div className="mt-auto p-3 border-t border-slate-200 bg-gradient-to-t from-white/70 to-transparent">
        <div className="text-[11px] text-slate-500 leading-relaxed">
          Tip: For matrix charts, keep <b>primary</b> reporting lines solid and mark <b>secondary</b> reporting lines as
          dashed via the edge editor.
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/help/diagrams/org-chart"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-white hover:shadow transition"
          >
            User Guide
          </Link>
          <Link
            href="/help/how-to"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-white hover:shadow transition"
          >
            How-to
          </Link>
          <Link
            href="/tools/diagrams"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-white hover:shadow transition"
          >
            Recents
          </Link>
        </div>
      </div>
    </div>
  );
}
