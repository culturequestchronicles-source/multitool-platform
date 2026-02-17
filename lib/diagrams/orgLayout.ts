import type { Node } from "@xyflow/react";
import type { OrgChartType } from "@/lib/diagrams/orgChartStore";

function isOrgPerson(n: Node) {
  return String((n.data as any)?.kind ?? "") === "org_person" || String(n.type ?? "") === "org_person";
}

function isOrgGroup(n: Node) {
  return String((n.data as any)?.kind ?? "") === "org_group" || String(n.type ?? "") === "org_group";
}

function sizeOf(n: Node) {
  const s = (n.data as any)?.size;
  const w = Number(s?.w ?? (isOrgGroup(n) ? 360 : 260));
  const h = Number(s?.h ?? (isOrgGroup(n) ? 44 : 120));
  return { w, h };
}

type TreeNode = {
  id: string;
  children: TreeNode[];
};

function buildTree(nodes: Node[]) {
  const people = nodes.filter(isOrgPerson);
  const byId = new Map(people.map((n) => [n.id, n]));

  const childrenByParent = new Map<string, string[]>();
  const roots: string[] = [];

  for (const n of people) {
    const pid = String((n.data as any)?.parentNodeId ?? "").trim();
    if (pid && byId.has(pid)) {
      const arr = childrenByParent.get(pid) ?? [];
      arr.push(n.id);
      childrenByParent.set(pid, arr);
    } else {
      roots.push(n.id);
    }
  }

  const make = (id: string, guard = 0): TreeNode => {
    if (guard > 200) return { id, children: [] };
    const childIds = childrenByParent.get(id) ?? [];
    return { id, children: childIds.map((c) => make(c, guard + 1)) };
  };

  return roots.map((r) => make(r));
}

function layoutForestTopDown(opts: {
  nodes: Node[];
  startX: number;
  startY: number;
  xGap: number;
  yGap: number;
}) {
  const byId = new Map(opts.nodes.map((n) => [n.id, n]));
  const trees = buildTree(opts.nodes);

  const positions = new Map<string, { x: number; y: number }>();
  const subtreeWidth = new Map<string, number>();

  const widthFor = (id: string) => sizeOf(byId.get(id) as Node).w;

  const compute = (t: TreeNode): number => {
    if (!t.children.length) {
      const w = widthFor(t.id);
      subtreeWidth.set(t.id, w);
      return w;
    }
    const childWidths = t.children.map(compute);
    const total =
      childWidths.reduce((a, b) => a + b, 0) + opts.xGap * Math.max(0, t.children.length - 1);
    const w = Math.max(widthFor(t.id), total);
    subtreeWidth.set(t.id, w);
    return w;
  };

  trees.forEach(compute);

  const place = (t: TreeNode, left: number, top: number) => {
    const node = byId.get(t.id);
    if (!node) return;
    const w = widthFor(t.id);
    const totalW = subtreeWidth.get(t.id) ?? w;
    const x = left + (totalW - w) / 2;
    positions.set(t.id, { x, y: top });

    let childLeft = left;
    for (const c of t.children) {
      const cw = subtreeWidth.get(c.id) ?? widthFor(c.id);
      place(c, childLeft, top + sizeOf(node).h + opts.yGap);
      childLeft += cw + opts.xGap;
    }
  };

  let cursorX = opts.startX;
  for (const t of trees) {
    const w = subtreeWidth.get(t.id) ?? widthFor(t.id);
    place(t, cursorX, opts.startY);
    cursorX += w + opts.xGap * 2;
  }

  return positions;
}

export function autoLayoutOrg(nodes: Node[], chartType: OrgChartType) {
  const orgNodes = nodes.filter((n) => isOrgPerson(n) || isOrgGroup(n));
  const others = nodes.filter((n) => !(isOrgPerson(n) || isOrgGroup(n)));

  if (!orgNodes.length) return nodes;

  const startX = 120;
  const startY = 120;
  const xGap = 70;
  const yGap = 70;

  const applyPositions = (pos: Map<string, { x: number; y: number }>, extraYOffset = 0) => {
    return orgNodes.map((n) => {
      const p = pos.get(n.id);
      if (!p) return n;
      return { ...n, position: { x: Math.round(p.x), y: Math.round(p.y + extraYOffset) } };
    });
  };

  if (chartType === "divisional") {
    // Group people by division, then layout each division separately as a top-down forest.
    const people = orgNodes.filter(isOrgPerson);
    const byDivision = new Map<string, Node[]>();

    for (const p of people) {
      const div = String((p.data as any)?.division ?? "").trim() || "Division";
      const arr = byDivision.get(div) ?? [];
      arr.push(p);
      byDivision.set(div, arr);
    }

    let cursorX = startX;
    const placed: Node[] = [];
    const groupNodes = orgNodes.filter(isOrgGroup);

    for (const [div, divPeople] of byDivision.entries()) {
      const pos = layoutForestTopDown({ nodes: divPeople, startX: cursorX, startY: startY + 60, xGap, yGap });
      const maxX = Math.max(...Array.from(pos.values()).map((p) => p.x), cursorX);
      const divWidth = Math.max(520, maxX - cursorX + 520);

      // Create a division header node (org_group) if one doesn't exist for this division label.
      const headerId = `org_div_${div.replaceAll(/[^a-zA-Z0-9_]/g, "_")}`;
      const hasHeader = groupNodes.some((g) => g.id === headerId);
      if (!hasHeader) {
        placed.push({
          id: headerId,
          type: "org_group",
          position: { x: cursorX, y: startY },
          data: { kind: "org_group", label: div, color: "#0f172a", size: { w: Math.round(divWidth), h: 44 } },
          style: { zIndex: 10 },
        } as any);
      }

      placed.push(...applyPositions(pos));
      cursorX += divWidth + 120;
    }

    // Keep existing group nodes that aren't auto-created division headers.
    const keepGroups = groupNodes.filter((g) => !String(g.id).startsWith("org_div_"));
    return [...placed, ...keepGroups, ...others];
  }

  if (chartType === "flat") {
    // Flat: put "core" on top row, "staff" on second row. If unspecified, treat root as core and rest as staff.
    const people = orgNodes.filter(isOrgPerson);
    const core = people.filter((p) => String((p.data as any)?.group ?? "") === "core");
    const staff = people.filter((p) => String((p.data as any)?.group ?? "") === "staff");

    const unlabeled = people.filter((p) => !core.includes(p) && !staff.includes(p));
    const unlabeledRoots = unlabeled.filter((p) => !String((p.data as any)?.parentNodeId ?? "").trim());

    const coreFinal = core.length ? core : unlabeledRoots.slice(0, 1);
    const staffFinal = staff.length ? staff : unlabeled.filter((p) => !coreFinal.includes(p));

    const row = (arr: Node[], y: number) => {
      let x = startX;
      return arr.map((n) => {
        const { w } = sizeOf(n);
        const placed = { ...n, position: { x, y } };
        x += w + 70;
        return placed;
      });
    };

    return [...row(coreFinal, startY), ...row(staffFinal, startY + 200), ...orgNodes.filter(isOrgGroup), ...others];
  }

  // functional + matrix fallback: use primary manager tree for layout
  const pos = layoutForestTopDown({ nodes: orgNodes.filter(isOrgPerson), startX, startY, xGap, yGap });
  const placedPeople = applyPositions(pos);
  return [...placedPeople, ...orgNodes.filter(isOrgGroup), ...others];
}

