// lib/diagrams/localRecents.ts

export type LocalDiagramRef = {
  id: string;
  name?: string;
  updatedAt?: number;
};

const KEY_RECENTS = "jhatpat_diagram_recents_v1";
const KEY_EDIT_KEYS = "jhatpat_diagram_editkeys_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// --------------------
// Recents
// --------------------
export function getLocalRecents(): LocalDiagramRef[] {
  if (!canUseStorage()) return [];
  const list = safeParse<LocalDiagramRef[]>(localStorage.getItem(KEY_RECENTS), []);
  return Array.isArray(list) ? list : [];
}

export function setLocalRecents(items: LocalDiagramRef[]) {
  if (!canUseStorage()) return;
  const cleaned = (Array.isArray(items) ? items : [])
    .filter((x) => x && typeof x.id === "string" && x.id.trim().length > 0)
    .map((x) => ({
      id: String(x.id).trim(),
      name: x.name != null ? String(x.name).slice(0, 160) : undefined,
      updatedAt: Number.isFinite(Number(x.updatedAt)) ? Number(x.updatedAt) : undefined,
    }))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, 20);

  localStorage.setItem(KEY_RECENTS, JSON.stringify(cleaned));
}

export function upsertRecent(ref: LocalDiagramRef) {
  const id = String(ref?.id ?? "").trim();
  if (!id) return;

  const nextItem: LocalDiagramRef = {
    id,
    name: ref.name != null ? String(ref.name).slice(0, 160) : undefined,
    updatedAt: ref.updatedAt ?? Date.now(),
  };

  const list = getLocalRecents();
  const next = [nextItem, ...list.filter((x) => x.id !== id)];
  setLocalRecents(next);
}

export function removeRecent(id: string) {
  const cleanId = String(id ?? "").trim();
  if (!cleanId) return;
  const list = getLocalRecents().filter((x) => x.id !== cleanId);
  setLocalRecents(list);
}

// --------------------
// Edit Keys
// --------------------
export function getEditKey(id: string): string | null {
  if (!canUseStorage()) return null;

  const cleanId = String(id ?? "").trim();
  if (!cleanId) return null;

  const map = safeParse<Record<string, string>>(localStorage.getItem(KEY_EDIT_KEYS), {});
  if (!map || typeof map !== "object") return null;

  const v = map[cleanId];
  const key = v != null ? String(v).trim() : "";
  return key ? key : null;
}

export function setEditKey(id: string, editKey: string) {
  if (!canUseStorage()) return;

  const cleanId = String(id ?? "").trim();
  const cleanKey = String(editKey ?? "").trim();
  if (!cleanId || !cleanKey) return;

  const map = safeParse<Record<string, string>>(localStorage.getItem(KEY_EDIT_KEYS), {});
  const next: Record<string, string> = map && typeof map === "object" ? { ...map } : {};
  next[cleanId] = cleanKey;

  localStorage.setItem(KEY_EDIT_KEYS, JSON.stringify(next));
}

export function removeEditKey(id: string) {
  if (!canUseStorage()) return;

  const cleanId = String(id ?? "").trim();
  if (!cleanId) return;

  const map = safeParse<Record<string, string>>(localStorage.getItem(KEY_EDIT_KEYS), {});
  if (!map || typeof map !== "object") return;

  if (cleanId in map) {
    delete map[cleanId];
    localStorage.setItem(KEY_EDIT_KEYS, JSON.stringify(map));
  }
}

export function clearAllEditKeys() {
  if (!canUseStorage()) return;
  localStorage.removeItem(KEY_EDIT_KEYS);
}
