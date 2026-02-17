import type { Edge, Node } from "@xyflow/react";

function safeId(id: string) {
  return String(id || "")
    .replaceAll(/[^a-zA-Z0-9_]/g, "_")
    .replaceAll(/_+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

function esc(s: string) {
  return String(s ?? "").replaceAll('"', '\\"');
}

function isArchNode(n: Node) {
  return String((n.data as any)?.kind ?? "") === "architecture" || String(n.type ?? "") === "architecture";
}

export function exportArchitectureMermaid(opts: { nodes: Node[]; edges: Edge[]; direction: "LR" | "TB" }) {
  const dir = opts.direction === "LR" ? "LR" : "TB";
  const nodes = (opts.nodes ?? []).filter(isArchNode);
  const edges = opts.edges ?? [];

  const decls = nodes.map((n) => {
    const id = safeId(n.id);
    const label = esc(String((n.data as any)?.label ?? "Component"));
    const kind = String((n.data as any)?.nodeKind ?? "");
    const sub = String((n.data as any)?.subtitle ?? "").trim();
    const text = sub ? `${label}\\n${esc(sub)}\\n(${esc(kind)})` : `${label}\\n(${esc(kind)})`;
    return `${id}["${text}"]`;
  });

  const lines = edges
    .filter((e) => nodes.some((n) => n.id === e.source) && nodes.some((n) => n.id === e.target))
    .map((e) => {
      const src = safeId(String(e.source));
      const tgt = safeId(String(e.target));
      const label = String((e.data as any)?.label ?? "").trim();
      const async = Boolean((e.data as any)?.async);
      const arrow = async ? "-.->" : "-->";
      const withLabel = label ? `${arrow}|${esc(label)}|` : arrow;
      return `${src} ${withLabel} ${tgt}`;
    });

  return [`flowchart ${dir}`, ...decls, ...lines, ""].join("\n");
}

