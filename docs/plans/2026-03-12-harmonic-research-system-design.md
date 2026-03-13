# Harmonic Research System — Design Document

> **Initiative:** `harmonic-research-system`
> **Created:** 2026-03-12
> **Status:** Draft

## Vision

Sheet music for agents. A mathematical coordinate system that maps harmonic principles — consonance, ratio lattices, Platonic geometry, spiral recurrence — onto multi-agent research orchestration. The same mathematics that constrains regular polyhedra and defines musical consonance becomes the grammar for how agents coordinate, how research deepens, and how exploratory work crystallizes into actionable initiatives.

## The Metaphor Made Structural

### The Double Helix

Research is orchestrated as an expanding double helix:

**Two whole-note trunks** — Two agents holding sustained, deep investigation on the same research question with dual dispositions. One occupies the overtone half of the Lambdoma lattice (generative, constructive — "what's here, what does it enable?"). The other occupies the undertone half (critical, inverting — "what's missing, what breaks, what was assumed?"). They spiral around the same axis but from different orientations, like two voices in Bach counterpoint.

The trunks map to the Lambdoma mirror: cell (3,2) and cell (2,3). Same ratio, different orientation. The mirror IS the helix.

**Shorter-note strands** weave between the trunks as independent R&D threads:
- Half notes (2 beats) — focused sub-investigations with specific deliverables
- Quarter notes (1 beat) — targeted passes, scan and extract
- Eighth notes (0.5 beats) — reconnaissance, signal detection

As the helix expands, the space between trunks widens. Early strands are short cross-checks. Later strands become substantial investigations bridging increasingly divergent perspectives. The DNA parallel: the backbone strands are structural scaffolding, but the base pairs (the rungs between them) carry the encoded information.

**Crystals precipitate** within the lattice of strands. As strand density increases, interference patterns form. When these patterns produce a stable geometry — a Platonic solid — a crystallization event has occurred. The research field has spontaneously organized into an initiative.

The system detects crystallization and surfaces it to the human conductor. The human plucks the crystal, and its resonant frequency reveals its nature: a tetrahedron (small, self-contained), an octa-hex pair (feature-scale, producer-validator), or an icosa-dodeca pair (platform-scale, high-tension).

### Standing Waves and Interference

Two dispositional trunks on the same question create a standing wave. Where they agree: nodes (confirmed findings). Where they disagree: antinodes (where the energy is — the real research questions). Single-agent research grooves into its initial framing. The second trunk resists that groove. The interference pattern IS the insight map.

---

## Package: `@sherpa/harmonics`

### Properties

- **Zero dependencies.** Pure TypeScript, pure math.
- **No framework opinions.** No Zod, gray-matter, or build system coupling.
- **Domain-agnostic.** Consonance, ratios, and geometry — not astrology, not agents.
- **Proven extraction + targeted invention.** Three modules from WavePoint (~700 LOC, 60+ tests). Two new modules designed to compose with them.

### Module Architecture

```
packages/harmonics/
├── package.json                    @sherpa/harmonics
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                    Barrel exports
│   │
│   ├── consonance/
│   │   ├── types.ts                ConsonanceClass, IntervalRatio, MusicalInterval
│   │   ├── tenney.ts               tenneyHeight(), consonanceFromTenney(), octaveReduce()
│   │   ├── intervals.ts            Ratio-to-interval naming, interval quality lookup
│   │   ├── constants.ts            TENNEY_THRESHOLDS, PYTHAGOREAN_FIFTH, etc.
│   │   └── index.ts
│   │
│   ├── lattice/
│   │   ├── types.ts                LambdomaCell, LambdomaEntry, HarmonicEntity<D>
│   │   ├── operations.ts           at(), locate(), mirror(), compose()
│   │   ├── traversal.ts            neighborhood(), pythagoreanSpine()
│   │   ├── registry.ts             createRegistry<D>() factory
│   │   ├── constants.ts            MAX_CELL_INDEX, PYTHAGOREAN_SPINE_BASE
│   │   └── index.ts
│   │
│   ├── solids/
│   │   ├── types.ts                PlatonicSolidId, SolidHarmonics, DualPair
│   │   ├── data.ts                 5 solids: ratios, angle sums, element, harmonic number
│   │   ├── duals.ts                3 dual pairings with interval relationships
│   │   └── index.ts
│   │
│   ├── spiral/
│   │   ├── types.ts                SpiralPosition, SpiralRing, RayAngle
│   │   ├── coordinates.ts          spiralPosition(n), ringOf(n), angleOf(n)
│   │   ├── queries.ts              harmonicRay(angle), ringAt(radius), onSameRay(a, b)
│   │   ├── constants.ts            CELLS_PER_RING_INCREMENT (8), CARDINAL_ANGLES, ORDINAL_ANGLES
│   │   └── index.ts
│   │
│   └── tempo/                      Phase 2 (greenfield, after extraction stabilizes)
│       ├── types.ts                NoteValue, BeatDuration, ResearchDepth
│       ├── data.ts                 Note value definitions, beat-to-ratio mappings
│       └── index.ts
```

---

## Module Details

### 1. `consonance/` — Quality of Relationship

**Extracted from:** WavePoint `packages/content/src/lambdoma/` + `packages/content/src/harmonics/`

The universal metric for harmonic quality. Given any ratio, answers: is this consonant or dissonant? By how much?

```typescript
// Core type — vendored from WavePoint aspects, universal vocabulary
type ConsonanceClass = "perfect" | "contested" | "imperfect" | "dissonance" | "outside-system";

// The metric
function tenneyHeight(ratio: [number, number]): number;   // log2(m * n)
function consonanceFromTenney(height: number): ConsonanceClass;

// Normalization
function octaveReduce(hz: number, lower?: number): number;

// Naming
function intervalName(ratio: [number, number]): string;    // "perfect fifth", "minor third"
function intervalQuality(ratio: [number, number]): ConsonanceClass;
```

**Tenney height thresholds** (calibrated against musical/aspect tradition):
| Range | Class | Examples |
|-------|-------|---------|
| TH <= 3.0 | perfect | Unison (1:1), Octave (2:1), Fifth (3:2) |
| 3.0 < TH <= 4.0 | contested | Fourth (4:3) |
| 4.0 < TH <= 6.5 | imperfect | Major third (5:4), Minor third (6:5) |
| TH > 6.5 | dissonance | Minor second (16:15), Tritone (45:32) |

### 2. `lattice/` — Harmonic Space

**Extracted from:** WavePoint `packages/content/src/lambdoma/`

The Lambdoma is a division table where cell (m, n) = m/n. It provides a 2D coordinate system for any domain of harmonic entities.

```typescript
// Position and entry
type LambdomaCell = [m: number, n: number];
interface LambdomaEntry {
  cell: LambdomaCell;
  ratio: [number, number];     // Reduced
  decimal: number;
  tenneyHeight: number;
  isOvertone: boolean;         // m > n
  isUndertone: boolean;        // m < n
  consonanceClass: ConsonanceClass;
}

// Core operations
function at(m: number, n: number): LambdomaEntry;
function locate(num: number, den: number): LambdomaEntry;  // Reduces first
function mirror(cell: LambdomaCell): LambdomaEntry;         // (m,n) -> (n,m)
function compose(a: [number, number], b: [number, number]): LambdomaEntry;

// Traversal
function neighborhood(cell: LambdomaCell, radius?: number): LambdomaEntry[];
function pythagoreanSpine(maxDistance?: number): LambdomaEntry[];
```

**Generic entity registry** (new — the key architectural addition):

```typescript
// Genericized — domain is a type parameter, not hardcoded
interface HarmonicEntity<D extends string = string> {
  id: string;
  domain: D;
  cell: LambdomaCell;
  label: string;
}

interface EntityRegistry<D extends string> {
  entities: HarmonicEntity<D>[];
  entitiesAt(cell: LambdomaCell): HarmonicEntity<D>[];
  consonantWith(ratio: [number, number], maxTenney?: number): Array<{
    entity: HarmonicEntity<D>;
    composedEntry: LambdomaEntry;
  }>;
  relatedAcrossDomains(id: string, domain: D): {
    source: HarmonicEntity<D>;
    related: Record<D, HarmonicEntity<D>[]>;
  };
}

function createRegistry<D extends string>(
  domains: readonly D[],
  entities: HarmonicEntity<D>[]
): EntityRegistry<D>;
```

**Consumer usage:**

```typescript
// WavePoint registers astrology entities
const astroRegistry = createRegistry(
  ["aspect", "planet", "solid"] as const,
  [...ASPECT_ENTITIES, ...PLANET_ENTITIES, ...SOLID_ENTITIES]
);

// Sherpa registers agent orchestration entities
const agentRegistry = createRegistry(
  ["agent", "disposition", "research-mode"] as const,
  [
    { id: "generative", domain: "disposition", cell: [3, 2], label: "Overtone (generative)" },
    { id: "critical",   domain: "disposition", cell: [2, 3], label: "Undertone (critical)" },
    // ...
  ]
);
```

### 3. `solids/` — Stable Geometries

**Extracted from:** WavePoint `packages/content/src/great-year/` (Platonic solid data)
**New computation:** Dual pair intervals

The five Platonic solids and their harmonic properties. In the research system, these are the stable geometries that crystallize from the research field — the shapes an initiative can take.

```typescript
type PlatonicSolidId = "tetrahedron" | "octahedron" | "hexahedron" | "icosahedron" | "dodecahedron";

interface SolidHarmonics {
  id: PlatonicSolidId;
  faces: number;
  angleSumDegrees: number;
  harmonicNumber: number;           // 1, 2, 3, 5, 9
  harmonicRatio: [number, number];  // Ratio to tetrahedron
  element: string;                  // Fire, Air, Earth, Water, Aether
  intervalFromPrevious: string | null;
  intervalRatioFromPrevious: [number, number] | null;
}

interface DualPair {
  solidA: PlatonicSolidId;
  solidB: PlatonicSolidId;
  intervalRatio: [number, number];
  intervalName: string;
  consonanceClass: ConsonanceClass;
}
```

**The three dual pairs as initiative archetypes:**

| Pair | Interval | Consonance | Initiative Shape |
|------|----------|------------|------------------|
| Tetrahedron (self-dual) | Unison (1:1) | Perfect | Self-contained. 1 session. No external complement needed. |
| Octahedron-Hexahedron | Fifth (3:2) | Perfect | Feature-scale. Natural producer-validator pair. Consonant and resolvable. |
| Icosahedron-Dodecahedron | Minor seventh (9:5) | Dissonance | Platform-scale. Maximum complexity. Won't resolve without real work. |

### 4. `spiral/` — Temporal Recurrence

**New module.** Mathematical structure derived from Gann's Square of Nine spiral coordinate system, stripped of financial prediction claims.

A spiral mapping of sequential values onto a 2D surface where angular position encodes harmonic relationship. The time axis that the Lambdoma lattice lacks.

```typescript
interface SpiralPosition {
  n: number;           // Sequential value (1-indexed)
  ring: number;        // Which ring from center (0 = center)
  angle: number;       // Angular position in degrees (0-360)
  cardinal: boolean;   // On a cardinal ray (0, 90, 180, 270)
  ordinal: boolean;    // On an ordinal ray (45, 135, 225, 315)
}

// Core coordinate computation
function spiralPosition(n: number): SpiralPosition;
function ringOf(n: number): number;
function angleOf(n: number): number;

// Ray queries — entities sharing angular position across depths
function harmonicRay(angle: number, maxRing?: number): SpiralPosition[];
function ringAt(ring: number): SpiralPosition[];
function onSameRay(a: number, b: number, tolerance?: number): boolean;
```

**Key structural properties:**
- Center = 1, numbers spiral outward
- Each ring adds 8 cells (2^3, a Pythagorean number)
- Outer rings have more resolution — more events at greater depth
- Cardinal angles (0deg, 90deg, 180deg, 270deg) map to major aspects (conjunction, square, opposition)
- Angular proximity between values = harmonic resonance
- Same ray, different rings = recurring theme at progressive depths

**Application to research helix:**
- N = sequential research event (strand firing, checkpoint, crystallization moment)
- Ring = depth into the research expansion
- Angle = harmonic character of the event
- Events on the same ray across rings = the system detecting recurrence ("this pattern surfaced before, one ring closer to center")

### 5. `tempo/` — Research Depth (Phase 2)

**New module, greenfield.** Deferred until extraction modules stabilize.

Musical note values as research tempo primitives. Each note value represents a temporal depth of engagement.

```typescript
type NoteValue = "whole" | "half" | "quarter" | "eighth" | "sixteenth";

interface BeatDuration {
  noteValue: NoteValue;
  beats: number;              // 4, 2, 1, 0.5, 0.25
  ratioToWhole: [number, number];  // [1,1], [1,2], [1,4], [1,8], [1,16]
  researchDepth: string;      // "sustained", "focused", "targeted", "reconnaissance", "signal"
}
```

**Note value semantics for research:**

| Note | Beats | Research Depth | Agent Behavior |
|------|-------|---------------|----------------|
| Whole | 4 | Sustained | Full context window. Reads everything, synthesizes, finds unexpected connections. |
| Half | 2 | Focused | Specific angle, specific deliverable. Deep within bounds. |
| Quarter | 1 | Targeted | Scan the landscape, extract relevance, report back. |
| Eighth | 0.5 | Reconnaissance | Skim for signals. "Is there anything here worth a longer note?" |
| Sixteenth | 0.25 | Signal | Existence check. "Does this topic even have material?" |

**Beat ratios between note values map to harmonic intervals:**
- Whole:Half = 2:1 = octave (the most fundamental relationship)
- Whole:Quarter = 4:1 = two octaves
- Half:Quarter = 2:1 = octave again
- These ratios compose through the lattice: `compose([2,1], [2,1])` = `[4,1]`

---

## Integration with `@sherpa/studio-core`

After `@sherpa/harmonics` stabilizes, studio-core gains research orchestration types. This is a follow-on initiative, not part of the initial package extraction.

### Research Helix Types

```typescript
interface ResearchHelix {
  id: string;
  question: string;               // The research axis
  trunks: [HelixTrunk, HelixTrunk];  // Overtone + undertone
  strands: HelixStrand[];
  crystals: CrystallizationEvent[];
}

interface HelixTrunk {
  agentId: string;
  disposition: "overtone" | "undertone";
  noteValue: "whole";
  latticePosition: LambdomaCell;  // (3,2) or (2,3)
}

interface HelixStrand {
  id: string;
  noteValue: NoteValue;
  connectsTrunks: [string, string];  // Which trunks this strand bridges
  spiralPosition: SpiralPosition;    // Where in the sequence
}

interface CrystallizationEvent {
  detectedAt: SpiralPosition;        // When in the sequence
  solidType: PlatonicSolidId;        // What shape emerged
  dualPair: DualPair | null;         // If it's a paired crystal
  strandIds: string[];               // Which strands converged
  consonanceScore: number;           // Tenney height of the convergence
  surfacedToHuman: boolean;
  humanVerdict: "pluck" | "dissolve" | "refine" | null;
}
```

---

## Phasing

### Phase 1: Extraction (2-3 sessions)

Extract proven math from WavePoint into `@sherpa/harmonics`:
- `consonance/` — Tenney height, ConsonanceClass, interval naming, octaveReduce
- `lattice/` — Cell operations, traversal, generic `createRegistry<D>()`
- `solids/` — Platonic solid data, harmonic ratios, dual pairs (new computation)
- Tests for all three (port WavePoint's 60+ tests, add dual pair tests)

### Phase 2: Spiral (1-2 sessions)

Build the `spiral/` module:
- Coordinate computation (position, ring, angle from sequential value)
- Ray queries and recurrence detection
- Tests validating against known Square of Nine properties

### Phase 3: Tempo (1 session)

Build the `tempo/` module:
- Note value definitions and beat ratios
- Composition with lattice operations (beat ratios ARE lattice ratios)
- Tests

### Phase 4: Studio Integration (2-3 sessions)

Extend `@sherpa/studio-core` with research orchestration types:
- Helix, trunk, strand, crystal type definitions
- Crystallization detection heuristics
- Initiative typing via solid classification
- Studio UI components for helix visualization

### Phase 5: WavePoint Dependency Inversion (1 session)

Update WavePoint's `@wavepoint/content/harmonics` and `lambdoma` to import base math from `@sherpa/harmonics` and add domain-specific data (sign frequencies, planetary timbres, astrology entity registry) on top.

**Effort:** 7-10 sessions total across all phases.
