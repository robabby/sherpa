import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = [
  "/auth",
  "/api/auth",
]

/** Legacy unscoped routes that should redirect to /projects/{primary}/... */
const LEGACY_ROUTE_PREFIXES = [
  "/process",
  "/tasks",
  "/research",
  "/docs",
  "/conventions",
  "/skills",
  "/playbooks",
  "/workforce",
  "/sessions",
  "/mcp",
  "/dispatch",
  "/workflow",
  "/activity",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Optimistic cookie check — if no session cookie, redirect to sign-in.
  // Full session validation happens in the layout (server component).
  // Better Auth uses __Secure- prefix on HTTPS, plain name on HTTP.
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token")
  if (!sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Legacy route redirects: unscoped routes → primary project scope.
  // The primary slug is read from a header set by the Next.js config,
  // or defaults to "sherpa" (the monorepo's own project name).
  if (!pathname.startsWith("/projects") && LEGACY_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const primarySlug = process.env.SHERPA_PRIMARY_SLUG ?? "sherpa"
    const url = request.nextUrl.clone()
    url.pathname = `/projects/${primarySlug}${pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
