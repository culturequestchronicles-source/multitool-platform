import { NextResponse } from "next/server";

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function splitActors(v: any): string[] {
  if (!v) return [];
  if (typeof v !== "string") return [];
  return v
    .split(/[,\n;]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

const COLORS = ["#E3F2FD", "#E8F5E9", "#FFFDE7", "#FCE4EC", "#F3E5F5", "#E0F2F1"];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const nodes = (body?.nodes ?? []) as Array<any>;

    // Heuristic: lanes = unique actors from meta.actors, else fallback
    const actorPool = uniq(
      nodes.flatMap((n) => splitActors(n?.meta?.actors))
    );

    const laneLabels =
      actorPool.length > 0
        ? actorPool.slice(0, 8)
        : ["Customer", "Operations", "Finance"];

    const lanes = laneLabels.map((label, i) => ({
      label,
      color: COLORS[i % COLORS.length],
      orientation: "horizontal" as const,
    }));

    // Assign each node to a lane by matching its actors text (or fallback to first)
    const assignments: Record<string, string> = {};
    for (const n of nodes) {
      const a = splitActors(n?.meta?.actors);
      const hit = a.find((x) => laneLabels.includes(x));
      assignments[n.id] = hit ?? laneLabels[0];
    }

    return NextResponse.json({ lanes, assignments });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "AI swimlanes error" },
      { status: 500 }
    );
  }
}
