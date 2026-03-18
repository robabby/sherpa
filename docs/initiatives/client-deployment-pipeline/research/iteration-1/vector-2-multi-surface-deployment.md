# Vector 2: Multi-Surface Deployment Patterns

**Question:** How do platforms like Notion, Linear, Slack, Figma deliver desktop + web + API/code dependency from one codebase? What architecture patterns enable surface-per-user-type deployment?
**Agent dispatched:** 2026-03-16

## Findings

### 7 Architecture Patterns from Real Products

**1. Electron Wrapper (Notion, Slack, Figma, Obsidian)**

- Web app in a Chromium shell. Dominant pattern. Every product that chose it eventually invested heavily in performance optimization or partial native rewrites.
- Notion incrementally rewrote mobile to native Kotlin/Swift (everything except the editor).
- Slack rebuilt from scratch in 2019 for 50% less memory.
- Figma uses Electron for desktop but C++/WebAssembly for the rendering engine.

**2. Native Core + Web Extensions (Raycast)**

- 100% Swift/AppKit app with React+TypeScript extensions rendered as native UI via a translation layer.
- Highest quality UX but requires building the React-to-native-views bridge.
- Only viable when macOS is the primary/only desktop platform.

**3. Local-First Sync Engine as Shared Core (Linear)**

- Instead of sharing UI code, share the data layer.
- Linear's custom sync engine treats IndexedDB as a real database, changes happen locally first, sync via WebSocket.
- Different surfaces consume the same state without sharing UI code.
- Key insight: sharing the data layer is more valuable than sharing the view layer.

**4. Slack's Four Code-Sharing Strategies**

- Documented spectrum from "just load the website in Electron" (easy, insecure) to "shared packages with local snapshots + remote updates" (complex, optimal).
- Slack settled on a hybrid after multiple iterations.

**5. API/SDK as Separate Surface (Stripe, Vercel)**

- SDK and web dashboard share an API contract, not UI code.
- Published independently with own semver cadence.
- Monorepo with shared core types is the standard.
- SDK is treated as a first-class product with its own DX team.

**6. Tauri 2.0 — Post-Electron Alternative**

- Uses OS native webview instead of bundled Chromium.
- ~10 MB bundles (vs 100+ MB Electron), 30-40 MB memory (vs hundreds), sub-500ms startup.
- Security-by-default: no Node.js access from frontend, explicit IPC permissions.
- Supports Swift plugins for macOS — can progressively add native functionality.
- Ships desktop + mobile from one codebase (Tauri 2.0 added iOS/Android).
- Active ecosystem: 90K+ GitHub stars, backed by CrabNebula.

**7. Monorepo with Shared Core**

- Universal pattern across every multi-surface product.
- `core/` (types, schemas, logic) consumed by `web/`, `desktop/`, `cli/`, `sdk/`.
- Shared core contains: data models, validation, business logic, API types.
- Each surface owns its own rendering, platform integration, and distribution.

### Key Pattern: The Shared Core IS the Product

Every successful multi-surface product converges on the same insight: the shared core (data models, schemas, business logic) is the real product. Surfaces are views over that core. This maps directly to Sherpa's architecture where `@sherpa/studio-core` is consumed by all surfaces.

### Distribution Mechanisms

- **Desktop**: App store (Mac App Store, Microsoft Store), direct download (.dmg, .exe), or package managers (brew, winget).
- **Web**: Standard web deployment (Vercel, self-hosted).
- **Code dependency**: npm/PyPI with semver, published from monorepo.
- **Key insight**: each surface has its own distribution channel. The deployment pipeline must handle all three independently.

## Sources

- Notion's native mobile rewrite — engineering blog posts on incremental migration
- Slack's desktop rebuild — [Several People Are Coding blog series](https://slack.engineering/)
- Linear's sync engine — [Linear Method documentation](https://linear.app/method)
- Raycast's architecture — [Raycast developer documentation](https://developers.raycast.com/)
- Tauri 2.0 — [Tauri documentation](https://v2.tauri.app/), [GitHub](https://github.com/tauri-apps/tauri)
- Stripe SDK architecture — [Stripe API documentation](https://stripe.com/docs/api)
- Figma's rendering — [Figma engineering blog](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)

## Implications

**Desktop app: Tauri 2.0 is the strongest candidate.**

- Meets the "thumb drive test" with ~10 MB binary, sub-500ms startup.
- Supports Swift plugins for progressive native migration — start with web views, add native components over time.
- Security-by-default aligns with Sherpa's governance philosophy.
- Middle ground between "pure Electron" (too heavy, against the vision) and "pure SwiftUI from scratch" (massive engineering investment for v1).
- **Tension with desktop app vision**: The memory file says "Native apps (Swift/SwiftUI), not Electron/Tauri." Tauri with Swift plugins is closer to native than Electron, but it's still a webview wrapper. This needs resolution.

**Web UI (Studio): Already correct as Next.js.** No changes needed for the deployment pipeline.

**Code dependency: Already structured correctly as monorepo packages.** Follow the Stripe pattern — publish `@sherpa/studio-core`, `@sherpa/studio-ui`, etc. with independent semver cadence. The deployment pipeline's `sherpa init` for engineers just runs `pnpm add @sherpa/studio`.

**The shared core IS the product.** `@sherpa/studio-core` (conventions, agent roles, governance state, config schemas) is consumed by all three surfaces. `defineConfig()` is the universal API contract. This validates the proposal's architecture — the config layer bridges surfaces.

**Surface composition per client:**

| Tier | Install mechanism | What ships |
|------|------------------|-----------|
| Sm | Desktop app download/installer | Tauri binary + bundled config |
| Md | `pnpm add @sherpa/studio` + `pnpm dev` | npm packages + web UI |
| Lg | All of the above + `sherpa init --remote` | npm + web + desktop + VPS |
| Enterprise | Custom deployment | All surfaces + cloud + compliance |

## Open Questions

1. **Tauri vs. pure SwiftUI** — Is Tauri close enough to "native" to satisfy the thumb drive vision? Swift plugins enable progressive native migration, but the core is still a webview. Need a decision checkpoint.

2. **Sync between surfaces** — When desktop and web both run against the same deployment, how do they stay consistent? Ranges from "both talk to same MCP server" (simple, good enough for v1) to "local-first sync engine" (powerful, complex, Linear-style).

3. **Offline capability for Sm tier** — Does the desktop app work without internet? If yes, it needs a local data store and sync engine. If no, it's a thin client and the "zero infrastructure" claim needs qualification.

4. **Non-technical install path** — `sherpa init --local` is CLI-based, but Shayna won't open a terminal. The desktop app needs its own onboarding flow (installer wizard, first-run configuration). This is a UX design problem, not just a deployment problem.

5. **What ships in the Sm tier bundle** — Does the desktop app embed Ollama for local inference, or connect to a cloud endpoint? Embedding means larger bundle but true zero-infra. Cloud endpoint means smaller bundle but dependency on connectivity and API keys.

6. **Update mechanism per surface** — Desktop app has its own update channel (Tauri's built-in updater, Sparkle for macOS). Web UI updates via deployment. npm packages update via `pnpm update`. The deployment pipeline needs to coordinate updates across surfaces for a single client.
