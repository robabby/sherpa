---
status: pending
initiative: harmonic-research-system
created: 2026-03-12
updated: 2026-03-12
type: new-plan
risk: structural
targets:
  - packages/harmonics/
  - packages/studio-core/src/
dependencies:
  - behavioral-agents
spawned-from: null
---

# Harmonic Research System

## Summary

A new `@sherpa/harmonics` package providing mathematical primitives for harmonic coordination of multi-agent research. Five modules — consonance, lattice, solids, spiral, tempo — form a coordinate system that maps geometry to work: measuring relationship quality between agents, positioning entities on a ratio lattice, sizing initiatives as Platonic solid crystallizations, tracking recurrence through spiral coordinates, and governing research depth through musical note values.

## State Snapshot

Sherpa has behavioral agent definitions (`agents/`, `docs/agents/roles/`) and governance infrastructure (initiatives, tasks, Planner/Worker/Judge pipeline) but no mathematical model for how agents relate to each other, how research topics decompose, or when exploratory work has crystallized into actionable initiatives.

WavePoint's `@wavepoint/content` package contains two proven harmonic primitives — the Lambdoma ratio lattice (~350 LOC, 60+ tests) and the harmonics module (~350 LOC) — both pure computation with minimal type dependencies. These encode universal mathematics (consonance metrics, ratio operations, Platonic solid harmonics) that are not astrology-specific.

## Proposed Changes

### Target: `packages/harmonics/` (new package)

Create `@sherpa/harmonics` with five modules:

**`consonance/`** — Extracted from WavePoint's Lambdoma + harmonics modules.
- `ConsonanceClass` type: `"perfect" | "contested" | "imperfect" | "dissonance" | "outside-system"`
- `tenneyHeight(ratio)` — log2(m * n), universal consonance metric
- `consonanceFromTenney(height)` — classify Tenney height to ConsonanceClass
- `octaveReduce(value, lower?)` — fold any value into a single octave range
- Interval naming: ratio-to-musical-interval lookup (unison, fifth, octave, etc.)
- Constants: `TENNEY_THRESHOLDS`, `PYTHAGOREAN_SPINE_BASE`

**`lattice/`** — Extracted from WavePoint's Lambdoma, genericized.
- `LambdomaCell`, `LambdomaEntry` types (pure ratio math)
- `at(m, n)`, `locate(num, den)`, `mirror(cell)`, `compose(ratioA, ratioB)` — core operations
- `neighborhood(cell, radius)`, `pythagoreanSpine(maxDistance)` — traversal
- `createRegistry<D extends string>(entities)` — generic entity registry factory (NEW)
  - Returns bound `entitiesAt()`, `consonantWith()`, `relatedAcrossDomains()` methods
  - WavePoint registers `<"aspect" | "planet" | "solid">`, Sherpa registers `<"agent" | "disposition" | "research-mode">`

**`solids/`** — Extracted from WavePoint's great-year Platonic solid data.
- `PlatonicSolidId`: tetrahedron, octahedron, hexahedron, icosahedron, dodecahedron
- Harmonic ratios: 1, 2, 3, 5, 9 (mathematically proven from Euclidean geometry)
- Successive intervals: octave (2:1), fifth (3:2), major sixth (5:3), minor seventh (9:5)
- Dual pairs with interval relationships (NEW):
  - Tetrahedron: self-dual (unison, 1:1)
  - Octahedron-Hexahedron: perfect fifth (3:2)
  - Icosahedron-Dodecahedron: minor seventh (9:5)

**`spiral/`** — New module inspired by Gann's Square of Nine structure.
- `spiralPosition(n)` — compute polar coordinates (angle, ring) for sequential value
- `harmonicRay(angle)` — all values sharing an angular ray across rings
- `ringAt(radius)` — all values at a given depth
- Angular divisions map to aspect system: 90deg = square, 120deg = trine, 180deg = opposition
- Each ring adds 8 cells (2^3), providing increasing resolution at greater depth

**`tempo/`** — New module (phase 2, greenfield). Research depth primitives.
- `NoteValue`: whole (4 beats), half (2), quarter (1), eighth (0.5)
- Beat ratios between note values map to harmonic intervals (whole:half = 2:1 = octave)
- Designed after extraction stabilizes, building on lattice and consonance primitives

### Target: `packages/studio-core/src/` (extensions)

After `@sherpa/harmonics` is stable, extend studio-core with research orchestration types:

- Helix topology: trunk/strand/crystal structure definitions
- Crystallization detection: when strand convergence forms a Platonic solid geometry
- Initiative typing: tetrahedron (1 session, self-contained), octa-hex (feature, producer-validator), icosa-dodeca (platform, high-tension)

## Rationale

### The Double Helix Research Model

Multi-agent research is orchestrated as an expanding double helix:

- **Two whole-note trunks** spiral around a research axis with dual dispositions — one overtone (generative), one undertone (critical). These are the backbone.
- **Shorter-note strands** (half, quarter, eighth) weave between trunks as independent R&D threads. Early strands are quick cross-checks; as the helix expands, strands become substantial investigations.
- **Crystals precipitate** within the lattice of strands — stable Platonic geometries that emerge when strand convergence reaches a threshold. These are the phase transition from Research to Development.
- The system **detects crystallization events** and surfaces them to the human conductor, who decides which to develop ("pluck") and which to leave in the research field.

### Why Sherpa Owns the Math

The Lambdoma lattice, Tenney height, overtone/undertone mirrors, and Platonic solid ratios are universal mathematics — not astrology concepts. Consonance is consonance whether it describes zodiac signs or agent dispositions. Sherpa owns the math layer; WavePoint (and future customers) add domain-specific mappings on top.

This inverts the current dependency: WavePoint's `@wavepoint/content/harmonics` would import base math from `@sherpa/harmonics` and add sign frequencies, planetary timbres, and decan data as domain extensions.

### The Four Primitive Dimensions

| Primitive | Dimension | Question |
|-----------|-----------|----------|
| Lattice | Space (ratio coordinates) | How are these two things harmonically related? |
| Spiral | Time (sequential position) | When does this harmonic theme recur? |
| Solids | Structure (stable geometry) | What shape has crystallized? |
| Consonance | Quality (Tenney height) | How resolved or tense is this relationship? |

Tempo (phase 2) adds a fifth: **Depth** — how long an agent sustains engagement.

## Dependencies

- `behavioral-agents` — Agent role definitions provide the entities that get registered on the lattice. The behavioral agent schema must be stable before Sherpa can map agents to harmonic coordinates.

## Review Notes

- **Extraction vs. invention**: Three modules (consonance, lattice, solids) are extraction of proven WavePoint code. Two (spiral, tempo) are new. The extraction work should land first.
- **WavePoint dependency inversion**: After `@sherpa/harmonics` ships, WavePoint's content package should be updated to import from it rather than maintaining duplicate math. This is a separate initiative.
- **Dual pairs are not yet computed**: The Platonic solid dual pair concept exists in WavePoint's spec text but has no code implementation. The `solids/` module adds this as new computation.
- **Spiral module draws from Gann research**: The mathematical structure of Gann's Square of Nine (spiral coordinate mapping with angular-harmonic encoding) is well-established. The module extracts the structural principle without the financial prediction claims, which WavePoint's research found empirically invalid.
