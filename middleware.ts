// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PUBLIC: allow ALL diagram pages + diagram APIs without auth
  if (
    pathname.startsWith("/tools/diagrams") ||
    pathname.startsWith("/api/diagrams") ||
    pathname.startsWith("/api/ai/swimlanes") // if you use this for diagrams
  ) {
    return NextResponse.next();
  }

  // ✅ PUBLIC: allow auth pages themselves
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  /**
   * If you previously had auth gating here for other tools, keep it.
   * If your old middleware forced login for everything, that’s what caused the redirect.
   *
   * For now, we do NOT force-login anything here.
   * (If you need auth for other sections later, we can add it back as a specific allow/deny list.)
   */
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
