# Studio Aggregate Views Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cross-project aggregate views to Studio so "All Projects" shows merged data from all registered projects with project badges on each item.

**Architecture:** Extract research scanning from route into studio-core. Add aggregate functions to cross-project.ts for research and tasks (initiatives already done). Fix sidebar to generate `/projects/{section}` links in aggregate mode. Create three static Server Component routes under `projects/` that call aggregate functions and render flat lists. Static routes take priority over `[project]` dynamic segment in Next.js App Router — no collision.

**Tech Stack:** Next.js 16 (App Router, Server Components), TypeScript, shadcn/ui (Badge, already installed), Tailwind v4, pnpm monorepo, vitest for data layer tests

---

## Session 1: Data Layer + Sidebar + Research Aggregate

### Task 1: Extract scanResearchFiles to studio-core

Move the `scanResearchFiles` function from the route page into `studio-core` so it can be shared between the project-scoped and aggregate views.

**Files:**
- Create: `packages/studio-core/src/research-files.ts`
- Modify: `packages/studio-core/src/index.ts`
- Modify: `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Step 1: Write the failing test**

Create `packages/studio-core/src/__tests__/research-files.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { scanResearchFiles } from "../research-files"

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-research-test-"))
})

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe("scanResearchFiles", () => {
  it("returns empty array when .sherpa/research/ does not exist", () => {
    expect(scanResearchFiles(tmpDir)).toEqual([])
  })

  it("scans top-level markdown files", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "2026-03-20.md"),
      "---\ntitle: Test Report\ndate: 2026-03-20\n---\n# Test Report\nContent here.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      title: "Test Report",
      date: "2026-03-20",
      category: "",
      slug: "2026-03-20",
    })
  })

  it("scans category subdirectories", () => {
    const catDir = path.join(tmpDir, ".sherpa", "research", "job-market")
    fs.mkdirSync(catDir, { recursive: true })
    fs.writeFileSync(
      path.join(catDir, "2026-03-20.md"),
      "---\ntitle: Job Market Report\ndate: 2026-03-20\n---\nContent.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      title: "Job Market Report",
      category: "job-market",
      slug: "job-market/2026-03-20",
    })
  })

  it("sorts by date descending", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "old.md"),
      "---\ntitle: Old\ndate: 2026-03-01\n---\n",
    )
    fs.writeFileSync(
      path.join(researchDir, "new.md"),
      "---\ntitle: New\ndate: 2026-03-20\n---\n",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files[0]!.title).toBe("New")
    expect(files[1]!.title).toBe("Old")
  })

  it("falls back to H1 heading when no frontmatter title", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "report.md"),
      "# My Heading\nSome content.",
    )
    const files = scanResearchFiles(tmpDir)
    expect(files[0]!.title).toBe("My Heading")
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/research-files.test.ts`

Expected: FAIL — module `../research-files` not found.

**Step 3: Write the implementation**

Create `packages/studio-core/src/research-files.ts`:

```ts
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface ResearchFile {
  title: string
  date: string
  category: string
  slug: string
  relativePath: string
}

export function scanResearchFiles(projectRoot: string): ResearchFile[] {
  const researchDir = path.join(projectRoot, ".sherpa", "research")
  if (!fs.existsSync(researchDir)) return []

  const files: ResearchFile[] = []

  const entries = fs.readdirSync(researchDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      if (entry.name.endsWith(".md")) {
        const absPath = path.join(researchDir, entry.name)
        const raw = fs.readFileSync(absPath, "utf-8")
        const { data, content } = matter(raw)
        const title =
          data.title ??
          content.match(/^#\s+(.+)$/m)?.[1] ??
          entry.name.replace(/\.md$/, "")
        const date = data.date
          ? String(data.date)
          : entry.name.replace(/\.md$/, "")
        const slug = entry.name.replace(/\.md$/, "")
        files.push({ title, date, category: "", slug, relativePath: entry.name })
      }
      continue
    }

    const category = entry.name
    const catDir = path.join(researchDir, category)
    const catEntries = fs.readdirSync(catDir, { withFileTypes: true })

    for (const catEntry of catEntries) {
      if (!catEntry.isFile() || !catEntry.name.endsWith(".md")) continue
      const absPath = path.join(catDir, catEntry.name)
      const raw = fs.readFileSync(absPath, "utf-8")
      const { data, content } = matter(raw)
      const title =
        data.title ??
        content.match(/^#\s+(.+)$/m)?.[1] ??
        catEntry.name.replace(/\.md$/, "")
      const date = data.date
        ? String(data.date)
        : catEntry.name.replace(/\.md$/, "")
      const slug = `${category}/${catEntry.name.replace(/\.md$/, "")}`
      files.push({
        title,
        date,
        category,
        slug,
        relativePath: `${category}/${catEntry.name}`,
      })
    }
  }

  return files.sort((a, b) => b.date.localeCompare(a.date))
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/research-files.test.ts`

Expected: PASS — all 5 tests green.

**Step 5: Export from studio-core**

Add to `packages/studio-core/src/index.ts`, after the `// I/O` section:

```ts
export * from "./research-files"
```

**Step 6: Update project-scoped research page**

In `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`:

- Remove the local `ResearchFile` interface (lines 15-21)
- Remove the local `scanResearchFiles` function (lines 23-85)
- Add import: `import { scanResearchFiles, type ResearchFile } from "@/lib/studio";`
- Remove the `import fs from "node:fs"` and `import path from "node:path"` and `import matter from "gray-matter"` imports (they're no longer needed in this file)
- The rest of the component stays the same — it still calls `scanResearchFiles(project.root)`

**Step 7: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts packages/studio-core/src/index.ts apps/studio/src/app/\(studio\)/projects/\[project\]/research/page.tsx
git commit -m "refactor: extract scanResearchFiles to studio-core for reuse"
```

---

### Task 2: Add cross-project aggregate functions

Add `getAllResearchFiles()` and `getAllTasks()` to `cross-project.ts`. These iterate all registered projects and merge results with project metadata.

**Files:**
- Modify: `packages/studio-core/src/cross-project.ts`

**Step 1: Add research file aggregate**

At the top of `packages/studio-core/src/cross-project.ts`, add imports:

```ts
import { scanResearchFiles, type ResearchFile } from "./research-files"
import { getTaskBoard, type TaskBoardEntry } from "./tasks"
```

Then add after the existing `getAllInitiatives()` function:

```ts
export interface CrossProjectResearchFile extends ResearchFile {
  projectSlug: string
  projectName: string
}

/**
 * Get all research files across all projects, sorted by date descending.
 */
export function getAllResearchFiles(): CrossProjectResearchFile[] {
  const projects = getAllProjects()
  const result: CrossProjectResearchFile[] = []

  for (const project of projects) {
    const files = scanResearchFiles(project.root)
    for (const file of files) {
      result.push({
        ...file,
        projectSlug: project.slug,
        projectName: project.name,
      })
    }
  }

  return result.sort((a, b) => b.date.localeCompare(a.date))
}

export interface CrossProjectTask extends TaskBoardEntry {
  projectSlug: string
  projectName: string
}

/**
 * Get all tasks across all projects.
 */
export function getAllTasks(): CrossProjectTask[] {
  const projects = getAllProjects()
  const result: CrossProjectTask[] = []

  for (const project of projects) {
    const tasks = getTaskBoard({ projectRoot: project.root })
    for (const task of tasks) {
      result.push({
        ...task,
        projectSlug: project.slug,
        projectName: project.name,
      })
    }
  }

  return result
}
```

**Step 2: Typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

Expected: No new errors. The new types extend existing interfaces, and the function calls match existing signatures.

**Step 3: Commit**

```bash
git add packages/studio-core/src/cross-project.ts
git commit -m "feat: add getAllResearchFiles and getAllTasks to cross-project"
```

---

### Task 3: Fix sidebar aggregate routing

The sidebar currently sets `hrefPrefix = ""` when no project is active, generating links like `/process` that the middleware redirects to the primary project. Fix it to generate `/projects/process` links in aggregate mode. Also validate `activeProject` against the projects list so aggregate routes like `/projects/research` don't get misidentified as project slugs.

**Files:**
- Modify: `packages/studio-ui/src/studio-sidebar.tsx`

**Step 1: Update activeProject derivation**

In `packages/studio-ui/src/studio-sidebar.tsx`, replace the existing activeProject + hrefPrefix logic (around lines 108-113):

```ts
  // Derive active project from the URL: /projects/[slug]/...
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const activeProject = projectMatch?.[1] ?? null;

  // When a project is active, prefix all nav hrefs with /projects/{slug}
  const hrefPrefix = activeProject ? `/projects/${activeProject}` : "";
```

With:

```ts
  // Derive active project from the URL: /projects/[slug]/...
  // Validate against the projects list to avoid misidentifying aggregate
  // routes (e.g. /projects/research) as project slugs.
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
  const matchedSlug = projectMatch?.[1] ?? null
  const activeProject =
    matchedSlug && projects?.some((p) => p.slug === matchedSlug)
      ? matchedSlug
      : null

  // In aggregate mode, nav links point to /projects/{section}.
  // In project mode, nav links point to /projects/{slug}/{section}.
  const hrefPrefix = activeProject
    ? `/projects/${activeProject}`
    : "/projects"
```

**Step 2: Typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

Expected: No errors — `projects` prop is already `{ name: string; slug: string }[] | undefined`.

**Step 3: Commit**

```bash
git add packages/studio-ui/src/studio-sidebar.tsx
git commit -m "fix: sidebar generates /projects/{section} links in aggregate mode"
```

---

### Task 4: Fix project switcher section preservation

The switcher currently hard-navigates to `/projects` when switching to "All Projects". Fix it to preserve the current section (e.g., `/projects/sherpa/research` → `/projects/research`).

**Files:**
- Modify: `packages/studio-ui/src/project-switcher.tsx`

**Step 1: Update handleChange**

In `packages/studio-ui/src/project-switcher.tsx`, replace the existing `handleChange` function (lines 24-36):

```ts
  function handleChange(slug: string) {
    // Preserve current section when switching projects
    // e.g. /projects/sherpa/process → /projects/wavepoint/process
    if (slug === "__all__") {
      router.push("/projects")
      return
    }

    // Extract current section from pathname
    const match = pathname.match(/^\/projects\/[^/]+\/(.+)$/)
    const section = match?.[1] ?? "process"
    router.push(`/projects/${slug}/${section}`)
  }
```

With:

```ts
  function handleChange(slug: string) {
    // Determine the current top-level section from the URL.
    // Project-scoped: /projects/{slug}/{section}[/...]  → section from 3rd segment
    // Aggregate:      /projects/{section}[/...]         → section from 2nd segment
    let section = "process"

    if (activeProject) {
      // On a project-scoped route
      const match = pathname.match(/^\/projects\/[^/]+\/([^/]+)/)
      if (match) section = match[1]
    } else {
      // On an aggregate route or the projects landing
      const match = pathname.match(/^\/projects\/([^/]+)/)
      if (match) section = match[1]
    }

    if (slug === "__all__") {
      router.push(`/projects/${section}`)
      return
    }

    router.push(`/projects/${slug}/${section}`)
  }
```

**Step 2: Typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

Expected: No errors.

**Step 3: Commit**

```bash
git add packages/studio-ui/src/project-switcher.tsx
git commit -m "fix: project switcher preserves section when switching to/from All Projects"
```

---

### Task 5: Create aggregate research page

The highest-value aggregate view. Calls `getAllResearchFiles()` from cross-project.ts and renders a merged feed with project badges.

**Files:**
- Create: `apps/studio/src/app/(studio)/projects/research/page.tsx`

**Step 1: Create the aggregate research route**

Create `apps/studio/src/app/(studio)/projects/research/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getAllResearchFiles } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Research — All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function AggregateResearchPage() {
  const files = getAllResearchFiles();

  // Group by category
  const grouped = new Map<string, typeof files>();
  for (const file of files) {
    const key = file.category || "General";
    const existing = grouped.get(key) ?? [];
    existing.push(file);
    grouped.set(key, existing);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">
        Research
      </h1>

      {files.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No research files found across any project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(grouped.entries()).map(([category, categoryFiles]) => (
            <section key={category}>
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                {category}
              </h2>
              <div className="flex flex-col gap-1">
                {categoryFiles.map((file) => (
                  <Link
                    key={`${file.projectSlug}/${file.slug}`}
                    href={`/projects/${file.projectSlug}/research/${file.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {file.title}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {file.projectName}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {file.date}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify routing doesn't conflict**

The file lives at `projects/research/page.tsx` (static route). The existing `projects/[project]/research/page.tsx` is a dynamic route. Next.js App Router resolves `/projects/research` to the static route first. No conflict with `/projects/sherpa/research` which hits the dynamic route.

**Step 3: Typecheck and build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check && pnpm build`

Expected: Clean typecheck. Build succeeds with the new static route rendered.

**Step 4: Commit**

```bash
git add apps/studio/src/app/\(studio\)/projects/research/page.tsx
git commit -m "feat: add aggregate research page at /projects/research"
```

---

### Task 6: Verify Session 1

Run the full build and verify the sidebar + research aggregate work together.

**Step 1: Build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm build`

Expected: Successful build. The static route `/projects/research` is listed in the build output.

**Step 2: Smoke test (dev server)**

Run: `cd /Users/rob/Workbench/sherpa && pnpm dev`

Manual checks:
- Navigate to `/projects` → see project listing
- Select "All Projects" in the sidebar switcher → sidebar nav links point to `/projects/process`, `/projects/research`, etc.
- Click "Research" in sidebar → lands on `/projects/research` → shows research from all projects with project badges
- Switch to "Sherpa" in switcher → navigates to `/projects/sherpa/research` (preserves section)
- Switch back to "All Projects" → navigates to `/projects/research` (preserves section)

---

## Session 2: Process + Tasks + Landing

### Task 7: Create aggregate process page

Flat initiative list across all projects with status, type, and project badges. Links to project-scoped detail views.

**Files:**
- Create: `apps/studio/src/app/(studio)/projects/process/page.tsx`

**Step 1: Create the aggregate process route**

Create `apps/studio/src/app/(studio)/projects/process/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getAllInitiatives } from "@/lib/studio";
import { StatusBadge } from "@sherpa/studio-ui";

export const metadata: Metadata = {
  title: "Process — All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function AggregateProcessPage() {
  const initiatives = getAllInitiatives();

  // Sort by updated date descending
  const sorted = [...initiatives].sort(
    (a, b) =>
      (b.initiative.updated ?? "").localeCompare(a.initiative.updated ?? ""),
  );

  const statusCounts = new Map<string, number>();
  for (const item of sorted) {
    const s = item.initiative.status;
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Process</h1>
        <div className="flex items-center gap-2">
          {Array.from(statusCounts.entries()).map(([status, count]) => (
            <Badge key={status} variant="secondary" className="font-mono text-[10px]">
              {status} {count}
            </Badge>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No initiatives found across any project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.projectSlug}/process?node=${item.initiative.slug}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={item.initiative.status} />
                <span className="text-sm text-foreground">
                  {item.initiative.title || item.initiative.slug}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {item.projectName}
                </Badge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {item.initiative.updated}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

> **Note:** Verify `StatusBadge` exists and accepts a `status` prop by reading `packages/studio-ui/src/status-badge.tsx` before implementing. If the API differs, adjust the import and props accordingly. If `StatusBadge` doesn't render initiative statuses, use a plain `Badge` with variant mapping instead.

**Step 2: Typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/app/\(studio\)/projects/process/page.tsx
git commit -m "feat: add aggregate process page at /projects/process"
```

---

### Task 8: Create aggregate tasks page

Task board across all projects. Uses a flat list rather than the full `MissionWorkspace` — the workspace's detail pane needs a single `projectRoot` for log resolution, which doesn't apply in aggregate mode.

**Files:**
- Create: `apps/studio/src/app/(studio)/projects/tasks/page.tsx`

**Step 1: Create the aggregate tasks route**

Create `apps/studio/src/app/(studio)/projects/tasks/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getAllTasks } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Tasks — All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function AggregateTasksPage() {
  const tasks = getAllTasks();

  // Group by status for a quick summary
  const statusCounts = new Map<string, number>();
  for (const task of tasks) {
    statusCounts.set(task.status, (statusCounts.get(task.status) ?? 0) + 1);
  }

  // Sort: pending/dispatched first, then by created date descending
  const STATUS_ORDER: Record<string, number> = {
    dispatched: 0,
    pending: 1,
    completed: 2,
    reviewed: 3,
    failed: 4,
  };
  const sorted = [...tasks].sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 99;
    const sb = STATUS_ORDER[b.status] ?? 99;
    if (sa !== sb) return sa - sb;
    return (b.created ?? "").localeCompare(a.created ?? "");
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Tasks</h1>
        <div className="flex items-center gap-2">
          {Array.from(statusCounts.entries()).map(([status, count]) => (
            <Badge key={status} variant="secondary" className="font-mono text-[10px]">
              {status} {count}
            </Badge>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No tasks found across any project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map((task) => (
            <Link
              key={`${task.projectSlug}/${task.id}`}
              href={`/projects/${task.projectSlug}/tasks?node=${task.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    task.status === "dispatched"
                      ? "default"
                      : task.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                  className="font-mono text-[10px]"
                >
                  {task.status}
                </Badge>
                <span className="text-sm text-foreground">
                  {task.title || task.id}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {task.projectName}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                {task.role && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {task.role}
                  </span>
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  {task.created}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/app/\(studio\)/projects/tasks/page.tsx
git commit -m "feat: add aggregate tasks page at /projects/tasks"
```

---

### Task 9: Enhance projects landing with stats

Replace the basic project card grid with summary stats per project so the landing page serves as a portfolio dashboard.

**Files:**
- Modify: `apps/studio/src/app/(studio)/projects/page.tsx`

**Step 1: Update the projects landing**

Replace `apps/studio/src/app/(studio)/projects/page.tsx` with a version that shows per-project stats:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  getAllProjects,
  getInitiatives,
  getProjectContext,
  getTaskBoard,
} from "@/lib/studio";
import { scanResearchFiles } from "@/lib/studio";

export const metadata: Metadata = {
  title: "All Projects | Studio",
  robots: "noindex, nofollow",
};

export default async function ProjectsPage() {
  const projects = getAllProjects();

  const projectStats = projects.map((project) => {
    const ctx = getProjectContext(project.slug);
    const initiativeCount = ctx ? getInitiatives(ctx).length : 0;
    const taskCount = getTaskBoard({ projectRoot: project.root }).length;
    const researchCount = scanResearchFiles(project.root).length;

    return { ...project, initiativeCount, taskCount, researchCount };
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">Projects</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projectStats.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}/process`}
            className="group rounded-xl border border-border/50 bg-card/30 p-5 transition-colors hover:border-[var(--color-gold)]/20 hover:bg-card/50"
          >
            <h2 className="font-display text-lg text-foreground group-hover:text-[var(--color-gold)] transition-colors">
              {project.name}
            </h2>
            {project.remote && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground/60 truncate">
                {project.remote}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {project.initiativeCount > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {project.initiativeCount} initiatives
                </Badge>
              )}
              {project.taskCount > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {project.taskCount} tasks
                </Badge>
              )}
              {project.researchCount > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {project.researchCount} research
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/app/\(studio\)/projects/page.tsx
git commit -m "feat: enhance projects landing with per-project stats"
```

---

### Task 10: Final verification

**Step 1: Full typecheck and build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check && pnpm build`

Expected: Clean typecheck. Build succeeds with all four routes.

**Step 2: Run tests**

Run: `cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/research-files.test.ts`

Expected: All tests pass.

**Step 3: Smoke test aggregate views**

Run: `cd /Users/rob/Workbench/sherpa && pnpm dev`

Verify:
- `/projects` — project cards with stats badges
- `/projects/research` — merged research feed with project badges, links to project-scoped detail
- `/projects/process` — flat initiative list with status + project badges, links to project-scoped detail
- `/projects/tasks` — flat task list with status + project badges, links to project-scoped detail
- Sidebar switcher preserves section in both directions
- Sidebar nav links in aggregate mode point to `/projects/{section}`

---

## Architecture Notes

### Routing Strategy

Static routes take priority over dynamic segments in Next.js App Router:

```
projects/
  page.tsx                          → /projects         (landing)
  research/page.tsx                 → /projects/research (aggregate, static)
  process/page.tsx                  → /projects/process  (aggregate, static)
  tasks/page.tsx                    → /projects/tasks    (aggregate, static)
  [project]/
    layout.tsx                      → validates slug
    process/page.tsx                → /projects/{slug}/process  (scoped)
    research/page.tsx               → /projects/{slug}/research (scoped)
    research/[...slug]/page.tsx     → /projects/{slug}/research/{path} (detail)
    tasks/page.tsx                  → /projects/{slug}/tasks    (scoped)
```

No collision: `/projects/research` hits the static route. `/projects/sherpa/research` hits the dynamic route. The `[project]/layout.tsx` calls `notFound()` for invalid slugs as a safety net.

### Middleware — No Changes Needed

The middleware redirects bare routes (`/process` → `/projects/sherpa/process`). With the sidebar fix generating `/projects/process` links in aggregate mode, these bare routes are no longer used. Keeping the middleware redirects is backwards-compatible for bookmarks and external links.

### Data Flow

```
Aggregate page (Server Component)
  → getAllResearchFiles() / getAllInitiatives() / getAllTasks()
    → getAllProjects() (from project registry)
      → for each project:
          scanResearchFiles(project.root) / getInitiatives(ctx) / getTaskBoard({projectRoot})
            → reads .sherpa/research/ or docs/initiatives/ or docs/tasks/
    → merge + sort + decorate with projectSlug/projectName
  → render flat list with Badge per item
  → Link to project-scoped detail: /projects/{projectSlug}/{section}/{slug}
```

### Seeds

- **Activity stream** — Cross-project activity feed at `/projects/activity`. Requires design for event merging across `activity.md` files.
- **Project filter chips** — Add filter-by-project chips to aggregate views for narrowing without switching.
- **Slug collision validation** — Add config loader validation that project slugs don't collide with known section names (`process`, `research`, `tasks`, etc.).
