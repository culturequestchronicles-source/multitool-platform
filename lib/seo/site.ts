export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://jhatpat.com";

export const SITE_NAME = "Jhatpat";

export function absUrl(pathname: string) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${p}`;
}

