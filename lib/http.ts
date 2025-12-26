export function noStoreHeaders(extra: Record<string, string> = {}) {
  return {
    ...extra,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * Optimized for Next.js builds.
 * Safely converts Uint8Array to a standard ArrayBuffer.
 * This approach avoids SharedArrayBuffer type-mismatch errors.
 */
export function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  // Create a new buffer of the exact length needed
  const ab = new ArrayBuffer(u8.byteLength);
  // Create a view for the new buffer and set the data from the input
  new Uint8Array(ab).set(u8);
  return ab;
}