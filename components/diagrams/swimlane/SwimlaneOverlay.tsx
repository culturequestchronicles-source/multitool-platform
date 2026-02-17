"use client";

import React, { useMemo } from "react";
import type { Node } from "@xyflow/react";
import { useStore } from "@xyflow/react";
import type { SwimlaneNodeData } from "@/lib/diagrams/swimlanes";
import { SWIMLANE_METRICS } from "@/lib/diagrams/swimlanes";

function isSwimlane(n: Node) {
  return String((n.data as any)?.kind ?? "") === "swimlane" || String(n.type ?? "") === "swimlane";
}

export default function SwimlaneOverlay({ nodes, theme }: { nodes: Node[]; theme: any }) {
  const transform = useStore((s: any) => s.transform) as [number, number, number];
  const [tx, ty, zoom] = transform ?? [0, 0, 1];

  const laneNode = useMemo(() => nodes.find(isSwimlane) ?? null, [nodes]);
  if (!laneNode) return null;

  const d = (laneNode.data ?? {}) as SwimlaneNodeData & { laneHeaderColors?: string[] };
  const lanes = Array.isArray(d.lanes) && d.lanes.length ? d.lanes : ["Lane 1"];
  const laneCount = Math.max(1, lanes.length);

  const width = Number(d.width ?? 1100);
  const height = Number(d.height ?? 620);

  const headerH = SWIMLANE_METRICS.headerH;
  const abs = (laneNode as any).positionAbsolute ?? laneNode.position ?? { x: 0, y: 0 };

  const laneHeaderColors = Array.isArray((d as any).laneHeaderColors) ? (d as any).laneHeaderColors : [];

  return (
    <div
      className="swimlane-overlay"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: abs.x,
            top: abs.y,
            width,
            height,
            borderRadius: 18,
            background: theme.laneBg,
            border: `2px solid ${theme.laneBorder}`,
            boxShadow: "0 14px 28px rgba(0,0,0,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: headerH,
              background: "rgba(255,255,255,0.92)",
              borderBottom: `2px solid ${theme.laneBorder}`,
            }}
          />

          {d.orientation !== "vertical" ? (
            <>
              <div
                style={{
                  position: "absolute",
                  top: headerH,
                  left: 0,
                  bottom: 0,
                  width: 170,
                  background: "rgba(255,255,255,0.78)",
                  borderRight: `2px solid ${theme.laneBorder}`,
                }}
              />
              {lanes.map((name, idx) => {
                const contentW = Math.max(1, width - 170);
                const contentH = Math.max(1, height - headerH);
                const bandH = contentH / laneCount;

                const top = headerH + idx * bandH;
                const left = 170;

                const laneStrip = laneHeaderColors[idx] ?? "rgba(0,0,0,0.10)";
                const bandBg = idx % 2 === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.30)";

                return (
                  <React.Fragment key={idx}>
                    <div
                      style={{
                        position: "absolute",
                        top,
                        left,
                        width: contentW,
                        height: bandH,
                        background: bandBg,
                        borderBottom: idx < laneCount - 1 ? `2px solid ${theme.laneBorder}` : undefined,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top,
                        left: 0,
                        width: 170,
                        height: bandH,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: idx < laneCount - 1 ? `2px solid ${theme.laneBorder}` : undefined,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: laneStrip }} />
                      <div style={{ fontWeight: 900, color: theme.text, fontSize: 14 }}>{name}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <>
              <div
                style={{
                  position: "absolute",
                  top: headerH,
                  left: 0,
                  right: 0,
                  height: SWIMLANE_METRICS.laneHeaderRowHVertical,
                  background: "rgba(255,255,255,0.84)",
                  borderBottom: `2px solid ${theme.laneBorder}`,
                }}
              />

              {lanes.map((name, idx) => {
                const laneHeaderRowH = SWIMLANE_METRICS.laneHeaderRowHVertical;
                const contentW = Math.max(1, width);
                const contentH = Math.max(1, height - headerH - laneHeaderRowH);
                const bandW = contentW / laneCount;

                const left = idx * bandW;
                const top = headerH + laneHeaderRowH;

                const laneStrip = laneHeaderColors[idx] ?? "rgba(0,0,0,0.10)";
                const bandBg = idx % 2 === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.30)";

                return (
                  <React.Fragment key={idx}>
                    <div
                      style={{
                        position: "absolute",
                        top,
                        left,
                        width: bandW,
                        height: contentH,
                        background: bandBg,
                        borderRight: idx < laneCount - 1 ? `2px solid ${theme.laneBorder}` : undefined,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: headerH,
                        left,
                        width: bandW,
                        height: laneHeaderRowH,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: idx < laneCount - 1 ? `2px solid ${theme.laneBorder}` : undefined,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: laneStrip }} />
                      <div style={{ fontWeight: 900, color: theme.text, fontSize: 14 }}>{name}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
