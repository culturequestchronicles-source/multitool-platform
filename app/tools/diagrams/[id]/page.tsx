import { supabaseAdmin } from "@/lib/supabase/admin";
import DiagramEditorClient from "@/components/diagrams/DiagramEditorClient";

export const runtime = "nodejs";

export default async function DiagramEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = supabaseAdmin();
  const { data: diagram, error } = await supabase
    .from("diagrams")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !diagram) {
    return (
      <div className="p-6 text-sm text-gray-700">
        Diagram not found (or you don’t have access).
      </div>
    );
  }

  return <DiagramEditorClient diagram={diagram} />;
}
