"use client";

import { memo, useMemo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

type SwimlaneData = {
  label: string;
  headerColor?: string; // hex
  borderColor?: string;
  textColor?: string;
  isVertical?: boolean;
  onRename?: (id: string, next: string) => void;
};

export default memo(function CustomSwimlaneNode(props: NodeProps) {
  const { id, data, selected } = props;
  const d = (data ?? {}) as SwimlaneData;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.label ?? "Lane");

  const headerStyle = useMemo(() => {
    const bg = d.headerColor ?? "#e2e8f0";
    const color = d.textColor ?? "#0f172a";
    const border = d.borderColor ?? "#cbd5e1";
    return { background: bg, color, borderColor: border };
  }, [d.headerColor, d.textColor, d.borderColor]);

  return (
    <div
      className={cn("rounded-2xl border bg-white shadow-sm overflow-hidden", selected ? "ring-2 ring-black/20" : "")}
      style={{
        borderColor: d.borderColor ?? "#cbd5e1",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 text-sm font-extrabold select-none"
        style={headerStyle}
        onDoubleClick={() => {
          setDraft(d.label ?? "Lane");
          setEditing(true);
        }}
        title="Double-click to rename lane"
      >
        {!editing ? (
          <span className="truncate">{d.label ?? "Lane"}</span>
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setEditing(false);
              const next = draft.trim() || "Lane";
              d.onRename?.(id, next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full rounded-lg border bg-white/80 px-2 py-1 text-xs font-bold outline-none"
          />
        )}

        <span className="text-[11px] font-bold opacity-80">{d.isVertical ? "Vertical" : "Horizontal"}</span>
      </div>

      <div className="relative h-full w-full bg-white" />
    </div>
  );
});
