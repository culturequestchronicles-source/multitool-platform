import type { Edge, Node } from "@xyflow/react";

function safeId(id: string) {
  return String(id || "")
    .replaceAll(/[^a-zA-Z0-9_]/g, "_")
    .replaceAll(/_+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

function escLabel(s: string) {
  return String(s ?? "").replaceAll('"', '\\"');
}

function nodeDecl(n: Node) {
  const id = safeId(n.id);
  const kind = String((n.data as any)?.kind ?? "process");
  const label = escLabel(String((n.data as any)?.label ?? kind));

  const k = kind.toLowerCase();
  const isDecision = k.includes("decision");
  const isStartEnd = k.includes("start") || k.includes("end");
  const isUserInput = k.includes("user_input") || k.includes("manual_input");
  const isDatabase = k.includes("database");
  const isDocuments = k.includes("documents") || k.includes("document_stack");
  const isError = k.includes("error") || k.includes("timeout") || k.includes("cancel") || k.includes("failure");

  if (isDecision) return `${id}{"${label}"}`;
  if (isStartEnd) return `${id}(("${label}"))`;
  if (isDatabase) return `${id}[("${label}")]`;
  if (isUserInput) return `${id}[/"${label}"/]`;
  if (isDocuments) return `${id}[[\"${label}\"]]`;
  if (isError) return `${id}["${label}"]`;
  return `${id}["${label}"]`;
}

function nodeClass(n: Node) {
  const kind = String((n.data as any)?.kind ?? "process").toLowerCase();
  if (kind.includes("decision")) return "fcDecision";
  if (kind.includes("async") || kind.includes("callback") || kind.includes("api_call")) return "fcAsync";
  if (kind.includes("error") || kind.includes("timeout") || kind.includes("cancel") || kind.includes("failure")) return "fcError";
  if (kind.includes("data") || kind.includes("parallelogram") || kind.includes("io")) return "fcData";
  return "fcProcess";
}

export function exportFlowchartMermaid(opts: {
  nodes: Node[];
  edges: Edge[];
  direction: "TB" | "LR";
  includeLegend?: boolean;
}) {
  const direction = opts.direction ?? "TB";
  const nodes = opts.nodes ?? [];
  const edges = opts.edges ?? [];

  const decls = nodes.map(nodeDecl);
  const classes = nodes.map((n) => `class ${safeId(n.id)} ${nodeClass(n)};`);

  const edgeLines = edges.map((e) => {
    const src = safeId(String(e.source));
    const tgt = safeId(String(e.target));
    const label = String((e.data as any)?.label ?? "").trim();
    const isAsync = Boolean((e.data as any)?.async);
    const arrow = isAsync ? "-.->" : "-->";
    const withLabel = label ? `${arrow}|${escLabel(label)}|` : arrow;
    return `${src} ${withLabel} ${tgt}`;
  });

  const legend = opts.includeLegend
    ? [
        "subgraph Legend",
        "  L1[\"Process\"]",
        "  L2{\"Decision\"}",
        "  L3[\"Async/Callback\"]",
        "  L4[\"Error/Timeout\"]",
        "  L5[\"Data / I/O\"]",
        "end",
        "class L1 fcProcess;",
        "class L2 fcDecision;",
        "class L3 fcAsync;",
        "class L4 fcError;",
        "class L5 fcData;",
      ]
    : [];

  return [
    `flowchart ${direction}`,
    ...decls,
    ...edgeLines,
    "",
    "%% Styling",
    "classDef fcProcess fill:#e2e8f0,stroke:#0f172a,stroke-width:2px,color:#0f172a;",
    "classDef fcDecision fill:#fef08a,stroke:#0f172a,stroke-width:2px,color:#0f172a;",
    "classDef fcAsync fill:#fbcfe8,stroke:#0f172a,stroke-width:2px,color:#0f172a,stroke-dasharray:6 4;",
    "classDef fcError fill:#fecaca,stroke:#0f172a,stroke-width:2px,color:#0f172a;",
    "classDef fcData fill:#cffafe,stroke:#0f172a,stroke-width:2px,color:#0f172a;",
    ...classes,
    ...(legend.length ? ["", ...legend] : []),
    "",
  ].join("\n");
}

