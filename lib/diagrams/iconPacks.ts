export type IconPackProvider = "aws" | "azure" | "gcp" | "cncf";

export type IconPackNodeEntry = {
  /**
   * Public URL path (same-origin) to an SVG/PNG, e.g.
   * `/icon-packs/aws/icons/Architecture-Service-Icons/Amazon-API-Gateway.svg`
   */
  src: string;
  /**
   * Optional accessible label. If omitted, we use node label.
   */
  alt?: string;
};

export type IconPackManifestV1 = {
  version: 1;
  provider: IconPackProvider;
  /**
   * Map from our ArchitectureNodeKind (e.g. "api_gateway") to an icon entry.
   * You control the exact SVG/PNG paths here to avoid any guessing.
   */
  nodes: Record<string, IconPackNodeEntry>;
};

export function isIconPackManifestV1(x: any): x is IconPackManifestV1 {
  if (!x || typeof x !== "object") return false;
  if (x.version !== 1) return false;
  if (typeof x.provider !== "string") return false;
  if (!x.nodes || typeof x.nodes !== "object") return false;
  return true;
}

export function normalizeIconSrc(src: string) {
  const s = String(src ?? "").trim();
  // We only support same-origin public paths.
  if (!s.startsWith("/")) return null;
  return s;
}
