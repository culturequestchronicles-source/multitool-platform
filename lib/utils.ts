export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, unknown>;

function toClassNames(value: ClassValue, out: string[]) {
  if (!value) return;

  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((v) => toClassNames(v, out));
    return;
  }

  if (typeof value === "object") {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) out.push(key);
    }
  }
}

/**
 * Minimal `cn` helper (like clsx) without extra dependencies.
 */
export function cn(...values: ClassValue[]) {
  const out: string[] = [];
  values.forEach((v) => toClassNames(v, out));
  return out.join(" ");
}

