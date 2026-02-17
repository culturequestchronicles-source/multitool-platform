import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function SwimlaneCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ Keep swimlanes URL working, but route everything to one editor
  redirect(`/tools/diagrams/${encodeURIComponent(id)}`);
}
