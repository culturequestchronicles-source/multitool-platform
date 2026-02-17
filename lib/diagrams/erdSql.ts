import type { Edge, Node } from "@xyflow/react";
import type { ErdField, ErdFieldRef } from "@/lib/diagrams/erd";

function qIdent(id: string) {
  // naive Postgres-safe quoting
  const v = String(id ?? "").trim();
  return `"${v.replaceAll('"', '""')}"`;
}

function splitTopLevelComma(s: string) {
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (!inSingle && !inDouble) {
      if (ch === "(") depth++;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (ch === "," && depth === 0) {
        out.push(cur);
        cur = "";
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

export function exportPostgresDDL(nodes: Node[], edges: Edge[]) {
  const entities = nodes.filter((n) => String((n.data as any)?.kind ?? "") === "erd_entity" || String(n.type ?? "") === "erd_entity");
  const byId = new Map(entities.map((n) => [n.id, n]));

  const tables = entities.map((n) => {
    const name = String((n.data as any)?.label ?? n.id);
    const fields: ErdField[] = Array.isArray((n.data as any)?.fields) ? ((n.data as any).fields as any) : [];
    const cols = fields.map((f) => {
      const colName = qIdent(String(f.name ?? "col"));
      const type = String(f.type ?? "text") || "text";
      const nullable = f.nullable === false ? " NOT NULL" : "";
      const unique = f.unique ? " UNIQUE" : "";
      const inlinePk = f.pk ? " PRIMARY KEY" : "";
      return `  ${colName} ${type}${nullable}${unique}${inlinePk}`;
    });

    // If there is a composite PK, we add a table-level PK.
    const pkFields = fields.filter((f) => f.pk).map((f) => qIdent(String(f.name ?? ""))).filter((x) => x !== qIdent(""));
    const hasInlinePk = fields.some((f) => f.pk);
    const multiPk = pkFields.length > 1;
    const tablePk = multiPk ? `  PRIMARY KEY (${pkFields.join(", ")})` : null;

    const body = [...cols, ...(tablePk && !hasInlinePk ? [tablePk] : multiPk ? [tablePk] : [])].filter(Boolean).join(",\n");
    return `CREATE TABLE ${qIdent(name)} (\n${body}\n);`;
  });

  const fkAlters: string[] = [];
  for (const n of entities) {
    const fromTable = String((n.data as any)?.label ?? n.id);
    const fields: ErdField[] = Array.isArray((n.data as any)?.fields) ? ((n.data as any).fields as any) : [];
    for (const f of fields) {
      const ref: ErdFieldRef | undefined = (f as any).ref;
      if (!f.fk || !ref?.entityId || !ref.field) continue;
      const to = byId.get(ref.entityId);
      if (!to) continue;
      const toTable = String((to.data as any)?.label ?? to.id);
      const cname = `fk_${fromTable}_${String(f.name ?? "col")}_${toTable}_${ref.field}`.replaceAll(/[^a-zA-Z0-9_]+/g, "_").slice(0, 60);
      fkAlters.push(
        `ALTER TABLE ${qIdent(fromTable)} ADD CONSTRAINT ${qIdent(cname)} FOREIGN KEY (${qIdent(String(f.name ?? "col"))}) REFERENCES ${qIdent(
          toTable
        )} (${qIdent(String(ref.field))});`
      );
    }
  }

  // Also consider edges as relationships if field refs weren't set yet (best-effort).
  // (We don't auto-generate FK columns from edges here; that's left for a later step.)
  void edges;

  return [...tables, ...(fkAlters.length ? ["", "-- Foreign Keys", ...fkAlters] : [])].join("\n\n");
}

export function importPostgresDDL(sql: string): { nodes: Node[]; edges: Edge[]; warnings: string[] } {
  const warnings: string[] = [];
  const text = String(sql ?? "");

  // Very small, forgiving parser: CREATE TABLE name ( ... );
  const re = /create\s+table\s+("?[\w. -]+"?)\s*\(([\s\S]*?)\)\s*;?/gi;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const byName = new Map<string, string>(); // tableName -> nodeId

  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(text))) {
    const rawName = String(m[1] ?? "").trim().replaceAll(/^"+|"+$/g, "");
    const body = String(m[2] ?? "");
    const parts = splitTopLevelComma(body);

    const fields: ErdField[] = [];
    const pkCols: string[] = [];
    const fkConstraints: Array<{ col: string; refTable: string; refCol: string }> = [];

    for (const p of parts) {
      const line = p.trim().replace(/\s+/g, " ");
      if (!line) continue;

      const lower = line.toLowerCase();
      if (lower.startsWith("primary key")) {
        const cols = line.match(/\(([^)]+)\)/)?.[1] ?? "";
        pkCols.push(...cols.split(",").map((c) => c.trim().replaceAll(/^"+|"+$/g, "")));
        continue;
      }

      if (lower.includes("foreign key")) {
        const col = line.match(/foreign key\s*\(([^)]+)\)/i)?.[1]?.split(",")?.[0]?.trim() ?? "";
        const refTable = (line.match(/references\s+("?[\w. -]+"?)/i)?.[1] ?? "").replaceAll(/^"+|"+$/g, "");
        const refCol = (line.match(/references\s+("?[\w. -]+"?)\s*\(([^)]+)\)/i)?.[2] ?? "").split(",")[0]?.trim() ?? "";
        if (col && refTable && refCol) fkConstraints.push({ col: col.replaceAll(/^"+|"+$/g, ""), refTable, refCol: refCol.replaceAll(/^"+|"+$/g, "") });
        continue;
      }

      // column def: name type ...
      // Avoid named capture groups so we can keep TS target at ES2017.
      // 1=name, 2=type, 3=rest
      const mm = line.match(/^"?([\w -]+)"?\s+([\w]+(?:\s*\([^)]*\))?(?:\s+[\w]+(?:\s*\([^)]*\))?)?)([\s\S]*)$/);
      const name = mm?.[1]?.trim();
      const type = mm?.[2]?.trim() ?? "text";
      const rest = mm?.[3]?.toLowerCase() ?? "";
      if (!name) continue;

      const nullable = !rest.includes("not null");
      const unique = rest.includes("unique");
      const inlinePk = rest.includes("primary key");
      const inlineRefTable = line.match(/references\s+("?[\w. -]+"?)/i)?.[1];
      const inlineRefCol = line.match(/references\s+("?[\w. -]+"?)\s*\(([^)]+)\)/i)?.[2]?.split(",")?.[0];

      fields.push({
        name,
        type,
        nullable,
        unique,
        pk: inlinePk,
        fk: Boolean(inlineRefTable && inlineRefCol),
        ref: inlineRefTable && inlineRefCol ? { entityId: inlineRefTable.replaceAll(/^"+|"+$/g, ""), field: inlineRefCol.replaceAll(/^"+|"+$/g, "").trim() } : undefined,
      });
    }

    // Apply table PKs
    if (pkCols.length) {
      for (const c of pkCols) {
        const f = fields.find((x) => String(x.name).toLowerCase() === String(c).toLowerCase());
        if (f) f.pk = true;
      }
    }

    const id = `erd_ent_${idx++}_${rawName.replaceAll(/[^a-zA-Z0-9_]+/g, "_")}`;
    byName.set(rawName, id);

    nodes.push({
      id,
      type: "erd_entity",
      position: { x: 160 + (idx % 4) * 420, y: 160 + Math.floor(idx / 4) * 320 },
      data: { kind: "erd_entity", label: rawName, weak: false, fields, size: { w: 320, h: 240 } },
      style: { zIndex: 30 },
    } as any);

    // add fk constraints after we have table ids
    for (const fk of fkConstraints) {
      const f = fields.find((x) => String(x.name).toLowerCase() === String(fk.col).toLowerCase());
      if (f) {
        f.fk = true;
        f.ref = { entityId: fk.refTable, field: fk.refCol };
      }
    }
  }

  // Resolve ref.entityId table names -> node ids
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    const fields: ErdField[] = Array.isArray((n.data as any)?.fields) ? ((n.data as any).fields as any) : [];
    for (const f of fields) {
      const ref = (f as any).ref as ErdFieldRef | undefined;
      if (!ref?.entityId) continue;
      const refName = ref.entityId;
      const resolved = byName.get(refName) ?? null;
      if (!resolved) {
        warnings.push(`Could not resolve reference table: ${refName}`);
        continue;
      }
      (f as any).ref = { entityId: resolved, field: ref.field };

      // Create an edge for this FK
      const edgeId = `e_${n.id}_${String(f.name ?? "col")}_${resolved}_${ref.field}`;
      edges.push({
        id: edgeId,
        source: n.id,
        target: resolved,
        type: "erd",
        data: { kind: "erd_relation", notation: "crows_foot", sourceCardinality: "1..N", targetCardinality: "1..1", label: "" },
        style: { stroke: "#111827", strokeWidth: 2.2 },
      } as any);
    }
  }

  void byId;
  return { nodes, edges, warnings };
}
