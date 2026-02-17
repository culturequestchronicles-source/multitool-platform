"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NewDiagramButton from "./NewDiagramButton";
import { getLocalRecents, removeRecent, type LocalDiagramRef } from "@/lib/diagrams/localRecents";

export default function DiagramsListClient() {
  const [openId, setOpenId] = useState("");
  const [recents, setRecents] = useState<LocalDiagramRef[]>([]);

  const refresh = () => setRecents(getLocalRecents());

  useEffect(() => {
    refresh();

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const validId = useMemo(() => openId.trim(), [openId]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Diagrams</h1>
          <p className="mt-1 text-sm text-gray-600">
            Public mode: no accounts. Your <b>recent diagrams</b> are saved in this browser only.
          </p>
        </div>
        <NewDiagramButton onCreated={refresh} />
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="text-sm font-medium">Open diagram by ID</div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="w-full flex-1 rounded-xl border px-3 py-2 text-sm"
            placeholder="Paste diagram ID (UUID)"
            value={openId}
            onChange={(e) => setOpenId(e.target.value)}
          />
          <Link
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              validId ? "bg-black" : "bg-gray-300 pointer-events-none"
            }`}
            href={validId ? `/tools/diagrams/${encodeURIComponent(validId)}` : "#"}
          >
            Open
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Tip: if you created it on this device, autosave works. If not, it will open read-only.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Recent on this device</div>
          <button className="text-xs text-gray-600 underline" onClick={refresh}>
            Refresh
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          {recents.map((d) => (
            <div key={d.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{d.name || "Untitled Diagram"}</div>
                  <div className="mt-1 text-xs text-gray-600 font-mono break-all">{d.id}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50" href={`/tools/diagrams/${d.id}`}>
                    Open
                  </Link>
                  <button
                    className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                    onClick={() => {
                      removeRecent(d.id);
                      refresh();
                    }}
                    title="Remove from this device"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {recents.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
              No local recents yet. Click <b>New Diagram</b>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

