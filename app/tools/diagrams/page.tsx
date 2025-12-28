import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import NewDiagramButton from "./NewDiagramButton";

export const dynamic = "force-dynamic";

export default async function DiagramsListPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-sm">
          Please{" "}
          <Link className="underline" href="/login">
            sign in
          </Link>{" "}
          to use diagrams.
        </p>
      </div>
    );
  }

  const { data: diagrams, error } = await supabase
    .from("diagrams")
    .select("id,name,diagram_type,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Diagrams</h1>

        {/* ✅ New modal that lets users choose 1 of 5 diagram types */}
        <NewDiagramButton />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {(diagrams ?? []).map((d) => (
          <Link
            key={d.id}
            href={`/tools/diagrams/${d.id}`}
            className="rounded-2xl border bg-white p-4 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-gray-600">{d.diagram_type}</div>
              </div>
              <div className="text-xs text-gray-500">
                {d.updated_at ? new Date(d.updated_at).toLocaleString() : ""}
              </div>
            </div>
          </Link>
        ))}

        {(diagrams ?? []).length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            No diagrams yet. Click <b>New Diagram</b>.
          </div>
        )}
      </div>
    </div>
  );
}
