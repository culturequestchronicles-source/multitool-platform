"use client";

import { useState } from "react";

const DIAGRAM_TYPE = "business_process_flow";
const DIAGRAM_LABEL = "Business Process (BPMN)";

export default function NewDiagramButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    try {
      setBusy(true);
      const res = await fetch("/api/diagrams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Untitled Diagram", diagram_type: DIAGRAM_TYPE }),
      });

      // Route redirects on success
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Failed to create diagram");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="rounded-xl bg-black px-5 py-3 text-white"
        onClick={() => setOpen(true)}
      >
        New Diagram
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create a new diagram</h3>
              <button className="text-sm text-gray-600" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Diagram name</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="e.g., Order-to-Cash (BPMN)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Diagram type</label>
                <div className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {DIAGRAM_LABEL}
                </div>
              </div>

              <button
                className="mt-2 w-full rounded-xl bg-black px-3 py-2 text-white disabled:opacity-50"
                onClick={create}
                disabled={busy}
              >
                {busy ? "Creating..." : "Create"}
              </button>

              <p className="text-xs text-gray-500">
                BPMN includes professional colors and a standards-aware palette.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
