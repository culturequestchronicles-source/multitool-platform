"use client";

import React from "react";
import { Box, Circle, Diamond, KeyRound, Layers2 } from "lucide-react";

export type ErdStencilType =
  | "erd_entity"
  | "erd_weak_entity"
  | "erd_attribute"
  | "erd_key_attribute"
  | "erd_multivalued_attribute"
  | "erd_relationship";

function StencilItem({
  type,
  label,
  Icon,
}: {
  type: ErdStencilType;
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

export default function ErdStencilSidebar() {
  return (
    <div className="w-[280px] h-full border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Stencil / Shape Library</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">Entity Relationship</div>
        <div className="mt-1 text-xs text-gray-500 leading-relaxed">
          Drag ERD shapes onto the canvas. Connect using handles.
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-1">Entities</div>
        <StencilItem type="erd_entity" label="Entity" Icon={Box} />
        <StencilItem type="erd_weak_entity" label="Weak Entity" Icon={Layers2} />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Attributes</div>
        <StencilItem type="erd_attribute" label="Attribute" Icon={Circle} />
        <StencilItem type="erd_key_attribute" label="Key Attribute" Icon={KeyRound} />
        <StencilItem type="erd_multivalued_attribute" label="Multivalued Attribute" Icon={Circle} />

        <div className="text-xs font-semibold text-gray-500 uppercase px-1 pt-3">Relationships</div>
        <StencilItem type="erd_relationship" label="Relationship" Icon={Diamond} />
      </div>

      <div className="mt-auto p-3 border-t border-slate-200 bg-gradient-to-t from-white/70 to-transparent">
        <div className="text-[11px] text-slate-500 leading-relaxed">
          Tip: For SaaS-grade ERDs, most users prefer Crow&apos;s Foot (table + FK) — we&apos;ll add notation toggles and SQL export next.
        </div>
      </div>
    </div>
  );
}
