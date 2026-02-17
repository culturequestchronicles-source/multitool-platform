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

function isOrgPerson(n: Node) {
  return String((n.data as any)?.kind ?? "") === "org_person" || String(n.type ?? "") === "org_person";
}

export function exportOrgMermaid(opts: { nodes: Node[]; edges: Edge[]; direction?: "TB" | "LR" }) {
  const direction = opts.direction ?? "TB";
  const people = (opts.nodes ?? []).filter(isOrgPerson);
  const edges = opts.edges ?? [];

  const decls = people.map((n) => {
    const id = safeId(n.id);
    const name = esc(String((n.data as any)?.name ?? "Employee"));
    const title = esc(String((n.data as any)?.title ?? ""));
    const dept = esc(String((n.data as any)?.department ?? ""));
    const label = dept ? `${dept}\\n${name}${title ? `\\n${title}` : ""}` : `${name}${title ? `\\n${title}` : ""}`;
    return `${id}["${label}"]`;
  });

  const lines = edges
    .filter((e) => people.some((n) => n.id === e.source) && people.some((n) => n.id === e.target))
    .map((e) => {
      const src = safeId(String(e.source));
      const tgt = safeId(String(e.target));
      const secondary = Boolean((e.data as any)?.secondary);
      const arrow = secondary ? "-.->" : "-->";
      return `${src} ${arrow} ${tgt}`;
    });

  return [`flowchart ${direction}`, ...decls, ...lines, ""].join("\n");
}

