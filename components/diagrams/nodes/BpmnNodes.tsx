"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { DiagramTheme } from "@/lib/diagrams/themes";

function Base({
  title,
  subtitle,
  theme,
  shape = "rect",
  badge,
}: {
  title: string;
  subtitle?: string;
  theme: DiagramTheme;
  shape?: "rect" | "circle" | "diamond";
  badge?: string;
}) {
  const common: React.CSSProperties = {
    color: theme.text,
    border: `2px solid ${theme.nodeBorder}`,
    background: theme.nodeBg,
    borderRadius: shape === "rect" ? 14 : shape === "circle" ? 999 : 10,
    padding: "14px 16px",
    minWidth: 160,
    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
    transform: shape === "diamond" ? "rotate(45deg)" : undefined,
  };

  const inner: React.CSSProperties =
    shape === "diamond"
      ? { transform: "rotate(-45deg)", textAlign: "center" as const }
      : { textAlign: "center" as const };

  return (
    <div style={common}>
      <Handle type="target" position={Position.Top} />
      <div style={inner}>
        {badge && (
          <div
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 11,
              marginBottom: 6,
              background: theme.accent,
              color: "#0b1220",
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
        )}
        <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function StartEventNode(props: NodeProps<any>) {
  const theme: DiagramTheme = props.data.theme;
  return (
    <Base
      title={props.data.label ?? "Start"}
      subtitle="Start Event"
      theme={theme}
      shape="circle"
      badge="BPMN"
    />
  );
}

export function EndEventNode(props: NodeProps<any>) {
  const theme: DiagramTheme = props.data.theme;
  return (
    <Base
      title={props.data.label ?? "End"}
      subtitle="End Event"
      theme={theme}
      shape="circle"
      badge="BPMN"
    />
  );
}

export function TaskNode(props: NodeProps<any>) {
  const theme: DiagramTheme = props.data.theme;
  return (
    <Base
      title={props.data.label ?? "Task"}
      subtitle="Activity"
      theme={theme}
      shape="rect"
      badge="TASK"
    />
  );
}

export function GatewayNode(props: NodeProps<any>) {
  const theme: DiagramTheme = props.data.theme;
  return (
    <Base
      title={props.data.label ?? "Decision"}
      subtitle="Gateway"
      theme={theme}
      shape="diamond"
      badge="XOR"
    />
  );
}
