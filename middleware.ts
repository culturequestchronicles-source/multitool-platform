import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Always allow these (important for SEO + Next internals)
  const isAlwaysPublic =
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/google") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public");

  if (isAlwaysPublic) return NextResponse.next();

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect diagrams tool + its APIs only
  const protectedPaths =
    pathname.startsWith("/tools/diagrams") || pathname.startsWith("/api/diagrams");

  // Allow login + callback
  const allowPaths =
    pathname.startsWith("/login") || pathname.startsWith("/auth/callback");

  if (protectedPaths && !allowPaths && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/tools/diagrams/:path*", "/api/diagrams/:path*", "/login", "/auth/callback"],
};
