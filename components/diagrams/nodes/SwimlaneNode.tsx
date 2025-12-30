"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { NodeProps } from "reactflow";
import { THEMES, type DiagramTheme } from "@/lib/diagrams/themes";
import type { SwimlaneData } from "@/lib/diagrams/swimlanes";
import { useDiagramEditor } from "@/components/diagrams/DiagramEditorContext";

export default function SwimlaneNode(props: NodeProps<SwimlaneData & { theme?: DiagramTheme }>) {
  const editor = useDiagramEditor();
  const theme: DiagramTheme =
    (props.data as any)?.theme ?? editor.theme ?? THEMES.find((t) => t.id === "paper") ?? THEMES[0];

  const d = props.data;
  const orientation = d.orientation;
  const color = d.color ?? "#f8fafc";
  const dividers = Math.max(0, Number(d.dividers ?? 0));
  const locked = !!d.locked;

  const [menuOpen, setMenuOpen] = useState(false);
  const [draftName, setDraftName] = useState(d.label ?? "Lane");
  const [draftDiv, setDraftDiv] = useState(String(dividers));

  useEffect(() => {
    setDraftName(d.label ?? "Lane");
    setDraftDiv(String(dividers));
  }, [d.label, dividers]);

  const stop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const dividerEls = useMemo(() => {
    if (!dividers) return null;
    const lines: React.ReactNode[] = [];
    for (let i = 1; i <= dividers; i++) {
      const pct = (i / (dividers + 1)) * 100;
      lines.push(
        <div
          key={i}
          style={
            orientation === "horizontal"
              ? { position: "absolute", left: `${pct}%`, top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.10)" }
              : { position: "absolute", top: `${pct}%`, left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.10)" }
          }
        />
      );
    }
    return lines;
  }, [dividers, orientation]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 18,
        border: `1px solid ${theme.nodeBorder}`,
        background: color,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        opacity: locked ? 0.92 : 1,
      }}
      onContextMenu={(e) => {
        stop(e);
        setMenuOpen(true);
      }}
      title="Right-click for lane options"
    >
      {/* Header chip */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 10,
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.75)",
          border: `1px solid ${theme.nodeBorder}`,
          color: theme.text,
          fontSize: 12,
          fontWeight: 900,
        }}
        onPointerDownCapture={stop}
        onMouseDownCapture={stop}
      >
        <span>{d.label}</span>
        {locked && (
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.06)",
              border: `1px solid ${theme.nodeBorder}`,
              fontWeight: 800,
            }}
          >
            Locked
          </span>
        )}
      </div>

      {dividerEls}

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 270,
            borderRadius: 18,
            border: `1px solid ${theme.nodeBorder}`,
            background: "#fff",
            padding: 12,
            boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
            zIndex: 50,
          }}
          onPointerDownCapture={stop}
          onMouseDownCapture={stop}
          onClickCapture={stop}
        >
          <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 8 }}>Lane options</div>

          <label style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>Rename</label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              borderRadius: 14,
              border: `1px solid ${theme.nodeBorder}`,
              padding: "8px 10px",
              fontSize: 12,
            }}
          />

          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>Dividers</label>
              <input
                type="number"
                min={0}
                max={12}
                value={draftDiv}
                onChange={(e) => setDraftDiv(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  borderRadius: 14,
                  border: `1px solid ${theme.nodeBorder}`,
                  padding: "8px 10px",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <button
                type="button"
                onClick={() => editor.toggleLaneLock(props.id)}
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: `1px solid ${theme.nodeBorder}`,
                  padding: "8px 10px",
                  fontSize: 12,
                  background: locked ? "#0f172a" : "#f8fafc",
                  color: locked ? "#fff" : "#0f172a",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                {locked ? "Unlock" : "Lock"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              style={{
                borderRadius: 14,
                border: `1px solid ${theme.nodeBorder}`,
                padding: "8px 10px",
                fontSize: 12,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                editor.renameLane(props.id, draftName.trim() || "Lane");
                editor.setLaneDividers(props.id, Math.max(0, Number(draftDiv || 0)));
                setMenuOpen(false);
              }}
              style={{
                borderRadius: 14,
                border: `1px solid ${theme.nodeBorder}`,
                padding: "8px 10px",
                fontSize: 12,
                background: "#0f172a",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
