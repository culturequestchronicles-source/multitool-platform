// lib/diagrams/editKey.ts

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

/**
 * Generate a strong edit key.
 * - Prefer Web Crypto (`globalThis.crypto.getRandomValues`) which is available in modern Node runtimes.
 * - Always returns exactly 64 lowercase hex chars to satisfy DB constraints.
 */
export function newEditKey(): string {
  try {
    const c: Crypto | undefined = (globalThis as any)?.crypto;
    if (c?.getRandomValues) {
      const bytes = new Uint8Array(32);
      c.getRandomValues(bytes);
      return bytesToHex(bytes);
    }
  } catch {
    // ignore and use fallback
  }

  // Fallback: not cryptographically strong, but ensures correct length + charset.
  let out = "";
  while (out.length < 64) out += Math.floor(Math.random() * 16).toString(16);
  return out.slice(0, 64);
}

/**
 * Reads edit key from:
 * 1) Header: x-edit-key  (preferred)
 * 2) Body: editKey or edit_key
 * 3) Query: ?editKey=...
 */
export function readEditKey(req: Request, body?: any): string | null {
  const h = req.headers.get("x-edit-key");
  if (h && String(h).trim()) return String(h).trim();

  const b1 = body?.editKey;
  if (b1 && String(b1).trim()) return String(b1).trim();

  const b2 = body?.edit_key;
  if (b2 && String(b2).trim()) return String(b2).trim();

  try {
    const u = new URL(req.url);
    const q = u.searchParams.get("editKey");
    if (q && q.trim()) return q.trim();
  } catch {
    // ignore
  }

  return null;
}
