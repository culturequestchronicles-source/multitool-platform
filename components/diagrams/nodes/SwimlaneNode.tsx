"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { NodeProps } from "@xyflow/react";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";
import type { SwimlaneNodeData } from "@/lib/diagrams/swimlanes";
import { SWIMLANE_METRICS } from "@/lib/diagrams/swimlanes";

type SwimlaneExtras = { theme?: any };

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function SwimlaneNode(props: NodeProps) {
  const editor = useDiagramEditor();
  const d = (props.data ?? {}) as SwimlaneNodeData & SwimlaneExtras;
  const theme = d?.theme ?? editor.theme;

  const orientation: "horizontal" | "vertical" = d.orientation === "vertical" ? "vertical" : "horizontal";
  const lanes: string[] = Array.isArray(d.lanes) && d.lanes.length ? d.lanes : ["Lane 1"];
  const laneCount = Math.max(1, lanes.length);

  const width = Number.isFinite(Number(d.width)) ? Number(d.width) : 1100;
  const height = Number.isFinite(Number(d.height)) ? Number(d.height) : 620;

  // header editing
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState<string>(String(d.label ?? "Swim Lanes"));
  useEffect(() => setHeaderDraft(String(d.label ?? "Swim Lanes")), [d.label]);

  // lane rename panel
  const [showRename, setShowRename] = useState(false);

  const stop = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const commitHeader = useCallback(() => {
    const next = headerDraft.trim() || "Swim Lanes";
    setEditingHeader(false);
    editor.renameSwimlaneHeader(props.id, next);
  }, [editor, headerDraft, props.id]);

  // ✅ resize handle (issue f)
  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const minSize = useMemo(() => {
    const headerH = SWIMLANE_METRICS.headerH;
    if (orientation === "horizontal") {
      const minH = Math.max(420, headerH + laneCount * 120);
      const minW = 700;
      return { minW, minH };
    } else {
      // vertical: lane headers at top, so width scales with lane count
      const minW = Math.max(760, laneCount * 180);
      const minH = 520;
      return { minW, minH };
    }
  }, [laneCount, orientation]);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      stop(e);
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, startW: width, startH: height };
    },
    [height, stop, width]
  );

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      stop(e);

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const nextW = clamp(dragRef.current.startW + dx, minSize.minW, 8000);
      const nextH = clamp(dragRef.current.startH + dy, minSize.minH, 8000);

      editor.resizeLaneContainer(props.id, nextW, nextH);
    },
    [editor, minSize.minH, minSize.minW, props.id, stop]
  );

  const onResizePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      stop(e);
      dragRef.current = null;
    },
    [stop]
  );

  return (
    <div
      style={{
        width,
        height,
        background: "transparent", // ✅ never hides edges
        border: "none",
        position: "relative",
        zIndex: 0,
        pointerEvents: "auto",
      }}
    >
      {/* Header control bar */}
      <div
        style={{
          height: SWIMLANE_METRICS.headerH,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 14,
          border: `2px solid ${theme.laneBorder}`,
          boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingHeader(true);
        }}
        title="Double-click to rename swimlane"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {!editingHeader ? (
            <div style={{ fontWeight: 900, fontSize: 16, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {String(d.label ?? "Swim Lanes")}
            </div>
          ) : (
            <input
              autoFocus
              value={headerDraft}
              onChange={(e) => setHeaderDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitHeader();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setEditingHeader(false);
                  setHeaderDraft(String(d.label ?? "Swim Lanes"));
                }
              }}
              onBlur={commitHeader}
              style={{
                width: 260,
                padding: "6px 10px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                fontSize: 14,
                fontWeight: 800,
                outline: "none",
              }}
            />
          )}

          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", fontWeight: 800, whiteSpace: "nowrap" }}>
            {orientation === "horizontal" ? "Horizontal" : "Vertical"} • {laneCount} lanes
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onPointerDownCapture={stop}
            onMouseDownCapture={stop}
            onClick={(e) => {
              stop(e);
              setShowRename((v) => !v);
            }}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
              background: "white",
            }}
            title="Rename lanes"
          >
            Rename lanes
          </button>

          <button
            onPointerDownCapture={stop}
            onMouseDownCapture={stop}
            onClick={(e) => {
              stop(e);
              editor.addLane(props.id);
            }}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
              background: "white",
            }}
            title="Add lane"
          >
            + Lane
          </button>

          <button
            onPointerDownCapture={stop}
            onMouseDownCapture={stop}
            onClick={(e) => {
              stop(e);
              editor.removeLane(props.id);
            }}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
              background: "white",
            }}
            title="Remove lane"
          >
            − Lane
          </button>
        </div>
      </div>

      {/* ✅ Rename lanes panel (issue e) */}
      {showRename ? (
        <div
          onPointerDownCapture={stop}
          onMouseDownCapture={stop}
          style={{
            position: "absolute",
            top: SWIMLANE_METRICS.headerH + 8,
            left: 0,
            width: 360,
            maxWidth: "90%",
            background: "white",
            border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: 16,
            boxShadow: "0 18px 38px rgba(0,0,0,0.16)",
            padding: 12,
            zIndex: 50,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 13, color: "#0f172a" }}>Rename lanes</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {lanes.map((ln, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 60, fontSize: 11, fontWeight: 900, color: "rgba(0,0,0,0.55)" }}>
                  Lane {idx + 1}
                </div>
                <input
                  value={String(ln ?? "")}
                  onChange={(e) => editor.renameLane(props.id, idx, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    fontSize: 13,
                    fontWeight: 800,
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(0,0,0,0.55)", fontWeight: 700 }}>
            Tip: lane titles are always editable here even though the overlay draws the lane background.
          </div>
        </div>
      ) : null}

      {/* ✅ bottom-right resize handle */}
      <div
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          width: 18,
          height: 18,
          borderRadius: 6,
          border: "1px solid rgba(0,0,0,0.20)",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
          cursor: "nwse-resize",
          zIndex: 60,
        }}
        title="Resize swimlane"
      />
    </div>
  );
}
