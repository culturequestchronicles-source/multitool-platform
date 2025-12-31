import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/**
 * URL query -> DB enum mapping.
 * Your DB expects:
 *  business_process_flow | swimlane | system_architecture | org_chart | decision_flow
 * (You can extend later as you add schema support)
 */
function mapTypeToDb(diagramType: string | undefined) {
  const t = (diagramType ?? "").toLowerCase().trim();

  if (t === "bpmn" || t === "business-process" || t === "business_process_flow") return "business_process_flow";
  if (t === "swimlanes" || t === "swimlane") return "swimlane";
  if (t === "system-architecture" || t === "system_architecture") return "system_architecture";
  if (t === "org-chart" || t === "org_chart") return "org_chart";
  if (t === "decision-flow" || t === "decision_flow") return "decision_flow";

  // For now, default to BPMN since that’s fully implemented
  return "business_process_flow";
}

function defaultNameFor(dbType: string) {
  switch (dbType) {
    case "swimlane":
      return "New Swimlanes Diagram";
    case "system_architecture":
      return "New System Architecture";
    case "org_chart":
      return "New Org Chart";
    case "decision_flow":
      return "New Decision Flow";
    case "business_process_flow":
    default:
      return "New BPMN Diagram";
  }
}

async function getBaseUrl() {
  // Next.js 16.1.x: headers() is async
  const h = await headers();

  // Prefer forwarded headers on Vercel / proxies
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";

  return `${proto}://${host}`;
}

export default async function NewDiagramPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const typeParam = first(sp.type);
  const nameParam = first(sp.name);

  const baseUrl = await getBaseUrl();
  const nextDest = `/tools/diagrams/new?type=${encodeURIComponent(typeParam ?? "bpmn")}`;

  const supabase = await supabaseServer();

  // ✅ Auth gate: if not logged in, redirect to login with next
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    redirect(`/login?next=${encodeURIComponent(nextDest)}`);
  }

  const dbType = mapTypeToDb(typeParam);
  const name = (nameParam && nameParam.trim().length ? nameParam.trim() : defaultNameFor(dbType)).slice(0, 120);

  // ✅ Create diagram directly (no API call needed)
  const { data: created, error } = await supabase
    .from("diagrams")
    .insert({
      owner_id: auth.user.id,
      name,
      diagram_type: dbType,
      layout: "freeform",
      standards_profile: {},
      current_snapshot: {}, // DiagramEditorClient will initialize default snapshot if empty
    })
    .select("id")
    .single();

  if (error || !created?.id) {
    // Fail safely (show text, don't crash build)
    return (
      <div className="p-6">
        <div className="text-sm font-semibold text-red-700">Failed to create diagram</div>
        <div className="mt-2 text-xs text-gray-600">
          {error?.message ?? "Unknown error"}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Base URL detected: {baseUrl}
        </div>
      </div>
    );
  }

  // ✅ Redirect to the actual UUID page (fixes invalid uuid:new)
  redirect(`/tools/diagrams/${created.id}`);
}
