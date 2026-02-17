"use client";

import React, { memo } from "react";
import type { EdgeProps } from "@xyflow/react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import type { ErdCardinality, ErdEdgeData, ErdNotation } from "@/lib/diagrams/erd";

function renderCardinalityEndMarker(opts: {
  x: number;
  y: number;
  position: "left" | "right" | "top" | "bottom";
  card: ErdCardinality;
  stroke: string;
}) {
  const { x, y, position, card, stroke } = opts;

  // Direction vector pointing OUT of the edge end (from node to outside).
  const dir =
    position === "left"
      ? { dx: -1, dy: 0 }
      : position === "right"
        ? { dx: 1, dy: 0 }
        : position === "top"
          ? { dx: 0, dy: -1 }
          : { dx: 0, dy: 1 };

  // Perpendicular unit vector.
  const perp = { dx: -dir.dy, dy: dir.dx };

  const hasCircle = card.startsWith("0..");
  const isMany = card.endsWith("..N");
  const isOne = card.endsWith("..1");

  const parts: React.ReactNode[] = [];

  // Base offset from endpoint so markers don't overlap node border.
  const base = 10;
  const cx = x + dir.dx * base;
  const cy = y + dir.dy * base;

  if (hasCircle) {
    parts.push(
      <circle key="c" cx={cx} cy={cy} r={5} fill="#fff" stroke={stroke} strokeWidth={2} />
    );
  }

  const anchorX = hasCircle ? cx + dir.dx * 8 : cx;
  const anchorY = hasCircle ? cy + dir.dy * 8 : cy;

  if (isOne) {
    // one: a single perpendicular bar
    const bar = 10;
    parts.push(
      <line
        key="one"
        x1={anchorX + perp.dx * bar}
        y1={anchorY + perp.dy * bar}
        x2={anchorX - perp.dx * bar}
        y2={anchorY - perp.dy * bar}
        stroke={stroke}
        strokeWidth={2.2}
      />
    );
  }

  if (isMany) {
    // many: crowfoot (3 prongs)
    const prong = 12;
    const spread = 10;
    const tipX = anchorX + dir.dx * prong;
    const tipY = anchorY + dir.dy * prong;

    parts.push(
      <line
        key="m1"
        x1={anchorX + perp.dx * spread}
        y1={anchorY + perp.dy * spread}
        x2={tipX}
        y2={tipY}
        stroke={stroke}
        strokeWidth={2.2}
      />
    );
    parts.push(
      <line
        key="m2"
        x1={anchorX - perp.dx * spread}
        y1={anchorY - perp.dy * spread}
        x2={tipX}
        y2={tipY}
        stroke={stroke}
        strokeWidth={2.2}
      />
    );
    parts.push(
      <line
        key="m3"
        x1={anchorX}
        y1={anchorY}
        x2={tipX}
        y2={tipY}
        stroke={stroke}
        strokeWidth={2.2}
      />
    );
  }

  return <>{parts}</>;
}

function toSide(p: any): "left" | "right" | "top" | "bottom" {
  const v = String(p ?? "").toLowerCase();
  if (v.includes("left")) return "left";
  if (v.includes("right")) return "right";
  if (v.includes("top")) return "top";
  return "bottom";
}

export default memo(function ErdEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    data,
  } = props;

  const d = (data ?? {}) as Partial<ErdEdgeData>;
  const notation: ErdNotation = d.notation ?? "crows_foot";
  const sourceCard: ErdCardinality = d.sourceCardinality ?? "1..N";
  const targetCard: ErdCardinality = d.targetCardinality ?? "1..1";

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
  });

  const stroke = (style as any)?.stroke ?? "#111827";

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ ...style, strokeWidth: 2.2 }} markerEnd={markerEnd} />

      {notation === "crows_foot" ? (
        <g>
          {renderCardinalityEndMarker({
            x: sourceX,
            y: sourceY,
            position: toSide(sourcePosition),
            card: sourceCard,
            stroke,
          })}
          {renderCardinalityEndMarker({
            x: targetX,
            y: targetY,
            position: toSide(targetPosition),
            card: targetCard,
            stroke,
          })}
        </g>
      ) : null}

      {d.label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "white",
              border: "1px solid rgba(0,0,0,0.12)",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              pointerEvents: "all",
              userSelect: "none",
              zIndex: 40,
            }}
          >
            {String(d.label)}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
});

