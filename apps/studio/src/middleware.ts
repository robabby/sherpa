import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = [
  "/auth",
  "/api/auth",
  "/s",
]

/**
 * Legacy unscoped routes that redirect to /projects/{primary}/...
 * Only routes with a project-scoped page under /projects/[project]/ belong
 * here — redirecting a route without one produces a 404. Everything else
 * (dispatch, workflow, conventions, skills, playbooks, workforce, sessions,
 * mcp, activity, docs) is served by its top-level page.
 */
const LEGACY_ROUTE_PREFIXES = [
  "/process",
  "/tasks",
  "/research",
]

/**
 * Resolve the public-facing origin of the request.
 *
 * Behind a reverse proxy (e.g. Caddy), the Next standalone server's
 * `request.url` reflects its internal bind address (e.g. localhost:3001), so
 * absolute redirects built from it leak the internal host to the browser. The
 * real public origin comes from the forwarded/Host headers: the proxy sets
 * `x-forwarded-proto` and preserves/sets the host. Falls back to `request.url`
 * when not proxied.
 */
function publicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  if (!forwardedHost) return new URL(request.url).origin
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")
  return `${proto}://${forwardedHost}`
}

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
    const signInUrl = new URL("/auth/sign-in", publicOrigin(request))
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Legacy route redirects: unscoped routes → primary project scope.
  // The primary slug is read from a header set by the Next.js config,
  // or defaults to "sherpa" (the monorepo's own project name).
  if (!pathname.startsWith("/projects") && LEGACY_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const primarySlug = process.env.SHERPA_PRIMARY_SLUG ?? "sherpa"
    const url = new URL(publicOrigin(request))
    url.pathname = `/projects/${primarySlug}${pathname}`
    url.search = request.nextUrl.search
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
