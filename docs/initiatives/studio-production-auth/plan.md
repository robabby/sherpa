# Studio Production Auth — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Better Auth authentication to Sherpa Studio and the MCP server, deploy at studio.sherpa.solar with TLS, and harden the VPS.

**Architecture:** Two Better Auth instances (Studio + MCP server) share a single `.sherpa/auth.db` via SQLite WAL mode. Studio handles user sessions and the auth API. MCP server validates API keys (agents) and forwarded session cookies (humans). Caddy reverse-proxies studio.sherpa.solar to the VPS.

**Tech Stack:** Better Auth v1.5+, better-sqlite3 v12.8, Next.js 16.1, React 19, shadcn/ui (new-york/radix), Caddy, CrowdSec, Lynis

**Reference docs:**
- Design: `docs/initiatives/studio-production-auth/design.md`
- Shape: `docs/initiatives/studio-production-auth/shape.md`
- Stress test: `docs/initiatives/studio-production-auth/stress-test.md`
- ADR: `docs/decisions/0012-better-auth-over-supabase.md`

**Constraints from shape:**
- No OAuth providers, no self-registration, no MFA, no user management UI, no API key scoping
- Auth secret managed via `BETTER_AUTH_SECRET` env var
- API key prefix: `sk_sherpa_`
- Separate `auth.db` file — Better Auth manages its own Kysely connection
- Never pass Zod schemas across the Better Auth boundary (Zod 3 vs 4 isolation)

---

## Session 2: Auth Infrastructure + UI

### Task 1: Install Better Auth dependencies

**Files:**
- Modify: `apps/studio/package.json`
- Modify: `packages/studio-mcp/package.json`

**Step 1: Install Better Auth in the Studio app**

```bash
cd /Users/rob/Workbench/sherpa
pnpm add better-auth --filter @sherpa/studio-app
```

Expected: `better-auth` added to `apps/studio/package.json` dependencies.

**Step 2: Install Better Auth in the MCP server**

```bash
pnpm add better-auth --filter @sherpa/studio-mcp
```

Expected: `better-auth` added to `packages/studio-mcp/package.json` dependencies.

**Step 3: Ensure .env.production is gitignored**

Verify `.env.production` is in `.gitignore`. It should already be there — if not, add it under the `# Environment` section.

```bash
git check-ignore .env.production
```

Expected: `.env.production` — confirmed gitignored.

**Step 4: Verify Zod isolation**

```bash
pnpm ls zod --depth 1
```

Expected: Two separate zod versions visible — `zod@3.x` in workspace packages, `zod@4.x` inside `better-auth`. pnpm strict isolation keeps them separate. If type errors appear later, add `pnpm.overrides` in root `package.json`.

**Step 5: Commit**

```bash
git add apps/studio/package.json packages/studio-mcp/package.json pnpm-lock.yaml .gitignore
git commit -m "chore: add better-auth to studio and mcp server"
```

---

### Task 2: Add auth.db path to studio-core

**Files:**
- Modify: `packages/studio-core/src/db/types.ts`
- Modify: `packages/studio-core/src/db/connection.ts`

**Step 1: Update the ResolvedDbPaths interface**

In `packages/studio-core/src/db/types.ts`, add the `auth` field:

```typescript
/** Resolved paths for all Sherpa databases. Convention: .sherpa/*.db */
export interface ResolvedDbPaths {
  dir: string
  coordination: string
  events: string
  knowledge: string
  auth: string
}
```

**Step 2: Update DB_FILES and resolveDbPaths**

In `packages/studio-core/src/db/connection.ts`, add `auth` to `DB_FILES` and the return value:

```typescript
const DB_FILES = {
  coordination: "coordination.db",
  events: "events.db",
  knowledge: "knowledge.db",
  auth: "auth.db",
} as const
```

Update the `resolveDbPaths` return to include:
```typescript
auth: path.join(dir, DB_FILES.auth),
```

**Step 3: Run typecheck**

```bash
pnpm check
```

Expected: All packages pass. The new `auth` field is additive — no consumers break.

**Step 4: Commit**

```bash
git add packages/studio-core/src/db/types.ts packages/studio-core/src/db/connection.ts
git commit -m "feat(db): add auth.db path to ResolvedDbPaths"
```

---

### Task 3: Create Better Auth server instance

**Files:**
- Create: `apps/studio/src/lib/auth.ts`
- Create: `apps/studio/src/lib/auth-client.ts`

**Step 1: Create the server-side auth instance**

Create `apps/studio/src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins/api-key"
import { nextCookies } from "better-auth/plugins/next-cookies"
import Database from "better-sqlite3"
import path from "node:path"

const projectRoot = process.env.SHERPA_PROJECT_ROOT ?? process.cwd()
const dbPath = path.join(projectRoot, ".sherpa", "auth.db")

export const auth = betterAuth({
  database: new Database(dbPath),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh daily
  },
  plugins: [
    apiKey({
      apiKeyPrefix: "sk_sherpa_",
    }),
    nextCookies(),
  ],
})
```

Note: Better Auth auto-runs Kysely migrations on first use. The `user`, `session`, `account`, `verification`, and `apikey` tables are created automatically.

**Step 2: Create the browser-side auth client**

Create `apps/studio/src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react"
import { apiKeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  plugins: [
    apiKeyClient(),
  ],
})

export const { signIn, signOut, useSession } = authClient
```

**Step 3: Commit**

```bash
git add apps/studio/src/lib/auth.ts apps/studio/src/lib/auth-client.ts
git commit -m "feat(auth): create Better Auth server and client instances"
```

---

### Task 4: Create the auth API route handler

**Files:**
- Create: `apps/studio/src/app/api/auth/[...all]/route.ts`

**Step 1: Create the catch-all route handler**

Create `apps/studio/src/app/api/auth/[...all]/route.ts`:

```typescript
import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export const { GET, POST } = toNextJsHandler(auth)
```

This single file handles all Better Auth API routes: sign-in, sign-out, session, API key management.

**Step 2: Commit**

```bash
git add apps/studio/src/app/api/auth/
git commit -m "feat(auth): add Better Auth catch-all route handler"
```

---

### Task 5: Create Next.js middleware for route protection

**Files:**
- Create: `apps/studio/src/middleware.ts`

**Step 1: Create the middleware**

Create `apps/studio/src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = [
  "/auth",
  "/api/auth",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Optimistic cookie check — if no session cookie, redirect to sign-in.
  // Full session validation happens in the layout (server component).
  const sessionCookie = request.cookies.get("better-auth.session_token")
  if (!sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
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
```

**Step 2: Commit**

```bash
git add apps/studio/src/middleware.ts
git commit -m "feat(auth): add Next.js middleware for route protection"
```

---

### Task 6: Create the auth layout and sign-in page

**Files:**
- Create: `apps/studio/src/app/auth/layout.tsx`
- Create: `apps/studio/src/app/auth/sign-in/page.tsx`
- Create: `apps/studio/src/components/auth/sign-in-form.tsx`

**Step 1: Create the auth layout (no sidebar)**

Create `apps/studio/src/app/auth/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  )
}
```

This layout renders WITHOUT the Studio sidebar, header, or command palette. The root layout's providers still apply (fonts, dark mode), but the sidebar/header components don't render because this layout replaces the default content area.

**Important:** Because Next.js App Router uses nested layouts, `/auth/sign-in` will render inside RootLayout AND AuthLayout. The root layout renders the sidebar for all routes. We need to restructure so auth routes don't get the sidebar. Two options:

**Option A (recommended):** Use a route group. Move the current layout's sidebar/header into a `(studio)` route group, and put auth routes outside it.

Restructure:
- `apps/studio/src/app/(studio)/layout.tsx` — the current root layout content (sidebar, header)
- `apps/studio/src/app/(studio)/page.tsx` — move existing home page
- `apps/studio/src/app/(studio)/tasks/` — move existing routes
- `apps/studio/src/app/layout.tsx` — keep only html/body/fonts (shared)
- `apps/studio/src/app/auth/layout.tsx` — centered, no sidebar

**Option B (simpler):** Keep current structure, detect auth routes in root layout and conditionally skip sidebar.

**Go with Option A** for clean separation. Move all existing page routes into a `(studio)` route group. This is more files to touch initially but produces a cleaner architecture with no conditional rendering.

**Step 1a: Create the new root layout (shared)**

Modify `apps/studio/src/app/layout.tsx` to contain ONLY html/body/fonts:

```tsx
import "@xyflow/react/dist/style.css"
import "@radix-ui/themes/styles.css"
import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
})

export const viewport: Viewport = {
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: "Sherpa Studio",
    template: "%s | Sherpa Studio",
  },
  description: "Behavioral agentic collaboration framework",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
```

**Step 1b: Create the studio route group layout**

Create `apps/studio/src/app/(studio)/layout.tsx`:

```tsx
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { StudioSidebar } from "@/components/studio/studio-sidebar"
import { StudioShellHeader } from "@/components/studio/studio-shell-header"
import { CommandPalette } from "@/components/studio/command-palette"
import { auth } from "@/lib/auth"

export default async function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  return (
    <>
      <CommandPalette />
      <SidebarProvider>
        <StudioSidebar user={session.user} />
        <SidebarInset>
          <StudioShellHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
```

**Step 1c: Move all existing page routes into `(studio)/`**

Move these directories/files into `apps/studio/src/app/(studio)/`:
- `page.tsx` (home)
- `process/`
- `tasks/`
- `dispatch/`
- `workflow/`
- `docs/`
- `conventions/`
- `skills/`
- `playbooks/`
- `workforce/`
- `sessions/`
- `mcp/`
- `research/`
- `activity/`

Also move API routes that should be protected:
- `api/studio/`
- `api/dispatch/`
- `api/stream/`

Keep outside `(studio)/`:
- `api/auth/` (public — Better Auth handler)
- `auth/` (public — sign-in page)

Run:
```bash
cd /Users/rob/Workbench/sherpa/apps/studio/src/app
mkdir -p "(studio)"
# Move all existing routes into the route group
mv page.tsx "(studio)/"
mv process "(studio)/"
mv tasks "(studio)/"
mv dispatch "(studio)/"
mv workflow "(studio)/"
mv docs "(studio)/"
mv conventions "(studio)/"
mv skills "(studio)/"
mv playbooks "(studio)/"
mv workforce "(studio)/"
mv sessions "(studio)/"
mv mcp "(studio)/"
mv research "(studio)/"
mv activity "(studio)/"
mkdir -p "(studio)/api"
mv api/studio "(studio)/api/"
mv api/dispatch "(studio)/api/"
mv api/stream "(studio)/api/"
```

**Step 2: Create the auth layout**

Create `apps/studio/src/app/auth/layout.tsx`:

```tsx
import { Zap } from "lucide-react"

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)]">
          <Zap className="size-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg leading-tight tracking-[-0.01em] text-foreground">
            Sherpa
          </span>
          <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.25em] text-muted-foreground/60">
            Studio
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}
```

**Step 3: Create the sign-in form component**

Create `apps/studio/src/components/auth/sign-in-form.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const result = await signIn.email({
      email,
      password,
    })

    if (result.error) {
      setError("Invalid email or password.")
      setPending(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 4: Create the sign-in page**

Create `apps/studio/src/app/auth/sign-in/page.tsx`:

```tsx
import type { Metadata } from "next"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function SignInPage() {
  return <SignInForm />
}
```

**Step 5: Run typecheck and dev server**

```bash
pnpm check
pnpm dev
```

Navigate to `http://localhost:3000` — should redirect to `/auth/sign-in`.

**Step 6: Commit**

```bash
git add apps/studio/src/app/ apps/studio/src/components/auth/ apps/studio/src/lib/auth.ts apps/studio/src/lib/auth-client.ts
git commit -m "feat(auth): add sign-in page with route group separation"
```

---

### Task 7: Add user menu to sidebar footer

**Files:**
- Create: `apps/studio/src/components/auth/user-menu.tsx`
- Modify: `packages/studio-ui/src/studio-sidebar.tsx`

**Step 1: Create the UserMenu component**

Create `apps/studio/src/components/auth/user-menu.tsx`:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { ChevronsUpDown, LogOut } from "lucide-react"

interface UserMenuProps {
  user: {
    name: string | null
    email: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const initials = (user.name ?? user.email).charAt(0).toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push("/auth/sign-in")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name ?? "User"}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Step 2: Install Avatar component if not already present**

```bash
cd /Users/rob/Workbench/sherpa
pnpm dlx shadcn@latest add avatar
```

**Step 3: Update StudioSidebar to accept and render user prop**

Modify `packages/studio-ui/src/studio-sidebar.tsx`:

Add a `user` prop to the component and render the UserMenu in the footer. Since `UserMenu` is in the Studio app (not studio-ui), pass it as a render slot:

```tsx
// Add to props
interface StudioSidebarProps {
  user?: { name: string | null; email: string }
  userMenu?: React.ReactNode
}

export function StudioSidebar({ userMenu }: StudioSidebarProps) {
```

Update the SidebarFooter:

```tsx
<SidebarFooter className="border-t border-sidebar-border">
  {userMenu}
  <SidebarTrigger />
</SidebarFooter>
```

Then in `apps/studio/src/app/(studio)/layout.tsx`, pass the UserMenu:

```tsx
import { UserMenu } from "@/components/auth/user-menu"

// In the JSX:
<StudioSidebar userMenu={<UserMenu user={session.user} />} />
```

**Step 4: Run typecheck**

```bash
pnpm check
```

**Step 5: Commit**

```bash
git add apps/studio/src/components/auth/user-menu.tsx packages/studio-ui/src/studio-sidebar.tsx apps/studio/src/app/"(studio)"/layout.tsx
git commit -m "feat(auth): add user menu to sidebar footer"
```

---

### Task 8: Create admin user seed script

**Files:**
- Create: `scripts/seed-auth-user.ts`

**Step 1: Create the seed script**

Create `scripts/seed-auth-user.ts`:

```typescript
#!/usr/bin/env -S pnpm exec tsx
/**
 * Seed an admin user for Better Auth.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-auth-user.ts --email "$AUTH_ADMIN_EMAIL" --password "$AUTH_ADMIN_PASSWORD" --name Rob
 */
import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins/api-key"
import Database from "better-sqlite3"
import path from "node:path"
import { parseArgs } from "node:util"

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    password: { type: "string" },
    name: { type: "string", default: "Admin" },
  },
})

if (!values.email || !values.password) {
  console.error("Usage: pnpm exec tsx scripts/seed-auth-user.ts --email <email> --password <pw> --name <name>")
  process.exit(1)
}

const projectRoot = process.env.SHERPA_PROJECT_ROOT ?? process.cwd()
const dbPath = path.join(projectRoot, ".sherpa", "auth.db")

const auth = betterAuth({
  database: new Database(dbPath),
  emailAndPassword: { enabled: true },
  plugins: [apiKey({ apiKeyPrefix: "sk_sherpa_" })],
})

const result = await auth.api.signUpEmail({
  body: {
    email: values.email,
    password: values.password,
    name: values.name,
  },
})

if ("error" in result && result.error) {
  console.error("Failed to create user:", result.error)
  process.exit(1)
}

console.log(`User created: ${values.email}`)
console.log(`You can now sign in at http://localhost:3000/auth/sign-in`)
```

**Step 2: Test it locally**

```bash
BETTER_AUTH_SECRET=dev-secret-change-me pnpm exec tsx scripts/seed-auth-user.ts --email "$AUTH_ADMIN_EMAIL" --password "$AUTH_ADMIN_PASSWORD" --name Rob
```

**Step 3: Commit**

```bash
git add scripts/seed-auth-user.ts
git commit -m "feat(auth): add admin user seed script"
```

---

### Task 9: Create environment validation

**Files:**
- Create: `apps/studio/src/env.ts`

**Step 1: Create env validation**

Create `apps/studio/src/env.ts`:

```typescript
/**
 * Environment variable validation for Studio auth.
 * Fails fast on missing required vars in production.
 */
function required(key: string): string {
  const value = process.env[key]
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value ?? ""
}

export const env = {
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
} as const
```

Update `apps/studio/src/lib/auth.ts` to import from env:

```typescript
import { env } from "@/env"

// Replace hardcoded values:
baseURL: env.BETTER_AUTH_URL,
secret: env.BETTER_AUTH_SECRET,
```

**Step 2: Local dev environment**

Auth env vars are already in the root `.env.local` (gitignored) alongside other dev secrets like `OPENCLAW_GATEWAY_TOKEN`. Both Next.js and the MCP server read from this file. No separate `apps/studio/.env.local` needed.

Root `.env.local` contains:
```
BETTER_AUTH_SECRET=dev-secret-change-me-local
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

Production values live in root `.env.production` (also gitignored), pushed to VPS via `scp`.

**Step 3: Commit**

```bash
git add apps/studio/src/env.ts apps/studio/src/lib/auth.ts
git commit -m "feat(auth): add environment validation"
```

---

### Task 10: End-to-end verification (Session 2)

**Step 1: Start dev server**

```bash
BETTER_AUTH_SECRET=dev-secret-change-me pnpm dev
```

**Step 2: Verify middleware redirect**

Navigate to `http://localhost:3000/tasks`. Expected: redirect to `/auth/sign-in?callbackUrl=/tasks`.

**Step 3: Verify sign-in flow**

1. Enter seeded user credentials on the sign-in page
2. Expected: redirect to `/tasks` (or `/` if no callbackUrl)
3. Studio sidebar visible with user menu in footer
4. Click user menu → "Sign out" → redirect to `/auth/sign-in`

**Step 4: Verify API auth routes**

```bash
curl -s http://localhost:3000/api/auth/ok | jq .
```

Expected: `{ "ok": true }` — Better Auth health check.

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "feat(auth): Session 2 complete — Studio auth infrastructure and UI"
```

---

## Session 3: MCP Server Auth

### Task 11: Create MCP auth middleware

**Files:**
- Create: `packages/studio-mcp/src/auth/middleware.ts`
- Create: `packages/studio-mcp/src/auth/index.ts`

**Step 1: Create the auth middleware factory**

Create `packages/studio-mcp/src/auth/middleware.ts`:

```typescript
import type http from "node:http"
import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins/api-key"
import { fromNodeHeaders } from "better-auth/node"
import Database from "better-sqlite3"

export interface McpAuthOptions {
  /** Absolute path to auth.db */
  authDbPath: string
  /** Paths that skip auth (e.g. "/health") */
  publicPaths?: string[]
}

export function createMcpAuth(opts: McpAuthOptions) {
  const auth = betterAuth({
    database: new Database(opts.authDbPath),
    emailAndPassword: { enabled: true },
    plugins: [
      apiKey({ apiKeyPrefix: "sk_sherpa_" }),
    ],
  })

  const publicPaths = new Set(opts.publicPaths ?? ["/health"])

  /**
   * Auth middleware for the MCP HTTP server.
   * Returns null if authenticated, or an error response to send.
   */
  async function authenticate(
    req: http.IncomingMessage,
  ): Promise<{ error: string; status: number } | null> {
    const url = req.url ?? ""
    if (publicPaths.has(url)) return null

    // Path 1: API key (agents)
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined
    if (apiKeyHeader) {
      const result = await auth.api.verifyApiKey({
        body: { key: apiKeyHeader },
      })
      if (result && "valid" in result && result.valid) {
        return null // authenticated
      }
      return { error: "Invalid API key", status: 401 }
    }

    // Path 2: Session cookie (humans via Studio server-side calls)
    const cookieHeader = req.headers.cookie
    if (cookieHeader) {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      })
      if (session) {
        return null // authenticated
      }
    }

    return { error: "Authentication required", status: 401 }
  }

  return { auth, authenticate }
}
```

**Step 2: Create barrel export**

Create `packages/studio-mcp/src/auth/index.ts`:

```typescript
export { createMcpAuth } from "./middleware"
export type { McpAuthOptions } from "./middleware"
```

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/auth/
git commit -m "feat(mcp-auth): create auth middleware with API key and session validation"
```

---

### Task 12: Wire auth middleware into MCP HTTP server

**Files:**
- Modify: `packages/studio-mcp/src/http-server.ts`
- Modify: `packages/studio-mcp/src/index.ts`

**Step 1: Add auth middleware to http-server.ts**

In `packages/studio-mcp/src/http-server.ts`:

Add import at top:
```typescript
import { createMcpAuth } from "./auth/middleware.js"
```

After the DB initialization block (line ~38), create the auth middleware:
```typescript
// Initialize auth
const mcpAuth = createMcpAuth({
  authDbPath: dbPaths.auth,
  publicPaths: ["/health"],
})
```

Inside the `http.createServer` callback, after the health check and BEFORE the `/mcp` handling, add the auth check:

```typescript
// Auth check (after health, before /mcp)
const authError = await mcpAuth.authenticate(req)
if (authError) {
  res.writeHead(authError.status, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: authError.error }))
  return
}
```

**Step 2: Re-export auth module from index.ts**

Add to `packages/studio-mcp/src/index.ts`:

```typescript
export { createMcpAuth } from "./auth"
export type { McpAuthOptions } from "./auth"
```

**Step 3: Run MCP server tests**

```bash
cd /Users/rob/Workbench/sherpa
pnpm --filter @sherpa/studio-mcp test
```

Fix any test failures caused by the auth middleware (tests may need to pass an API key header or mock auth).

**Step 4: Commit**

```bash
git add packages/studio-mcp/src/http-server.ts packages/studio-mcp/src/index.ts
git commit -m "feat(mcp-auth): wire auth middleware into HTTP server"
```

---

### Task 13: Generate Luna's API key

**Files:**
- Create: `scripts/generate-api-key.ts`

**Step 1: Create the API key generation script**

Create `scripts/generate-api-key.ts`:

```typescript
#!/usr/bin/env -S pnpm exec tsx
/**
 * Generate an API key for an agent.
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-api-key.ts --email "$AUTH_ADMIN_EMAIL" --name "Luna"
 */
import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins/api-key"
import Database from "better-sqlite3"
import path from "node:path"
import { parseArgs } from "node:util"

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string", default: "Agent" },
  },
})

if (!values.email) {
  console.error("Usage: pnpm exec tsx scripts/generate-api-key.ts --email <owner-email> --name <key-name>")
  process.exit(1)
}

const projectRoot = process.env.SHERPA_PROJECT_ROOT ?? process.cwd()
const dbPath = path.join(projectRoot, ".sherpa", "auth.db")

const auth = betterAuth({
  database: new Database(dbPath),
  emailAndPassword: { enabled: true },
  plugins: [apiKey({ apiKeyPrefix: "sk_sherpa_" })],
})

// Find the user
const db = new Database(dbPath)
const user = db.prepare("SELECT id FROM user WHERE email = ?").get(values.email) as { id: string } | undefined
if (!user) {
  console.error(`User not found: ${values.email}`)
  process.exit(1)
}

// Create API key via the auth API
const result = await auth.api.createApiKey({
  body: {
    name: values.name,
    userId: user.id,
  },
})

console.log(`API key created for ${values.name}:`)
console.log(`  Key: ${result.key}`)
console.log(``)
console.log(`Store this key securely — it cannot be retrieved again.`)
console.log(`Set it as MCP_API_KEY in Luna's environment on the VPS.`)
```

**Step 2: Generate Luna's key (on VPS during deployment)**

This will be run on the VPS after deploying the code:

```bash
BETTER_AUTH_SECRET=<production-secret> pnpm exec tsx scripts/generate-api-key.ts --email "$AUTH_ADMIN_EMAIL" --name "Luna"
```

**Step 3: Commit**

```bash
git add scripts/generate-api-key.ts
git commit -m "feat(auth): add API key generation script for agents"
```

---

### Task 14: End-to-end MCP auth verification (Session 3)

**Step 1: Test MCP rejects unauthenticated requests**

```bash
curl -s -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'
```

Expected: `{"error":"Authentication required"}` with status 401.

**Step 2: Test health check remains open**

```bash
curl -s http://localhost:3100/health | jq .
```

Expected: `{"status":"ok","sessions":0}` — no auth required.

**Step 3: Test API key authentication**

```bash
curl -s -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_sherpa_<generated-key>" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'
```

Expected: 200 with MCP initialize response.

**Step 4: Commit session 3 completion**

```bash
git add -A
git commit -m "feat(auth): Session 3 complete — MCP server auth with API keys"
```

---

## Session 4: Domain + VPS Security Hardening

### Task 15: Configure DNS for studio.sherpa.solar

**Step 1: Check CAA records**

```bash
dig CAA sherpa.solar +short
```

If any CAA records exist, ensure `letsencrypt.org` is allowed. If no records, proceed.

**Step 2: Add A record in Vercel DNS**

```bash
vercel dns add sherpa.solar studio A 5.78.128.178
```

Or via Vercel dashboard: Domains → sherpa.solar → DNS Records → Add A record:
- Name: `studio`
- Type: `A`
- Value: `5.78.128.178`

**Step 3: Verify DNS propagation**

```bash
dig studio.sherpa.solar +short
```

Expected: `5.78.128.178`. May take up to 5 minutes.

---

### Task 16: Install and configure Caddy on VPS

**Step 1: Install Caddy**

```bash
ssh sherpa-hetzner 'apt install -y debian-keyring debian-archive-keyring apt-transport-https curl && \
  curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/gpg.key" | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
  curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt" | tee /etc/apt/sources.list.d/caddy-stable.list && \
  apt update && apt install -y caddy'
```

**Step 2: Configure Caddyfile**

```bash
ssh sherpa-hetzner 'cat > /etc/caddy/Caddyfile << '\''EOF'\''
studio.sherpa.solar {
    # Studio app
    reverse_proxy localhost:3000

    # MCP server
    handle /mcp {
        reverse_proxy localhost:3100
    }
    handle /health {
        reverse_proxy localhost:3100
    }
}
EOF'
```

**Step 3: Open HTTP/HTTPS ports and restart Caddy**

```bash
ssh sherpa-hetzner 'ufw allow 80/tcp && ufw allow 443/tcp && systemctl restart caddy && systemctl status caddy'
```

**Step 4: Verify TLS**

```bash
curl -I https://studio.sherpa.solar
```

Expected: HTTP 302 redirect to `/auth/sign-in` with valid TLS certificate.

---

### Task 17: Update Better Auth config for production domain

**Step 1: Push .env.production to VPS**

The local `.env.production` (gitignored) already has the auth secret and URLs. Push it:

```bash
scp .env.production sherpa-hetzner:/root/sherpa/.env.production
ssh sherpa-hetzner 'chmod 600 /root/sherpa/.env.production'
```

**Step 2: Add EnvironmentFile to both systemd services**

Currently the services use inline `Environment=` directives only. Add the shared env file:

```bash
ssh sherpa-hetzner 'sed -i "/\[Service\]/a EnvironmentFile=/root/sherpa/.env.production" /etc/systemd/system/sherpa-studio.service /etc/systemd/system/sherpa-mcp.service && systemctl daemon-reload'
```

**Step 3: Restart services**

```bash
ssh sherpa-hetzner 'systemctl restart sherpa-studio sherpa-mcp'
```

**Step 3: Seed admin user on VPS**

```bash
ssh sherpa-hetzner 'cd /root/sherpa && source .env.production && pnpm exec tsx scripts/seed-auth-user.ts --email "$AUTH_ADMIN_EMAIL" --password "$AUTH_ADMIN_PASSWORD" --name Rob'
```

Note: `AUTH_ADMIN_EMAIL` is in `.env.production`. Pass `AUTH_ADMIN_PASSWORD` at the command line (never stored in files).

**Step 4: Generate Luna's API key on VPS**

```bash
ssh sherpa-hetzner 'cd /root/sherpa && source .env.production && pnpm exec tsx scripts/generate-api-key.ts --email "$AUTH_ADMIN_EMAIL" --name Luna'
```

Store the returned key in Luna's OpenClaw environment.

---

### Task 18: Install CrowdSec

**Step 1: Install CrowdSec engine**

```bash
ssh sherpa-hetzner 'curl -s https://install.crowdsec.net | bash && \
  apt install -y crowdsec crowdsec-firewall-bouncer-iptables'
```

**Step 2: Set memory limit**

```bash
ssh sherpa-hetzner 'mkdir -p /etc/systemd/system/crowdsec.service.d && \
  echo -e "[Service]\nMemoryMax=512M" > /etc/systemd/system/crowdsec.service.d/memory.conf && \
  systemctl daemon-reload && systemctl restart crowdsec'
```

**Step 3: Verify CrowdSec is running**

```bash
ssh sherpa-hetzner 'cscli metrics'
```

Expected: Shows acquisition metrics and parsed log lines.

---

### Task 19: Run Lynis security scan

**Step 1: Install and run Lynis**

```bash
ssh sherpa-hetzner 'apt install -y lynis && lynis audit system --quick'
```

**Step 2: Review findings**

Check for critical or high-severity findings. Address any that are actionable without infrastructure changes.

Common fixes:
- Ensure `unattended-upgrades` is configured: `dpkg-reconfigure -plow unattended-upgrades`
- Set file permissions on sensitive files
- Disable unused kernel modules

**Step 3: Document findings in the activity log**

---

### Task 20: UFW audit and final hardening

**Step 1: Review current UFW rules**

```bash
ssh sherpa-hetzner 'ufw status verbose'
```

**Step 2: Verify OpenClaw gateway is NOT exposed on public IP**

The OpenClaw gateway (port 18790) should only be reachable via Tailscale. Verify:

```bash
# From your local machine (not on Tailscale):
curl -m 5 http://5.78.128.178:18790
```

Expected: Connection timeout or refused. If accessible, add UFW rule:
```bash
ssh sherpa-hetzner 'ufw deny 18790/tcp'
```

**Step 3: Close any stale ports**

Review UFW output. Only these should be open:
- 22/tcp (SSH)
- 80/tcp (Caddy HTTP → redirect to HTTPS)
- 443/tcp (Caddy HTTPS)
- 172.16.0.0/12 to ports 3000, 3100 (Docker bridge → host services)

**Step 4: Update server provision template**

Modify `docs/templates/server-provision.md` with:
- Caddy installation and Caddyfile config
- CrowdSec installation with memory limit
- Lynis scan procedure
- UFW audit checklist

**Step 5: Final commit**

```bash
git add docs/templates/server-provision.md
git commit -m "feat(auth): Session 4 complete — domain, TLS, and VPS security hardening"
```

---

## Verification Checklist

After all sessions:

1. [ ] `https://studio.sherpa.solar` redirects to sign-in page
2. [ ] Sign in with admin credentials → Studio loads with sidebar + user menu
3. [ ] Sign out → redirects to sign-in page
4. [ ] `curl -s https://studio.sherpa.solar/tasks` → 302 to sign-in (not 200)
5. [ ] MCP `/health` returns 200 without auth
6. [ ] MCP `/mcp` returns 401 without auth
7. [ ] MCP `/mcp` with Luna's API key returns 200
8. [ ] TLS certificate is valid (check in browser)
9. [ ] Lynis scan shows no critical findings
10. [ ] OpenClaw gateway NOT reachable on public IP
11. [ ] CrowdSec is running with 512MB memory limit
12. [ ] `pnpm check` passes across all packages
