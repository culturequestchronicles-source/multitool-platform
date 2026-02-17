"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { Node } from "@xyflow/react";
import type { ErdEntityNodeData, ErdField } from "@/lib/diagrams/erd";

function isEntity(n: Node | null): n is Node<ErdEntityNodeData> {
  if (!n) return false;
  const kind = String((n.data as any)?.kind ?? "");
  const type = String(n.type ?? "");
  return kind === "erd_entity" || type === "erd_entity";
}

const COMMON_TYPES = ["uuid", "int", "bigint", "text", "varchar(255)", "boolean", "timestamp", "timestamptz", "jsonb"];

function normField(f: ErdField): ErdField {
  return {
    name: String(f.name ?? "").trim() || "field",
    type: f.type ?? "",
    pk: Boolean(f.pk),
    fk: Boolean(f.fk),
    nullable: f.nullable !== false,
    unique: Boolean(f.unique),
    ref: f.ref,
  };
}

export default function ErdPropertiesPanel({
  selectedNode,
  allNodes,
  onUpdateEntity,
}: {
  selectedNode: Node | null;
  allNodes: Node[];
  onUpdateEntity: (id: string, patch: Partial<ErdEntityNodeData>) => void;
}) {
  const entity = isEntity(selectedNode) ? selectedNode : null;
  const entityId = entity?.id ?? "";

  const entities = useMemo(() => {
    return (allNodes ?? []).filter((n) => String((n.data as any)?.kind ?? "") === "erd_entity" || String(n.type ?? "") === "erd_entity");
  }, [allNodes]);

  const [newFieldName, setNewFieldName] = useState("");

  const commitFields = useCallback(
    (next: ErdField[]) => {
      if (!entityId) return;
      onUpdateEntity(entityId, { fields: next.map(normField) });
    },
    [entityId, onUpdateEntity]
  );

  const fields: ErdField[] = entity && Array.isArray((entity.data as any)?.fields) ? ((entity.data as any).fields as any) : [];
  const normalized = fields.map(normField);

  const addField = useCallback(() => {
    const name = newFieldName.trim();
    if (!name) return;
    setNewFieldName("");
    commitFields([
      ...normalized,
      { name, type: "text", pk: false, fk: false, nullable: true, unique: false },
    ]);
  }, [commitFields, newFieldName, normalized]);

  if (!entity) {
    return (
      <div className="w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
          <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">No ERD entity selected</div>
          <div className="mt-1 text-xs text-gray-500">Select an ERD Entity to edit its fields</div>
        </div>
        <div className="p-4 text-xs text-gray-500 leading-relaxed">Tip: Double-click the entity title to rename it.</div>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-full border-l border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/40">
        <div className="text-xs font-semibold text-gray-500 uppercase">Properties</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">Entity</div>
        <div className="mt-1 text-xs text-gray-500 truncate">{entity.id}</div>
      </div>

      <div className="p-4 space-y-5 overflow-auto">
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Name</div>
          <div className="rounded-xl border bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
            {String((entity.data as any)?.label ?? "")}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Rename by double-clicking the entity title on canvas.</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-600">Fields</div>
            <div className="text-[11px] text-gray-500">{normalized.length} total</div>
          </div>

          <div className="flex gap-2">
            <input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addField();
                }
              }}
              placeholder="new_field"
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50" onClick={addField}>
              Add
            </button>
          </div>

          <div className="space-y-3">
            {normalized.map((f, idx) => {
              const update = (patch: Partial<ErdField>) => {
                const next = normalized.map((x, i) => (i === idx ? { ...x, ...patch } : x));
                commitFields(next);
              };

              const remove = () => {
                commitFields(normalized.filter((_, i) => i !== idx));
              };

              const refEntity = f.ref?.entityId ? entities.find((n) => n.id === f.ref?.entityId) : null;
              const refFields = refEntity
                ? (Array.isArray((refEntity.data as any)?.fields) ? ((refEntity.data as any).fields as ErdField[]) : []).map(normField)
                : [];
              const refFieldNames = refFields.filter((x) => x.pk).map((x) => x.name);

              return (
                <div key={`${f.name}_${idx}`} className="rounded-xl border p-3 bg-white">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[11px] font-semibold text-gray-500 mb-1">Name</div>
                          <input
                            value={f.name}
                            onChange={(e) => update({ name: e.target.value })}
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-gray-500 mb-1">Type</div>
                          <input
                            value={String(f.type ?? "")}
                            onChange={(e) => update({ type: e.target.value })}
                            list="erd-types"
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                            placeholder="text"
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input type="checkbox" checked={Boolean(f.pk)} onChange={(e) => update({ pk: e.target.checked })} />
                          PK
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(f.fk)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              update({ fk: checked, ref: checked ? f.ref : undefined });
                            }}
                          />
                          FK
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={f.nullable !== false}
                            onChange={(e) => update({ nullable: e.target.checked })}
                          />
                          Nullable
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input type="checkbox" checked={Boolean(f.unique)} onChange={(e) => update({ unique: e.target.checked })} />
                          Unique
                        </label>
                      </div>

                      {f.fk ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[11px] font-semibold text-gray-500 mb-1">References Entity</div>
                            <select
                              value={f.ref?.entityId ?? ""}
                              onChange={(e) => update({ ref: { entityId: e.target.value, field: "" } })}
                              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                            >
                              <option value="">(select)</option>
                              {entities
                                .filter((n) => n.id !== entity.id)
                                .map((n) => (
                                  <option key={n.id} value={n.id}>
                                    {String((n.data as any)?.label ?? n.id)}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-gray-500 mb-1">References Field (PK)</div>
                            <select
                              value={f.ref?.field ?? ""}
                              onChange={(e) => update({ ref: { entityId: f.ref?.entityId ?? "", field: e.target.value } })}
                              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                              disabled={!f.ref?.entityId}
                            >
                              <option value="">(select)</option>
                              {refFieldNames.map((nm) => (
                                <option key={nm} value={nm}>
                                  {nm}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                      onClick={remove}
                      title="Remove field"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <datalist id="erd-types">
        {COMMON_TYPES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}
