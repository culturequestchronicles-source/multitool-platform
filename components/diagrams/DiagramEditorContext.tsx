"use client";

import React from "react";
import type { DiagramTheme } from "@/lib/diagrams/themes";
import type { Node, Edge } from "reactflow";
import type { LaneOrientation } from "@/lib/diagrams/swimlanes";

export type EditorActions = {
  theme: DiagramTheme;

  // subprocess drilldown
  creatingChildFor: string | null;
  createChildForNode: (nodeId: string) => void;
  openChild: (childId: string) => void;

  // node edits
  renameNode: (nodeId: string, label: string) => void;
  toggleCollapsed: (nodeId: string) => void;

  // swimlanes
  upsertSwimlanes: (orientation: LaneOrientation) => void;
  aiGenerateSwimlanes: () => void;

  // lane actions
  renameLane: (laneId: string, name: string) => void;
  setLaneDividers: (laneId: string, dividers: number) => void;
  toggleLaneLock: (laneId: string) => void;

  // AI full process modal
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
