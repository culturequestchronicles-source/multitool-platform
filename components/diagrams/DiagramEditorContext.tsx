"use client";

import React from "react";
import type { DiagramTheme } from "@/lib/diagrams/themes";
import type { LaneOrientation } from "@/lib/diagrams/swimlanes";

export type EditorActions = {
  theme: DiagramTheme;

  creatingChildFor: string | null;
  createChildForNode: (nodeId: string) => void;
  openChild: (childId: string) => void;

  renameNode: (nodeId: string, label: string) => void;
  toggleCollapsed: (nodeId: string) => void;

  // ✅ swimlane container
  upsertSwimlanes: (orientation: LaneOrientation) => void;
  aiGenerateSwimlanes: () => void;

  // ✅ swimlane header title (missing ранее)
  renameSwimlaneHeader: (laneNodeId: string, label: string) => void;

  // ✅ lane edits (inside container)
  renameLane: (laneNodeId: string, laneIndex: number, name: string) => void;
  setLaneDividers: (laneNodeId: string, dividers: number) => void;
  setLaneDividerPositions: (laneNodeId: string, positions: number[]) => void;
  toggleLaneLock: (laneNodeId: string) => void;
  resizeLaneContainer: (laneNodeId: string, width: number, height: number) => void;

  // ✅ lanes count (buttons in swimlane header)
  addLane: (laneNodeId: string) => void;
  removeLane: (laneNodeId: string) => void;

  openAiFullProcessModal: () => void;
};

const Ctx = React.createContext<EditorActions | null>(null);

export function useDiagramEditor() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useDiagramEditor must be used within DiagramEditorProvider");
  return v;
}

export function DiagramEditorProvider({
  value,
  children,
}: {
  value: EditorActions;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
