"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setEditKey, upsertRecent } from "@/lib/diagrams/localRecents";

function mapTypeToDiagramType(type: string | null) {
  const t = String(type ?? "").trim().toLowerCase();

  // ✅ normalize variants users might pass
  if (t === "swimlanes" || t === "swimlane") return "swimlane";
  if (t === "bpmn") return "bpmn";
  if (t === "flow-chart" || t === "flow_chart") return "flowchart";
  if (t === "data-architecture" || t === "data_architecture") return "data_architecture";

  // keep whatever you support server-side
  return t || "bpmn";
}

function defaultNameFor(type: string) {
  switch (type) {
    case "swimlane":
      return "Swimlane Diagram";
    case "bpmn":
      return "BPMN Diagram";
    case "erd":
      return "Entity Relationship Diagram";
    case "flowchart":
      return "Flow Chart";
    case "system-architecture":
    case "system_architecture":
      return "System Architecture Diagram";
    case "data-architecture":
    case "data_architecture":
      return "Data Architecture Diagram";
    default:
      return "Untitled Diagram";
  }
}

export default function NewDiagramPage() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const typeParam = search.get("type");
      const diagram_type = mapTypeToDiagramType(typeParam);
      const name = defaultNameFor(diagram_type);

      try {
        const res = await fetch("/api/diagrams/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diagram_type, name }),
        });

        const data = await res.json().catch(() => null);
        if (cancelled) return;

        if (!res.ok || !data?.ok || !data?.id) {
          const parts: string[] = [];
          if (data?.error) parts.push(String(data.error));
          if (data?.cause) parts.push(`Cause: ${String(data.cause)}`);
          if (data?.code) parts.push(`Code: ${String(data.code)}`);
          if (data?.details) parts.push(`Details: ${String(data.details)}`);
          if (data?.hint) parts.push(`Hint: ${String(data.hint)}`);
          alert(parts.filter(Boolean).join("\n") || "Failed to create diagram");
          router.replace("/tools/diagrams");
          return;
        }

        const id = String(data.id);

        // ✅ store edit key so editor is NOT read-only
        const editKey = data?.editKey ?? data?.edit_key ?? null;
        if (editKey) setEditKey(id, String(editKey));

        // ✅ add to local recents so /tools/diagrams shows it
        upsertRecent({ id, name, updatedAt: Date.now() });

        router.replace(`/tools/diagrams/${encodeURIComponent(id)}`);
      } catch (e: any) {
        if (cancelled) return;
        alert(e?.message ?? "Failed to create diagram");
        router.replace("/tools/diagrams");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, search]);

  return <div className="p-6 text-sm text-gray-700">Creating a new diagram…</div>;
}
