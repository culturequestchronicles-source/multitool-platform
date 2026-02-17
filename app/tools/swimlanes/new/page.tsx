"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setEditKey, upsertRecent } from "@/lib/diagrams/localRecents";

export default function NewSwimlanePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/diagrams/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diagram_type: "swimlane",
            name: "Swimlane Diagram",
          }),
        });

        const data = await res.json().catch(() => null);

        if (cancelled) return;

        if (!res.ok || !data?.ok || !data?.id) {
          alert(data?.error ?? "Failed to create swimlane diagram");
          router.replace("/tools/diagrams");
          return;
        }

        const id = String(data.id);

        // ✅ Store edit key for autosave + versions
        const editKey = data?.editKey ?? data?.edit_key ?? null;
        if (editKey) setEditKey(id, String(editKey));

        // ✅ Add to local recents so it appears in /tools/diagrams
        upsertRecent({
          id,
          name: "Swimlane Diagram",
          updatedAt: Date.now(),
        });

        // ✅ Canonical editor route (matches save-version redirects, etc.)
        router.replace(`/tools/diagrams/${encodeURIComponent(id)}`);
      } catch (e: any) {
        if (cancelled) return;
        alert(e?.message ?? "Failed to create swimlane diagram");
        router.replace("/tools/diagrams");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <div className="p-6 text-sm text-gray-700">Creating a new swimlane canvas…</div>;
}
