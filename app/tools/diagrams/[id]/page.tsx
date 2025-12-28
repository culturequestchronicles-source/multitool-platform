import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import DiagramEditorClient from "@/components/diagrams/DiagramEditorClient";

export const dynamic = "force-dynamic";

type ParentRef = { diagramId: string; subprocessNodeId?: string };

type Crumb = { id: string; name: string };

async function buildBreadcrumb(supabase: any, diagram: any): Promise<Crumb[]> {
  const crumbs: Crumb[] = [{ id: diagram.id, name: diagram.name ?? "Untitled" }];

  let current = diagram as any;
  let guard = 0;

  while (guard < 8) {
    guard++;
    const parent = (current?.standards_profile as any)?.parent as ParentRef | undefined;
    if (!parent?.diagramId) break;

    const { data: p, error } = await supabase
      .from("diagrams")
      .select("id, name, standards_profile")
      .eq("id", parent.diagramId)
      .single();

    if (error || !p) break;

    crumbs.push({ id: p.id, name: p.name ?? "Untitled" });
    current = p;
  }

  // we collected current->parent->... so reverse
  return crumbs.reverse();
}

export default async function DiagramEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return (
      <div className="p-6">
        <p className="text-sm">
          Please{" "}
          <Link className="underline" href="/login">
            sign in
          </Link>{" "}
          to edit diagrams.
        </p>
      </div>
    );
  }

  const { data: diagram, error } = await supabase
    .from("diagrams")
    .select("id, name, diagram_type, standards_profile, current_snapshot, updated_at")
    .eq("id", id)
    .single();

  if (error || !diagram) {
    return (
      <div className="p-6">
        <div className="text-sm font-medium">Diagram not found.</div>
        <div className="mt-2 text-xs text-gray-600">
          {error?.message
            ? `Supabase: ${error.message}`
            : "The diagram may have been deleted or you may not have access."}
        </div>
        <div className="mt-4">
          <Link className="underline text-sm" href="/tools/diagrams">
            ← Back to diagrams
          </Link>
        </div>
      </div>
    );
  }

  const parent = (diagram.standards_profile as any)?.parent as ParentRef | undefined;

  const focus =
    parent?.subprocessNodeId && parent.subprocessNodeId.trim().length
      ? `?focus=${encodeURIComponent(parent.subprocessNodeId)}`
      : "";

  const crumbs = await buildBreadcrumb(supabase, diagram);

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="border-b bg-white px-4 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={c.id} className="flex items-center gap-2">
                {!isLast ? (
                  <Link className="underline" href={`/tools/diagrams/${c.id}`}>
                    {c.name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">{c.name}</span>
                )}
                {!isLast ? <span>→</span> : null}
              </span>
            );
          })}
        </div>
      </div>

      {/* Back-to-parent bar (only shows for child diagrams) */}
      {parent?.diagramId ? (
        <div className="border-b bg-white px-4 py-2 text-sm flex items-center justify-between">
          <div className="text-xs text-gray-600">
            This is a child process
            {parent.subprocessNodeId ? (
              <>
                {" "}
                of subprocess <span className="font-mono">{parent.subprocessNodeId}</span>
              </>
            ) : null}
          </div>

          <Link
            href={`/tools/diagrams/${parent.diagramId}${focus}`}
            className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
          >
            ← Back to parent
          </Link>
        </div>
      ) : null}

      <DiagramEditorClient diagram={diagram} />
    </div>
  );
}
