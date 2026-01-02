export type BpmnKind =
  // BPMN core
  | "start_event"
  | "end_event"
  | "intermediate_message"
  | "intermediate_timer"
  | "task"
  | "subprocess"
  | "gateway_xor_split"
  | "gateway_xor_merge"
  // Enterprise symbols (flowchart + BPMN hybrid)
  | "data_io"
  | "document"
  | "database"
  | "connector"
  | "fork_join"
  | "delay"
  | "loop_start"
  | "loop_end";

export type BpmnNodeData = {
  kind: BpmnKind;
  label: string;

  // collapse / nested
  collapsed?: boolean;
  childDiagramId?: string | null;

  // metadata
  meta?: {
    actors?: string; // comma separated
    applications?: string;
    businessCapability?: string;
    risksAndControls?: string;
    avgHandlingTimeMin?: number | null;
    avgCycleTimeMin?: number | null;

    // optional color override
    color?: string; // "#RRGGBB"
  };
};

export function validateConnection(args: {
  sourceKind?: BpmnKind;
  targetKind?: BpmnKind;
  sourceOutgoingCount: number;
  targetIncomingCount: number;
}): { ok: true } | { ok: false; reason: string } {
  const { sourceKind, targetKind, sourceOutgoingCount, targetIncomingCount } = args;

  if (!sourceKind || !targetKind) return { ok: false, reason: "Missing node type" };

  // Start events: no incoming
  if (targetKind === "start_event") {
    return { ok: false, reason: "Start Event cannot have incoming flows." };
  }

  // End events: no outgoing
  if (sourceKind === "end_event") {
    return { ok: false, reason: "End Event cannot have outgoing flows." };
  }

  // Intermediate events: 1 incoming, 1 outgoing
  if (targetKind === "intermediate_message" || targetKind === "intermediate_timer") {
    if (targetIncomingCount >= 1) {
      return { ok: false, reason: "Intermediate Event should have only 1 incoming flow." };
    }
  }
  if (sourceKind === "intermediate_message" || sourceKind === "intermediate_timer") {
    if (sourceOutgoingCount >= 1) {
      return { ok: false, reason: "Intermediate Event should have only 1 outgoing flow." };
    }
  }

  // XOR split: 1 incoming
  if (targetKind === "gateway_xor_split") {
    if (targetIncomingCount >= 1) {
      return { ok: false, reason: "XOR Split should have only 1 incoming flow." };
    }
  }

  // XOR merge: 1 outgoing
  if (sourceKind === "gateway_xor_merge") {
    if (sourceOutgoingCount >= 1) {
      return { ok: false, reason: "XOR Merge should have only 1 outgoing flow." };
    }
  }

  // Tasks / subprocess / enterprise nodes: allow, but keep sane
  const activityLike: BpmnKind[] = [
    "task",
    "subprocess",
    "data_io",
    "document",
    "database",
    "connector",
    "fork_join",
    "delay",
    "loop_start",
    "loop_end",
  ];

  if (activityLike.includes(targetKind) && targetIncomingCount >= 6) {
    return { ok: false, reason: "Too many incoming flows to this step." };
  }

  return { ok: true };
}
