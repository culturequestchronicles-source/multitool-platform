export type BpmnKind =
  | "start_event"
  | "end_event"
  | "intermediate_message"
  | "intermediate_timer"
  | "task"
  | "subprocess"
  | "gateway_xor_split"
  | "gateway_xor_merge";

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
  };
};

// Returns {ok:false, reason:"..."} if invalid
export function validateConnection(args: {
  sourceKind?: BpmnKind;
  targetKind?: BpmnKind;
  sourceOutgoingCount: number;
  targetIncomingCount: number;
}): { ok: true } | { ok: false; reason: string } {
  const { sourceKind, targetKind, sourceOutgoingCount, targetIncomingCount } = args;

  if (!sourceKind || !targetKind) return { ok: false, reason: "Missing node type" };

  // Start events: no incoming (handled by target rule), outgoing allowed
  if (targetKind === "start_event") {
    return { ok: false, reason: "Start Event cannot have incoming flows." };
  }

  // End events: no outgoing
  if (sourceKind === "end_event") {
    return { ok: false, reason: "End Event cannot have outgoing flows." };
  }

  // Intermediate events: must have one incoming and one outgoing (soft-enforced on connect)
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

  // Tasks/Subprocess: typically one incoming/outgoing; allow multiple but keep it sane
  if ((targetKind === "task" || targetKind === "subprocess") && targetIncomingCount >= 4) {
    return { ok: false, reason: "Too many incoming flows to an activity." };
  }

  // XOR split: usually 1 incoming, 2+ outgoing
  if (targetKind === "gateway_xor_split") {
    if (targetIncomingCount >= 1) {
      return { ok: false, reason: "XOR Split should have only 1 incoming flow." };
    }
  }
  if (sourceKind === "gateway_xor_split") {
    // allow many outgoing
    // but disallow 0? can't enforce here
  }

  // XOR merge: usually 2+ incoming, 1 outgoing
  if (sourceKind === "gateway_xor_merge") {
    if (sourceOutgoingCount >= 1) {
      return { ok: false, reason: "XOR Merge should have only 1 outgoing flow." };
    }
  }
  // merge can have many incoming, so no limit on target incoming

  // End: should have incoming, but can't enforce on connect.

  return { ok: true };
}
