"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import type { DiagramTheme } from "@/lib/diagrams/themes";

export type SwimlaneNodeData = {
  kind: "swimlane";
  label: string;
  orientation: "horizontal" | "vertical";
  lanes: string[];
  width: number;
  height: number;
  theme?: DiagramTheme;
};

export default function SwimlaneNode(props: NodeProps<SwimlaneNodeData>) {
  const { data } = props;
  const theme = data.theme;
  const lanes = data.lanes.length ? data.lanes : ["Lane 1"];
  const laneCount = lanes.length;

  const isHorizontal = data.orientation === "horizontal";
  const laneSize = isHorizontal ? data.height / laneCount : data.width / laneCount;

  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        border: `2px solid ${theme?.nodeBorder ?? "#CBD5E1"}`,
        background: theme?.canvasBg ?? "#F8FAFC",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          fontSize: 12,
          fontWeight: 700,
          color: theme?.text ?? "#111827",
          zIndex: 2,
        }}
      >
        {data.label || "Swim Lanes"}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "column" : "row",
          width: "100%",
          height: "100%",
          paddingTop: 28,
        }}
      >
        {lanes.map((lane, index) => (
          <div
            key={`${lane}-${index}`}
            style={{
              flex: "1 1 auto",
              borderTop:
                isHorizontal && index > 0
                  ? `1px solid ${theme?.nodeBorder ?? "#CBD5E1"}`
                  : undefined,
              borderLeft:
                !isHorizontal && index > 0
                  ? `1px solid ${theme?.nodeBorder ?? "#CBD5E1"}`
                  : undefined,
              position: "relative",
              minHeight: isHorizontal ? laneSize : undefined,
              minWidth: !isHorizontal ? laneSize : undefined,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 6,
                left: 12,
                fontSize: 11,
                fontWeight: 600,
                color: theme?.text ?? "#111827",
                opacity: 0.7,
              }}
            >
              {lane}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
