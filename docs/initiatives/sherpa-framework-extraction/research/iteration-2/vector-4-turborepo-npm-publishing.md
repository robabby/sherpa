# Research: Turborepo Internal Packages + Changesets Publishing Workflow

**Research question:** What is the concrete workflow for developing internal packages in a Turborepo monorepo and publishing them to npm via Changesets?

**Context:** Sherpa Framework Extraction — packages live in WavePoint monorepo during dev, published to npm for `../sherpa` consumption.

**Date:** 2026-03-11

---

## 1. Turborepo Internal Packages

### Three Package Strategies

Turborepo defines three "compilation strategies" for internal packages ([source](https://turborepo.dev/docs/core-concepts/internal-packages)):

| Strategy | Build step? | Cacheable? | Use case |
|----------|------------|------------|----------|
| **Just-in-Time (JIT)** | No | No | Dev speed, minimal config |
| **Compiled** | Yes (tsc) | Yes | Type safety, caching |
| **Publishable** | Yes (tsup) | Yes | npm distribution |

### Just-in-Time Package (`package.json`)

Exports point directly at TypeScript source. The consuming app's bundler (Next.js, Vite) transpiles it. This is what `@wavepoint/content` does today.

```json
{
  "name": "@repo/ui",
  "private": true,
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit"
  }
}
```

**Key characteristics:**
- `"private": true` — not publishable
- No `main`, `module`, or `types` fields needed
- No build script
- Consumer must have `transpilePackages: ["@repo/ui"]` in next.config (Next.js)
- Cannot use TypeScript `compilerOptions.paths` — consumer can't resolve them ([source](https://turborepo.dev/docs/core-concepts/internal-packages))

### Compiled Package (`package.json`)

```json
{
  "name": "@repo/math",
  "private": true,
  "type": "module",
  "exports": {
    "./add": {
      "types": "./src/add.ts",
      "default": "./dist/add.js"
    },
    "./subtract": {
      "types": "./src/subtract.ts",
      "default": "./dist/subtract.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

**Key difference from JIT:** Has a `build` script, `dist/` output, and Turborepo can cache results. Types still point at source (faster DX) while runtime points at compiled output. ([source](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package))

### Publishable Package (`package.json`)

```json
{
  "name": "@sherpa/studio-core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./governance": {
      "types": "./dist/governance.d.ts",
      "import": "./dist/governance.mjs",
      "require": "./dist/governance.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts src/governance.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts src/governance.ts --format cjs,esm --dts --watch",
    "check-types": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

**Critical differences from internal:**
- No `"private": true`
- Has `version` field (managed by Changesets)
- Has `files` field (controls what npm publishes — typically just `["dist"]`)
- `exports` map to `dist/` compiled output, not `src/`
- `types` field points at `.d.ts` in `dist/`, not `.ts` source
- `peerDependencies` for React (not bundled)
- `publishConfig.access` for scoped packages

([source](https://turborepo.dev/docs/guides/publishing-libraries))

### Workspace Dependency Syntax (pnpm)

Internal consumers reference packages with workspace protocol:

```json
{
  "dependencies": {
    "@sherpa/studio-core": "workspace:*"
  }
}
```

**Critical detail:** When Changesets publishes to npm, `workspace:*` is automatically replaced with the actual version number (e.g., `"@sherpa/studio-core": "^0.1.0"`). This conversion is handled by pnpm itself during `pnpm publish`. ([source](https://pnpm.io/workspaces))

### turbo.json Task Configuration

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

`"dependsOn": ["^build"]` means: build this package's dependencies first. `"outputs": ["dist/**"]` tells Turborepo what to cache. ([source](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package))

---

## 2. Changesets Workflow

### Installation & Init

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

Creates `.changeset/` directory with `config.json` and a README. ([source](https://pnpm.io/using-changesets))

### `.changeset/config.json` — Full Reference

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `changelog` | string or [string, options] | `"@changesets/cli/changelog"` | Changelog generator. Can use `"@changesets/changelog-github"` for PR links |
| `commit` | boolean | `false` | Auto-commit version bumps |
| `fixed` | string[][] | `[]` | Package groups that always version together (same version even without changes) |
| `linked` | string[][] | `[]` | Package groups that share highest version (only bumped packages are published) |
| `access` | `"public"` or `"restricted"` | `"restricted"` | npm publish access for scoped packages |
| `baseBranch` | string | `"main"` | Branch Changesets compares against |
| `updateInternalDependencies` | `"patch"` or `"minor"` | `"patch"` | Minimum bump for dependent packages |
| `ignore` | string[] | `[]` | Packages excluded from changesets (e.g., internal-only or example packages) |
| `bumpVersionsWithWorkspaceProtocolOnly` | boolean | `false` | Only bump packages using `workspace:` protocol |

([source](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md))

### `fixed` vs `linked` — The Key Distinction

**Fixed:** All packages in the group are always version-bumped and published together, even if only one changed. Use for tightly coupled packages that consumers expect to have the same version.

```json
{
  "fixed": [["@sherpa/studio-core", "@sherpa/studio-ui", "@sherpa/studio"]]
}
```

**Linked:** Only packages with actual changesets are bumped, but they all jump to the highest version in the group. Use for packages that should track the same version when changed, but don't need lockstep releases.

```json
{
  "linked": [["@sherpa/studio-core", "@sherpa/studio-ui"]]
}
```

([source](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md), [source](https://github.com/changesets/changesets/blob/main/docs/linked-packages.md))

### The Three-Phase Flow

#### Phase 1: Add (during development)

```bash
pnpm changeset
```

Interactive prompts:
1. Which packages changed? (space to select)
2. Semver bump type per package? (major/minor/patch)
3. Summary of changes? (user-facing description)

Creates a markdown file in `.changeset/`:

```markdown
---
"@sherpa/studio-core": minor
"@sherpa/studio-ui": patch
---

Add initiative lifecycle state machine to governance module
```

Multiple changesets can accumulate before a release. Commit them with your code. ([source](https://dtech.vision/guides/npm-changesets-complete-guide/))

#### Phase 2: Version (pre-release)

```bash
pnpm changeset version
```

This command:
1. Reads all accumulated changeset files
2. Calculates new version numbers (flattens multiple bumps per package)
3. Updates `package.json` version fields
4. Generates/updates `CHANGELOG.md` files per package
5. Deletes consumed changeset files
6. Updates internal dependency versions automatically

**After versioning, sync the lockfile:**
```bash
pnpm install
```

([source](https://pnpm.io/using-changesets))

#### Phase 3: Publish

```bash
pnpm publish -r
```

Or via Changesets:
```bash
pnpm changeset publish
```

Publishes all packages with bumped versions not yet on the registry. The `workspace:*` protocol is automatically converted to real version ranges. ([source](https://pnpm.io/using-changesets))

### Root `package.json` Scripts

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version && pnpm install",
    "publish-packages": "turbo run build && changeset publish"
  }
}
```

Or combined with quality checks (from Turborepo docs):
```json
{
  "scripts": {
    "publish-packages": "turbo run build lint test && changeset version && changeset publish"
  }
}
```

([source](https://turborepo.dev/docs/guides/publishing-libraries))

### CI/CD with GitHub Actions

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - uses: changesets/action@v1
        with:
          commit: "chore: update versions"
          title: "chore: update versions"
          publish: pnpm run publish-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The `changesets/action` creates a "Version Packages" PR that auto-updates as new changesets arrive. Merging the PR triggers the publish step. ([source](https://pnpm.io/using-changesets), [source](https://dtech.vision/guides/npm-changesets-complete-guide/))

### Verification

```bash
pnpm changeset status          # Show pending changesets
npm pack --dry-run              # Preview what gets published
npm view @sherpa/studio-core    # Check published version
```

---

## 3. Local Testing Before Publishing

### Option Comparison

| Method | Fidelity | Complexity | Best for |
|--------|----------|-----------|----------|
| `pnpm link` | Low | Low | Quick iteration, same machine |
| `npm pack` + install | High | Medium | Pre-publish validation |
| `yalc` | Medium-High | Low | Ongoing local dev across repos |
| `verdaccio` | Highest | High | CI, team workflows |

### `pnpm link` (Symlink)

```bash
# In the package directory
cd packages/studio-core
pnpm link --global

# In the consumer
cd ../sherpa
pnpm link --global @sherpa/studio-core
```

**Trade-offs:**
- Fast, zero build overhead
- Symlink can cause duplicate React instances (two `node_modules/react`)
- Module resolution differences vs real install
- `peerDependencies` may not resolve correctly
- Does NOT test the published artifact (no `files` filtering, no build step)

([source](https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-npm-yalc-3l97))

### `npm pack` / `pnpm pack` (Tarball)

```bash
# Build and pack the package
cd packages/studio-core
pnpm build
pnpm pack
# Creates sherpa-studio-core-0.1.0.tgz

# Install in consumer
cd ../sherpa
pnpm add ../wavepoint/packages/studio-core/sherpa-studio-core-0.1.0.tgz
```

**Trade-offs:**
- Highest fidelity — exactly what npm would install
- Respects `files` field and `.npmignore`
- Requires rebuild + repack + reinstall on every change
- Cache can be stale — use `--force --no-cache` for reinstalls
- Version must change or cache won't update

**Pro tip:** `npm pack --dry-run` shows what will be included without creating a file.

([source](https://blog.rnsloan.com/2025/01/11/local-npm-package-testing-made-simple-a-guide-to-npm-pack/), [source](https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e))

### `yalc` (Local Registry Lite)

```bash
# Install globally
npm i yalc -g

# In the package directory
cd packages/studio-core
pnpm build
yalc publish

# In the consumer
cd ../sherpa
yalc add @sherpa/studio-core

# Update after changes
cd packages/studio-core
pnpm build
yalc publish --push    # Auto-updates all consumers
```

**Trade-offs:**
- Copies files (not symlinks) — avoids duplicate dependency issues
- `--push` auto-updates all projects that `yalc add`-ed the package
- Creates a `.yalc` directory and modifies `package.json` in the consumer (must not commit)
- Better DX than `npm pack` for ongoing iteration
- Still not perfectly representative of npm install (no registry resolution)

([source](https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-npm-yalc-3l97))

### `verdaccio` (Local npm Registry)

```bash
# Install and start
npm install --global verdaccio
verdaccio    # Runs on http://localhost:4873

# Configure scope in .npmrc
echo "@sherpa:registry=http://localhost:4873" >> .npmrc

# Create user
npm adduser --registry http://localhost:4873

# Publish to local registry
cd packages/studio-core
pnpm build
npm publish --registry http://localhost:4873

# Install from local registry in consumer
cd ../sherpa
pnpm add @sherpa/studio-core    # .npmrc routes to local registry
```

**Trade-offs:**
- Perfect fidelity — exactly mimics npm install
- Tests the full publish → install → resolve cycle
- Requires running a local server
- Overkill for solo developer, valuable for CI/team

([source](https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-verdaccio-5hd8))

### Recommendation for Sherpa

**Primary: `yalc`** for day-to-day development. Best balance of fidelity and DX for a solo dev iterating across two repos.

**Validation: `pnpm pack`** before publishing. Run `npm pack --dry-run` to verify `files` field, then install the tarball in `../sherpa` for a final check.

**Skip:** `verdaccio` (overkill for solo dev) and `pnpm link` (too many footguns with React peer deps).

---

## 4. Internal-to-Publishable Transition

### What Changes

| Concern | Internal (JIT) | Publishable |
|---------|----------------|-------------|
| `private` | `true` | removed or `false` |
| `version` | `"0.0.0"` or `"0.1.0"` | Managed by Changesets |
| `exports` | `"./foo": "./src/foo.ts"` | `"./foo": { "types": "...", "import": "...", "require": "..." }` |
| `main` | absent | `"./dist/index.js"` |
| `module` | absent | `"./dist/index.mjs"` |
| `types` | absent | `"./dist/index.d.ts"` |
| `files` | absent | `["dist"]` |
| `scripts.build` | absent or `tsc --noEmit` | `tsup src/index.ts --format cjs,esm --dts` |
| `peerDependencies` | absent | React, etc. |
| `publishConfig` | absent | `{ "access": "public" }` |
| `devDependencies` | minimal | + `tsup`, `typescript` |

### Build Tool: tsup

tsup is the recommended choice for Turborepo publishable packages ([source](https://turborepo.dev/docs/guides/publishing-libraries)). It uses esbuild under the hood.

**Why tsup over alternatives:**
- **vs tsc:** tsc can't bundle, can't output ESM+CJS from one config, slower
- **vs unbuild:** unbuild uses rollup (slower than esbuild), less adoption
- **vs esbuild/swc directly:** No built-in `.d.ts` generation; need separate `tsc --emitDeclarationOnly` step
- **vs tsdown:** Newer (rolldown-based), not yet mature enough for production

([source](https://blog.atomrc.dev/p/typescript-library-compilation-2023/))

**Performance benchmarks** (library compilation):
- Without `.d.ts`: esbuild 427ms, tsup 570ms, tsc 2,196ms
- With `.d.ts`: All converge to ~2,000ms (`.d.ts` generation is the bottleneck regardless)

([source](https://blog.atomrc.dev/p/typescript-library-compilation-2023/))

### `tsup.config.ts` for React Component Library

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/governance.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  external: ["react", "react-dom"],
  sourcemap: true,
  target: "es2022",
});
```

**Key options:**
- `format: ["cjs", "esm"]` — dual output for maximum compatibility
- `dts: true` — generates `.d.ts` files (uses tsc internally)
- `external: ["react", "react-dom"]` — don't bundle React (it's a peerDependency)
- `splitting: true` — enables tree-shaking
- `clean: true` — clears dist/ before build

### The `.d.ts` Gotcha

When publishing, `types` in the `exports` map must point at generated `.d.ts` files, NOT source `.ts` files. Source `.ts` files won't exist in the published package.

```json
// WRONG for published packages
"exports": {
  ".": {
    "types": "./src/index.ts",  // Source won't exist in npm package
    "default": "./dist/index.js"
  }
}

// CORRECT for published packages
"exports": {
  ".": {
    "types": "./dist/index.d.ts",  // Generated declaration file
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
  }
}
```

This is a critical gotcha when transitioning from internal (where pointing types at source is fine because the source is always available via workspace) to published (where only `files: ["dist"]` is shipped). ([source](https://turborepo.dev/docs/core-concepts/internal-packages))

---

## 5. Real-World Examples

### Vercel's Turborepo Design System Template

The official reference implementation ([source](https://github.com/vercel/turborepo/tree/main/examples/design-system)):

```
.changeset/
.github/workflows/
apps/
  docs/              # Storybook documentation
packages/
  ui/                # Published React components
  typescript-config/ # Shared tsconfig (internal)
  eslint-config/     # Shared ESLint config (internal)
```

**UI package build:**
```bash
tsup src/*.tsx --format esm,cjs --dts --external react
```

**Release script (root):**
```json
{
  "release": "turbo run build --filter=docs^... && changeset publish"
}
```

**Key pattern:** Config packages (`typescript-config`, `eslint-config`) stay internal and private. Only the UI package is published. The template is the canonical example of mixed internal + publishable packages.

### Nhost Monorepo

Real production monorepo with pnpm + Turborepo + Changesets ([source](https://nhost.io/blog/how-we-configured-pnpm-and-turborepo-for-our-monorepo)):
- Multiple published packages with `main`, `module`, `types`, and `exports` fields
- Used Vite to generate ESM, CJS, and UMD bundles
- `npx only-allow pnpm` preinstall script to enforce package manager
- Config packages in a dedicated `config/` directory

### shadcn/ui Monorepo Pattern

shadcn/ui uses a Turborepo monorepo with internal packages for development and `pnpm changeset` for publishing the CLI package ([source](https://ui.shadcn.com/docs/monorepo)). The UI components are not published as an npm package — they're installed via the CLI as source files. But the CLI itself follows the standard publishable pattern.

### Other Notable Examples

- **Astro** — uses Changesets for coordinated releases across `astro`, `@astrojs/*` packages
- **Chakra UI** — Turborepo + Changesets for publishing `@chakra-ui/*` packages
- **Remix** — Changesets for the `@remix-run/*` package family
- **SvelteKit** — Changesets for `@sveltejs/*` packages

([source](https://github.com/changesets/changesets))

---

## 6. Gotchas and Pain Points

### TypeScript Path Aliases

**Problem:** JIT packages cannot use `compilerOptions.paths`. The consuming app's TypeScript doesn't know about the package's path aliases.

**Solution:** Use Node.js subpath imports (TypeScript 5.4+) or restructure to avoid aliases. For published packages, tsup resolves paths at build time, so this is only an issue during the JIT phase.

([source](https://github.com/vercel/turborepo/discussions/620), [source](https://turborepo.dev/docs/guides/tools/typescript))

### CSS / Tailwind in Published Packages

**Problem:** Tailwind CSS classes from a published package component won't work unless the consumer's Tailwind config scans the package's files.

**Solutions:**
1. Consumer adds package path to `content` in `tailwind.config`:
   ```js
   content: [
     "./node_modules/@sherpa/studio-ui/dist/**/*.{js,mjs}",
   ]
   ```
2. Ship CSS variables instead of Tailwind classes (more portable)
3. Use CSS-in-JS or vanilla-extract for zero-config consumption

**Problem:** CSS Modules from internal packages cause TypeScript errors (`Cannot find module './component.module.css'`).

([source](https://github.com/vercel/turborepo/issues/6435), [source](https://github.com/vercel/turborepo/discussions/10543))

### Peer Dependencies

**Problem:** When `pnpm link` or workspace resolution puts React in two `node_modules` trees, you get "Invalid hook call" errors from duplicate React.

**Solution:** Always declare React as `peerDependencies` in published packages. When using `yalc` or `npm pack` for testing, this is resolved correctly. `pnpm link` is the worst offender.

### `workspace:*` at Publish Time

**Problem:** If you forget that `workspace:*` gets replaced during publish, you might not realize a consumer will get `^0.1.0` instead of a live workspace link.

**Non-problem:** pnpm handles this automatically. But you must run `pnpm install` after `changeset version` to sync the lockfile. Forgetting this step causes stale lockfiles.

([source](https://pnpm.io/workspaces))

### Forgetting `files` Field

**Problem:** Without `"files": ["dist"]`, npm publishes everything — source code, tests, configs, docs. Package size balloons.

**Solution:** Always set `"files": ["dist"]` and verify with `npm pack --dry-run`.

### Build Order in Turborepo

**Problem:** If package A depends on package B, and both are publishable, package B must build before package A.

**Solution:** `"dependsOn": ["^build"]` in `turbo.json` handles this automatically. But forgetting to add it causes runtime errors where A imports from B's `dist/` before it exists.

### Changeset for Internal Changes

**Problem:** You change an internal-only package but `changeset status` on CI fails because there's no changeset.

**Solution:** Add internal-only packages to the `ignore` list in `.changeset/config.json`:
```json
{
  "ignore": ["@wavepoint/web", "@repo/typescript-config"]
}
```

---

## 7. Concrete Templates for Sherpa

### Phase 1: Internal JIT Package (during extraction)

```json
{
  "name": "@sherpa/studio-core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./governance": "./src/governance/index.ts",
    "./tasks": "./src/tasks/index.ts",
    "./lifecycle": "./src/lifecycle/index.ts",
    "./velocity": "./src/velocity/index.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

At this stage: maximum dev speed, no build step, Sherpa's Next.js transpiles via `transpilePackages`. Validates module boundaries without publishing overhead.

### Phase 2: Compiled Internal (add caching)

```json
{
  "name": "@sherpa/studio-core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./dist/index.js"
    },
    "./governance": {
      "types": "./src/governance/index.ts",
      "default": "./dist/governance/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

At this stage: Turborepo caches builds, types still point at source for fast IDE experience. Still private, not published.

### Phase 3: Publishable (ready for npm)

```json
{
  "name": "@sherpa/studio-core",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "description": "Governance, task management, and workflow primitives for Human+AI collaborative workflows",
  "repository": {
    "type": "git",
    "url": "https://github.com/robabby/wavepoint",
    "directory": "packages/sherpa-studio-core"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./governance": {
      "types": "./dist/governance.d.ts",
      "import": "./dist/governance.mjs",
      "require": "./dist/governance.js"
    },
    "./tasks": {
      "types": "./dist/tasks.d.ts",
      "import": "./dist/tasks.mjs",
      "require": "./dist/tasks.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "check-types": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.8.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

With `tsup.config.ts`:
```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/governance.ts", "src/tasks.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  external: ["react", "react-dom"],
  sourcemap: true,
  target: "es2022",
});
```

### `.changeset/config.json` for Sherpa

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [
    ["@sherpa/studio-core", "@sherpa/studio-ui", "@sherpa/studio"]
  ],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@wavepoint/web",
    "@wavepoint/content"
  ]
}
```

**Rationale for `fixed`:** Sherpa packages release together as a cohesive framework. Consumers should be able to assume `@sherpa/studio-core@0.3.0` and `@sherpa/studio-ui@0.3.0` are compatible without checking a compatibility matrix.

---

## Implications for Sherpa Extraction Strategy

1. **Start JIT, graduate to publishable.** Extract modules as `private: true` JIT packages first. Validate boundaries inside WavePoint. Then add tsup build + Changesets when ready for `../sherpa` to consume from npm. This matches the proposal's Phase 1 → Phase 3 gating.

2. **`@wavepoint/content` is the precedent.** It already uses the JIT pattern (`exports` pointing at `.ts` source, no build step, `private: true`). The Sherpa packages follow the same pattern during extraction, then graduate.

3. **Use `fixed` mode in Changesets.** Since `@sherpa/studio-core`, `@sherpa/studio-ui`, and `@sherpa/studio` are a cohesive framework, consumers expect version alignment. Fixed mode guarantees this.

4. **`yalc` for local dev, `pnpm pack` for validation.** During the transition period where packages are being extracted but `../sherpa` needs to consume them, yalc provides the best DX. Reserve `pnpm pack` for pre-publish smoke tests.

5. **`files: ["dist"]` is critical.** Without it, source code, tests, and WavePoint-specific configs leak into the published package. Verify with `npm pack --dry-run`.

6. **CSS strategy matters early.** If `@sherpa/studio-ui` uses Tailwind, consumers must configure content scanning. CSS variables are more portable. Decide before extraction, not after.

7. **The `workspace:*` → semver conversion is automatic** but requires `pnpm install` after `changeset version`. Script it to prevent lockfile drift.

8. **`pnpm-workspace.yaml` needs updating.** Currently:
   ```yaml
   packages:
     - "apps/web"
     - "packages/*"
   ```
   New Sherpa packages in `packages/sherpa-studio-core/`, `packages/sherpa-studio-ui/`, etc. will be automatically included by the `packages/*` glob. No config change needed unless packages go elsewhere.

---

## Open Questions

1. **Single repo or separate `@sherpa` scope?** npm scopes are free for public packages. Should Sherpa packages use `@sherpa/studio-*` (cleaner branding) or `@wavepoint/studio-*` (simpler setup)? Scoped packages require the org to exist on npm.

2. **When to add Turborepo?** WavePoint doesn't currently use Turborepo (`turbo.json` doesn't exist). Adding it is a separate decision from Changesets. Changesets works fine without Turborepo — just loses the build caching and `dependsOn` ordering. Is the complexity worth it for 3-5 packages?

3. **Monorepo-local vs npm for WavePoint consumption.** When Sherpa packages are published, should WavePoint itself consume from npm (dogfooding the published artifact) or continue using `workspace:*`? The workspace version has better DX, but the npm version tests what external consumers get.

4. **CI/CD timing.** When should the GitHub Actions release workflow be set up? Premature automation adds maintenance burden. But manual publishing is error-prone. The proposal's Phase 3 gating gives time to decide.

5. **Convention packages.** The three-channel architecture (code/executable/prose) means only `@sherpa/studio-core`, `@sherpa/studio-ui`, and `@sherpa/studio-mcp` go through npm. Skills, rules, and roles use different distribution. How do Changesets and npm publishing interact with the non-npm channels?

---

## Sources

### Primary Documentation
- [Turborepo: Internal Packages](https://turborepo.dev/docs/core-concepts/internal-packages) — Three package strategies (JIT, Compiled, Publishable)
- [Turborepo: Creating an Internal Package](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package) — Step-by-step guide with package.json and tsconfig
- [Turborepo: Publishing Libraries](https://turborepo.dev/docs/guides/publishing-libraries) — tsup config, Changesets integration, publishing workflow
- [Turborepo: Structuring a Repository](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository) — Monorepo layout conventions
- [Turborepo: TypeScript](https://turborepo.dev/docs/guides/tools/typescript) — Path aliases, subpath imports, project references
- [Changesets: Config File Options](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) — Full config.json reference
- [Changesets: Linked Packages](https://github.com/changesets/changesets/blob/main/docs/linked-packages.md) — Linked versioning strategy
- [Changesets: Fixed Packages](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md) — Fixed versioning strategy
- [Changesets CLI README](https://github.com/changesets/changesets/blob/main/packages/cli/README.md) — CLI command reference
- [pnpm: Using Changesets](https://pnpm.io/using-changesets) — pnpm-specific Changesets workflow
- [pnpm: Workspaces](https://pnpm.io/workspaces) — Workspace protocol and publishing behavior

### Guides and Tutorials
- [dTech: Complete Guide to Publishing NPM Packages with Changesets](https://dtech.vision/guides/npm-changesets-complete-guide/) — End-to-end workflow with CI/CD
- [Vercel Academy: Changesets for Versioning](https://vercel.com/academy/production-monorepos/changesets-versioning) — Vercel's production monorepo guide
- [Blog: Local npm Package Testing with npm pack](https://blog.rnsloan.com/2025/01/11/local-npm-package-testing-made-simple-a-guide-to-npm-pack/) — npm pack workflow
- [DEV.to: Testing Packages Locally (npm/yalc)](https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-npm-yalc-3l97) — Comparison of local testing approaches
- [DEV.to: Testing Packages Locally (Verdaccio)](https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-verdaccio-5hd8) — Verdaccio setup and workflow
- [DEV.to: Publish TypeScript React Library in Monorepo](https://dev.to/tresorama/publish-a-typescript-react-library-to-npm-in-a-monorepo-1ah1) — End-to-end React library publishing
- [Blog: Compiling TypeScript Libraries (tsup, swc, esbuild, tsc)](https://blog.atomrc.dev/p/typescript-library-compilation-2023/) — Build tool benchmarks
- [Nhost: How We Configured pnpm and Turborepo](https://nhost.io/blog/how-we-configured-pnpm-and-turborepo-for-our-monorepo) — Production monorepo config
- [Medium: My Quest for the Perfect TS Monorepo](https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb) — Deep dive on monorepo challenges
- [DEV.to: Use npm pack to Test Packages Locally](https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e) — npm pack testing workflow
- [Medium: Monorepo with pnpm and Changesets](https://medium.com/@anandkumar.code/how-a-monorepo-pnpm-and-changesets-transformed-my-multi-package-workflow-7c1771bba898) — pnpm + Changesets workflow

### Templates and Examples
- [Vercel: Design System with Turborepo (Template)](https://vercel.com/templates/react/turborepo-design-system) — Official Turborepo template with Changesets
- [GitHub: Turborepo Design System Example](https://github.com/vercel/turborepo/tree/main/examples/design-system) — Source code of official template
- [GitHub: Turborepo Design System README](https://github.com/vercel/turborepo/blob/main/examples/design-system/README.md) — Setup instructions
- [Vercel: Production Monorepos Academy](https://vercel.com/academy/production-monorepos) — Full Vercel monorepo course
- [Vercel: Monorepo Starter Templates](https://vercel.com/templates/monorepos) — All Turborepo starter templates
- [shadcn/ui: Monorepo](https://ui.shadcn.com/docs/monorepo) — shadcn monorepo setup guide

### GitHub Discussions (Gotchas)
- [Turborepo: TypeScript paths in monorepo (#620)](https://github.com/vercel/turborepo/discussions/620) — Path alias issues
- [Turborepo: Path aliases in packages (#4304)](https://github.com/vercel/turborepo/discussions/4304) — More path alias discussion
- [Turborepo: Compile & publish JIT package (#9550)](https://github.com/vercel/turborepo/discussions/9550) — JIT to published transition
- [Turborepo: Internal packages in Node server (#4509)](https://github.com/vercel/turborepo/discussions/4509) — Non-Next.js consumers
- [Turborepo: How to publish packages to npm (#910)](https://github.com/vercel/turborepo/discussions/910) — Publishing workflow discussion
- [Turborepo: CSS imports from node_modules (#10543)](https://github.com/vercel/turborepo/discussions/10543) — CSS import issues
- [Turborepo: CSS Modules TypeScript errors (#6435)](https://github.com/vercel/turborepo/issues/6435) — CSS Module typing issues
- [Turborepo: ESLint + path aliases (#8711)](https://github.com/vercel/turborepo/issues/8711) — ESLint integration issues
- [Changesets: Does it work with npm workspaces? (#922)](https://github.com/changesets/changesets/discussions/922) — npm workspace compatibility
- [Changesets: Fixed and linked with apps (#1072)](https://github.com/changesets/changesets/discussions/1072) — Fixed vs linked clarification
- [pnpm: Test library with normal install (#3510)](https://github.com/pnpm/pnpm/issues/3510) — Testing workspace packages as installed

### Reference Documentation
- [npm Docs: package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) — Official package.json reference
- [npm Docs: npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/) — npm pack command reference
- [npm Docs: npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) — npm publish command reference
- [Node.js: Package Exports](https://nodejs.org/api/packages.html) — Official exports field documentation
- [Changesets: config.json schema](https://github.com/changesets/changesets/blob/main/packages/config/schema.json) — JSON schema for validation
- [GitHub: Changesets own config.json](https://github.com/changesets/changesets/blob/main/.changeset/config.json) — Changesets' own dogfooded config
- [Turborepo Blog: You Might Not Need TypeScript Project References](https://turborepo.com/blog/you-might-not-need-typescript-project-references) — Simplifying TS in monorepos

### Additional Resources
- [@changesets/cli on npm](https://www.npmjs.com/package/@changesets/cli) — Package page
- [GitHub: changesets/changesets](https://github.com/changesets/changesets) — Main repo
- [tsup documentation](https://tsup.egoist.dev/) — Build tool docs
- [Turborepo llms.txt](https://turborepo.com/llms.txt) — Machine-readable Turborepo docs
- [GitHub: anthonyhastings/turborepo-design-system](https://github.com/anthonyhastings/turborepo-design-system) — Community example
- [GitHub: dan5py/turborepo-shadcn-ui](https://github.com/dan5py/turborepo-shadcn-ui) — Turborepo + shadcn starter
- [GitHub: gmickel/turborepo-shadcn-nextjs](https://github.com/gmickel/turborepo-shadcn-nextjs) — Turborepo + shadcn + Next.js + Bun
- [Arvin Mostafaei: Building a Design System Monorepo with Turborepo](https://arvin.vercel.app/blog/turborepo-design-system-monorepo) — Blog walkthrough
- [Simon Boisset: Publish a library with Turborepo](https://simonboisset.com/en/blog/share-packages-monorepo) — Multi-package publishing
- [npmdigest: npm Monorepo Publishing Guide](https://npmdigest.com/guides/monorepo-publishing) — Lerna, Turborepo, Changesets comparison
- [DEV.to: What is tsup?](https://dev.to/teaganga/what-is-tsup-5785) — tsup overview
- [LogRocket: Using tsup to bundle TypeScript](https://blog.logrocket.com/tsup/) — tsup deep dive
- [DEV.to: Bundle tree-shakable library with tsup](https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46) — Tree-shaking with tsup
- [Alan Norbauer: Switching from tsup to tsdown](https://alan.norbauer.com/articles/tsdown-bundler/) — Next-gen bundler evaluation
- [Mae Capozzi: Three ways to test npm packages](https://maecapozzi.com/newsletter/31/) — Testing approaches overview
- [FutureStud: Create a Local Release Package](https://futurestud.io/tutorials/npm-create-a-local-release-package-before-publishing-to-the-registry) — npm pack tutorial
- [Strapi: Test npm package with Verdaccio + ngrok](https://strapi.io/blog/testing-npm-package-before-releasing-it-using-verdaccio-and-ngrok) — Remote testing with Verdaccio

---

## Raw Link Index

Every URL encountered during this research, deduplicated:

```
https://turborepo.dev/docs/core-concepts/internal-packages
https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package
https://turborepo.dev/docs/guides/publishing-libraries
https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
https://turborepo.dev/docs/guides/tools/typescript
https://turbo.build/repo/docs/core-concepts/internal-packages
https://turbo.build/repo/docs/guides/publishing-libraries
https://turbo.build/repo/docs/handbook/sharing-code/internal-packages
https://turbo.build/repo/docs/handbook/publishing-packages/versioning-and-publishing
https://turborepo.com/llms.txt
https://turborepo.com/blog/you-might-not-need-typescript-project-references
https://romellem.github.io/turbo-v1-docs/repo/docs/handbook/publishing-packages/versioning-and-publishing
https://romellem.github.io/turbo-v1-docs/repo/docs/handbook/sharing-code/internal-packages
https://github.com/vercel/turborepo/discussions/9550
https://github.com/vercel/turborepo/discussions/4509
https://github.com/vercel/turborepo/discussions/620
https://github.com/vercel/turborepo/discussions/4304
https://github.com/vercel/turborepo/discussions/910
https://github.com/vercel/turborepo/discussions/8431
https://github.com/vercel/turborepo/discussions/10543
https://github.com/vercel/turborepo/discussions/429
https://github.com/vercel/turborepo/issues/8711
https://github.com/vercel/turborepo/issues/6435
https://github.com/vercel/turborepo/issues/3168
https://github.com/vercel/turborepo/issues/1809
https://github.com/vercel/turborepo/issues/4861
https://github.com/vercel/turborepo/issues/5068
https://github.com/vercel/turborepo/issues/11002
https://github.com/vercel/turborepo/tree/main/examples/design-system
https://github.com/vercel/turborepo/blob/main/examples/design-system/README.md
https://vercel.com/templates/react/turborepo-design-system
https://vercel.com/new/templates/react/turborepo-design-system
https://vercel.com/templates/monorepos
https://vercel.com/templates/next.js/monorepo-turborepo
https://vercel.com/academy/production-monorepos
https://vercel.com/academy/production-monorepos/changesets-versioning
https://github.com/changesets/changesets
https://github.com/changesets/changesets/blob/main/packages/cli/README.md
https://github.com/changesets/changesets/blob/main/docs/config-file-options.md
https://github.com/changesets/changesets/blob/main/docs/linked-packages.md
https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md
https://github.com/changesets/changesets/blob/main/packages/config/schema.json
https://github.com/changesets/changesets/blob/main/.changeset/config.json
https://github.com/changesets/changesets/pull/1683
https://github.com/changesets/changesets/discussions/922
https://github.com/changesets/changesets/discussions/1072
https://changesets-docs.vercel.app/
https://www.npmjs.com/package/@changesets/cli
https://pnpm.io/workspaces
https://pnpm.io/using-changesets
https://pnpm.io/settings
https://pnpm.io/package_json
https://github.com/pnpm/pnpm.io/blob/main/docs/using-changesets.md
https://github.com/orgs/pnpm/discussions/4840
https://github.com/pnpm/pnpm/issues/3510
https://docs.npmjs.com/cli/v11/configuring-npm/package-json/
https://docs.npmjs.com/cli/v11/commands/npm-pack/
https://docs.npmjs.com/cli/v11/commands/npm-publish/
https://docs.npmjs.com/files/package.json/
https://nodejs.org/api/packages.html
https://github.com/npm/cli/wiki/Files-&-Ignores
https://dtech.vision/guides/npm-changesets-complete-guide/
https://jsdev.space/complete-monorepo-guide/
https://nhost.io/blog/how-we-configured-pnpm-and-turborepo-for-our-monorepo
https://blog.atomrc.dev/p/typescript-library-compilation-2023/
https://blog.rnsloan.com/2025/01/11/local-npm-package-testing-made-simple-a-guide-to-npm-pack/
https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-npm-yalc-3l97
https://dev.to/one-beyond/different-approaches-to-testing-your-own-packages-locally-verdaccio-5hd8
https://dev.to/tresorama/publish-a-typescript-react-library-to-npm-in-a-monorepo-1ah1
https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e
https://dev.to/dailydevtips1/how-to-test-your-npm-package-locally-2b6
https://dev.to/jmcdo29/automating-your-package-deployment-in-an-nx-monorepo-with-changeset-4em8
https://dev.to/teaganga/what-is-tsup-5785
https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46
https://dev.to/ippatev/managing-tailwind-css-in-turborepo-packages-4j34
https://dev.to/vcarl/testing-npm-packages-before-publishing-h7o
https://dev.to/vinomanick/create-a-monorepo-using-pnpm-workspace-1ebn
https://medium.com/@anandkumar.code/how-a-monorepo-pnpm-and-changesets-transformed-my-multi-package-workflow-7c1771bba898
https://medium.com/@george.benjamin.lopez/monorepos-made-easy-turborepo-setup-for-a-shared-react-package-and-website-2eb7980c2c8d
https://medium.com/@asafshakarzy/setting-up-a-minimal-react-library-workspace-with-typescript-tsup-biome-and-storybook-e689f4703e26
https://medium.com/@sundargautam2022/creating-and-publishing-react-npm-packages-simply-using-tsup-6809168e4c86
https://medium.com/@joabi/exploring-different-approaches-for-testing-packages-locally-14747ece9b
https://medium.com/@mohandere/npm-packaging-for-local-development-1d79c38b1897
https://medium.com/@ukpai/set-up-a-monorepo-using-pnpm-workspace-30688e95147a
https://medium.com/@ramunarasinga/how-changsets-reads-config-json-internally-86de7f5baade
https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb
https://jakeginnivan.medium.com/options-for-publishing-typescript-libraries-9c37bec28fe
https://vinayak-hegde.medium.com/supercharging-monorepo-workflows-building-publishable-packages-with-turborepo-vite-and-eaec60571f70
https://vmarchesin.medium.com/how-to-publish-a-npm-package-in-four-steps-4344ab88e852
https://lirantal.com/blog/introducing-changesets-simplify-project-versioning-with-semantic-releases
https://dnlytras.com/blog/using-changesets
https://bovolato.dev/blog/javascript/turborepo-101/
https://infinum.com/handbook/frontend/changesets
https://gasket.dev/docs/changeset/
https://monorepo.guide/getting-started
https://simonboisset.com/en/blog/share-packages-monorepo
https://npmdigest.com/guides/monorepo-publishing
https://adamcoster.com/blog/pnpm-config
https://deepwiki.com/vercel/turborepo/7-examples-and-templates
https://deepwiki.com/pnpm/pnpm/5.4-release-process
https://tsup.egoist.dev/
https://alan.norbauer.com/articles/tsdown-bundler/
https://blog.logrocket.com/tsup/
https://leapcell.io/blog/streamlining-component-library-publishing-with-vite-and-tsup
https://cmdcolin.github.io/posts/2022-05-27-youmaynotneedabundler/
https://transitivebullsh.it/javascript-dev-tools-in-2022
https://plainenglish.io/blog/how-do-you-clean-the-subjects-in-rxjs
https://maecapozzi.com/newsletter/31/
https://maecapozzi.com/blog/how-to-locally-test-an-npm-package
https://copyprogramming.com/howto/how-to-test-your-npm-package-locally
https://futurestud.io/tutorials/npm-create-a-local-release-package-before-publishing-to-the-registry
https://jasonwatmore.com/npm-pack-for-local-package-dependency-testing
https://strapi.io/blog/testing-npm-package-before-releasing-it-using-verdaccio-and-ngrok
https://willwill96.github.io/the-ui-dawg-static-site/en/verdaccio/
https://www.geeksforgeeks.org/node-js/npm-pack-command/
https://www.codestudy.net/blog/how-to-npm-publish-specific-folder-but-as-package-root/
https://jaketrent.com/post/npm-install-local-files/
https://51elliot.blogspot.com/2014/08/repackaging-node-modules-for-local.html
https://github.com/lerna/lerna/issues/2633
https://github.com/VulcanJS/npm-the-right-way
https://github.com/egoist/tsup/issues/1364
https://github.com/alexlafroscia/turborepo-vite-dev-example/
https://github.com/anthonyhastings/turborepo-design-system
https://github.com/markozxuu/example-turborepo-changeset
https://github.com/mupinnn/design-system-turbo
https://github.com/dan5py/turborepo-shadcn-ui
https://github.com/gmickel/turborepo-shadcn-nextjs
https://github.com/jhs88/my-shadcn-app-monorepo
https://github.com/yannickspies/monorepo
https://lobehub.com/skills/joelhooks-swarm-tools-publish-package-cicd
https://community.vercel.com/t/turborepo-vite-react-ts-tailwind-css-v4-shadcn-ui-nest-js/8189
https://javascript.plainenglish.io/create-a-turborepo-with-nextjs-tailwindcss-shadcn-6e6ecfd52aea
https://www.answeroverflow.com/m/1197078743127171122
https://www.javierbrea.com/blog/pnpm-nx-monorepo-02/
https://nx.dev/blog/setup-a-monorepo-with-pnpm-workspaces-and-speed-it-up-with-nx
https://mikbry.com/blog/javascript/npm/best-practices-npm-package
https://typescript-react-primer.loyc.net/publish-npm-package.html
https://ui.shadcn.com/docs/monorepo
```
