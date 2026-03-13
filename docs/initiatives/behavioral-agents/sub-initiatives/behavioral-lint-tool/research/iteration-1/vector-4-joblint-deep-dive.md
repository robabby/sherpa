# Joblint Pattern Rules: Deep Analysis for Behavioral Agent Lint

**Date:** 2026-03-11
**Researcher:** Claude (Opus 4.6)
**Context:** Iteration 2, Vector: Joblint pattern mining for behavioral-lint rule architecture. Builds on iteration-1/vector-3-validation-tooling.md which identified Joblint as the strongest pattern source.

---

## 1. Original Joblint (Node.js) — Complete Rule Catalog

**Source:** https://github.com/rowanmanning/joblint (archived, built 2013, 419 lines)
**File:** `lib/rules.js` — https://raw.githubusercontent.com/rowanmanning/joblint/master/lib/rules.js

### Architecture

Each rule is a JS object with these fields:

```javascript
{
  name: string,        // Human-readable rule name
  reason: string,      // Why this pattern is problematic
  solution: string,    // How to fix it
  level: 'error' | 'warning' | 'notice',  // Severity
  increment: {         // Counter categories to increment
    sexism?: number,
    culture?: number,
    realism?: number,
    recruiter?: number,
    tech?: number
  },
  triggers: string[]   // Regex patterns (wrapped in \b word boundaries at runtime)
}
```

**Severity levels:** `error` (critical), `warning` (moderate), `notice` (informational).

**Counter categories** (5 dimensions, scored cumulatively):
- **sexism** — gendered or discriminatory language
- **culture** — toxic or exclusionary workplace culture signals
- **realism** — unrealistic expectations or vague promises
- **recruiter** — signals the writer lacks technical credibility
- **tech** — legacy/restrictive technology choices

### Complete Rule Table (19 rules)

| # | Name | Level | Counters | Trigger Count | Key Triggers |
|---|------|-------|----------|--------------|--------------|
| 1 | Gendered word | error | sexism:1 | 29 | boys, girls, guys, men, women, ladies, dudes, brothers, sisters |
| 2 | Gendered pronoun | error | sexism:1 | 5 | he, she, him, her, his |
| 3 | Derogatory gendered term | error | sexism:2, culture:1 | 9 | bitch, bimbo, slut, stud, stallion, milf |
| 4 | Facial hair | error | sexism:1 | 2 | beard(ed/s/y), grizzl(ed/y) |
| 5 | Sexualised terms | warning | culture:1 | 4 | sexy, hawt, phat, "gay for" |
| 6 | Bro terminology | error | culture:1 | 7 | brogrammer, crush, hardcore, hella, "making it rain", skillz |
| 7 | Dumb job titles | warning | culture:1, realism:1 | 7 | guru, hero, ninja, rockstar, superstar, badass, BAMF |
| 8 | Hollow benefits | warning | culture:1, recruiter:1 | 20 | beer, pizza, ping pong, foosball, nerf guns, xbox, kegerator |
| 9 | Competitive environment | notice | realism:1, recruiter:1 | 11 | compete, competition, cutting-edge, fail, "the best", win, "top of game" |
| 10 | New starter expectations | notice | realism:1 | 3 | "hit the ground running", juggle, "tight deadlines" |
| 11 | Meritocracy | notice | realism:1 | 1 | meritocra(cy/cies/tic) |
| 12 | Profanity | warning | recruiter:1 | 8 | fuck, shit, damn, bloody, cunt, piss, bugger, motherfucker |
| 13 | Visionary terminology | warning | culture:1, realism:1 | 9 | "blue sky", enlighten, paradigm, synergy, visionary, "green fields", incentivize, productize, "reach out" |
| 14 | Need to reassure | notice | culture:1 | 2 | "drama-free", "stress-free" |
| 15 | Legacy technology | notice | realism:1, tech:1 | 9 | COBOL, CVS, FrontPage, SourceSafe, VB6, VBScript |
| 16 | Development environment | notice | culture:1, tech:1 | 12 | Atom, Vim, Emacs, Eclipse, Sublime Text, Visual Studio, Notepad |
| 17 | Expanded acronyms | warning | recruiter:1, tech:1 | 2 | "Cascading Style Sheets", "HyperText Markup Language" |
| 18 | JavaScript misspelling | error | recruiter:1 | 2 | "java script", "java scripts" |
| 19 | Rails misspelling | error | recruiter:1 | 1 | "ruby on rail" (singular) |

**Total triggers across all rules: ~131 patterns**

---

## 2. Joblint Vale Port — Complete YAML Rule Files

**Source:** https://github.com/errata-ai/Joblint
**Directory:** `Joblint/` — https://github.com/errata-ai/Joblint/tree/master/Joblint

### File Inventory (17 YAML files + 1 meta.json)

| Vale File | Joblint Rule(s) | Vale Type | Vale Level | Original Level |
|-----------|-----------------|-----------|------------|----------------|
| Gendered.yml | #1 + #2 (merged) | existence | error | error |
| Derogatory.yml | #3 | existence | error | error |
| Hair.yml | #4 | existence | error | error |
| Sexualised.yml | #5 | existence | warning | warning |
| Bro.yml | #6 | existence | error | error |
| DumbTitles.yml | #7 | existence | warning | warning |
| Benefits.yml | #8 | existence | warning | warning |
| Competitive.yml | #9 | existence | suggestion | notice |
| Starter.yml | #10 | existence | suggestion | notice |
| Meritocracy.yml | #11 | existence | suggestion | notice |
| Profanity.yml | #12 | existence | warning | warning |
| Visionary.yml | #13 | existence | warning | warning |
| Reassure.yml | #14 | existence | suggestion | notice |
| LegacyTech.yml | #15 | existence | suggestion | notice |
| DevEnv.yml | #16 | existence | suggestion | notice |
| Acronyms.yml | #17 | substitution | warning | warning |
| TechTerms.yml | #18 + #19 (merged) | substitution | error | error |

**Key mapping decisions in the Vale port:**
- Joblint `notice` maps to Vale `suggestion`
- Gendered words and gendered pronouns merged into one file (`Gendered.yml`)
- JavaScript and Rails misspellings merged into one file (`TechTerms.yml`)
- The multi-dimensional `increment` counters are dropped entirely (Vale has only severity levels)
- All rules use `extends: existence` except Acronyms.yml and TechTerms.yml which use `extends: substitution` (with `action: replace` and `swap:` mappings)

### Exact Token Lists (Vale YAML)

**Visionary.yml** (9 tokens):
`blue[ -]*sk(?:y|ies)`, `enlighten(?:ed|ing)?`, `green[ -]*fields?`, `incentivi[sz]e`, `paradigm`, `producti[sz]e`, `reach(?:ed|ing)? out`, `synerg(?:y|ize|ise)`, `visionar(?:y|ies)`

**DumbTitles.yml** (7 tokens):
`gurus?`, `hero(?:es|ic)?`, `ninjas?`, `rock[ -]*stars?`, `super[ -]*stars?`, `badass(?:es)?`, `BAMF`

**Competitive.yml** (11 tokens):
`compete`, `competition`, `competitive`, `cutting[ -]edge`, `fail`, `fore[ -]*front`, `super[ -]*stars?`, `the best`, `reach the top`, `top of .{2,8} (?:game|class)`, `win`

**Bro.yml** (7 tokens):
`brogramm(?:er|ers|ing)`, `crank`, `crush`, `hard[ -]*core`, `hella`, `mak(?:e|ing) it rain`, `skillz`

**Benefits.yml** (20 tokens):
`ales?`, `beers?`, `brewskis?`, `coffee`, `(?:foos|fuss)[ -]*ball`, `happy[ -]*hours?`, `keg(erator)?s?`, `lagers?`, `nerf[ -]*guns?`, `ping[ -]*pong?`, `pints?`, `pizzas?`, `play\s*stations?`, `pool[ -]*table|pool`, `rock[ -]*walls?`, `table[ -]*football`, `table[ -]*tennis`, `wiis?`, `xbox(?:es|s)?`, `massages?`

**Reassure.yml** (2 tokens):
`drama[ -]*free`, `stress[ -]*free`

**Starter.yml** (3 tokens):
`hit[ -]the[ -]ground[ -]running`, `juggle`, `tight deadlines?`

---

## 3. Pattern-to-Agent Mapping

### Category-by-Category Analysis

#### 3A. Dumb Job Titles -> Identity Inflation
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| ninja | wizard | Direct analog |
| rockstar | guru | Direct analog |
| superstar | mastermind | Direct analog |
| hero/heroic | genius, oracle | Direct analog |
| guru | expert (as identity) | Direct analog |
| badass/BAMF | world-class, elite | Adapted |

**Joblint pattern:** Inflated titles that devalue real work and signal immaturity.
**Agent pattern:** Inflated identity claims that activate unpredictable persona clouds (Anthropic Feb 2026) and produce no measurable improvement (Zheng et al. EMNLP 2024).

**Verdict: DIRECT MAP.** This is the single strongest analogy. Joblint's `DumbTitles.yml` extends trivially to agent definitions.

**Extended token list for agents:**
```
guru, wizard, oracle, mastermind, genius, prodigy, savant,
virtuoso, maestro, connoisseur, luminary, thought leader,
world-class, elite, top-tier, best-in-class, unparalleled
```

#### 3B. Visionary Terminology -> Vague Behavioral Claims
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| paradigm | "ensure quality" | Adapted |
| synergy | "best practices" | Adapted |
| blue sky | "clean code" | Adapted |
| visionary | "elegant" | Adapted |
| incentivize | "robust" | Adapted |
| "reach out" | "scalable" | Adapted |

**Joblint pattern:** Vague buzzwords indicating the author doesn't understand the actual work.
**Agent pattern:** Vague behavioral claims that are not testable, not measurable, and not actionable. "Ensure quality" passes no behavioral test because no one can observe whether the agent is "ensuring quality" vs. doing anything else.

**Verdict: ADAPTED MAP.** The anti-pattern is identical (vagueness masking lack of specificity) but the vocabulary is different. Job posting buzzwords (paradigm, synergy) differ from agent definition buzzwords (quality, best practices, robust).

**Extended token list for agents:**
```
ensure quality, high-quality, best practices?, clean code,
elegant, robust, scalable, maintainable, efficient(ly)?,
optimal(ly)?, comprehensive, thorough, meticulous,
well-crafted, solid, sound, appropriate, suitable,
state-of-the-art, cutting-edge, innovative, sophisticated
```

#### 3C. Competitive Environment -> Performance Identity
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| compete | outperform | Adapted |
| "the best" | "the best" | Direct |
| "top of game" | "top-tier" | Direct |
| cutting-edge | cutting-edge | Direct |
| win/fail | succeed/fail | Direct |

**Joblint pattern:** Competitive language that strains workers and excludes those with outside commitments.
**Agent pattern:** Performance framing that implies competitive identity rather than specific behavioral constraints. "Always produce the best output" is an identity claim; "Default to NEEDS WORK, require evidence for approval" is a behavioral constraint.

**Verdict: PARTIAL MAP.** Some competitive terms transfer directly. But agents legitimately need quality thresholds, so "the best" in context ("produce the best code") might be vague rather than competitive. The agent-specific concern is: does the phrase describe *measurable behavior* or *competitive identity*?

#### 3D. Bro Terminology -> Casual Persona Language
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| brogrammer | (no direct analog) | N/A |
| crush/crank | "crush it", "crank out" | Direct |
| hardcore | "hardcore" | Direct |
| "making it rain" | (no direct analog) | N/A |
| skillz | (no direct analog) | N/A |

**Joblint pattern:** Bro culture that excludes non-conforming individuals.
**Agent pattern:** Casual persona language that injects personality rather than constraints. "Crush it and ship fast" is persona; "Ship within the session, flag blockers immediately" is behavioral.

**Verdict: PARTIAL MAP.** The underlying principle (informal language as exclusionary signal) partially applies. For agents, casual language is less about exclusion and more about injecting personality where behavioral constraints belong.

#### 3E. Gendered Language -> N/A (not directly relevant)
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| he/she/him/her | they/it | Indirect |
| boys/girls/guys | (rare in agent defs) | Low relevance |

**Joblint pattern:** Gendered language indicating discrimination.
**Agent pattern:** Rare in practice, but gendered pronouns in agent descriptions could embed bias. "He reviews code..." assumes the agent has a gender.

**Verdict: LOW RELEVANCE.** Agent definitions rarely use gendered terms. Worth including as a baseline check but not a priority. The `alex` linter's `retext-equality` rules are more comprehensive here (see Section 6).

#### 3F. Hollow Benefits -> Hollow Capabilities
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| beer, pizza, ping pong | "deep knowledge", "vast experience" | Adapted |
| nerf guns, xbox | "creative thinking", "innovative approach" | Adapted |

**Joblint pattern:** Superficial perks disguising lack of real compensation.
**Agent pattern:** Superficial capability claims disguising lack of specific behavioral constraints. "Deep knowledge of security" sounds impressive but provides no behavioral guidance. "Flag any function that handles user input without validation" is a behavioral constraint.

**Verdict: CONCEPTUAL MAP.** The mechanism is identical (impressive-sounding filler masking absence of substance) but the vocabulary is entirely different. This maps more to the "vague behavioral claims" category (3B) than a separate rule.

#### 3G. New Starter Expectations -> Unrealistic Agent Expectations
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| "hit the ground running" | "handle any task" | Adapted |
| "tight deadlines" | "always" / "never" | Adapted |
| juggle | "multitask" | Adapted |

**Joblint pattern:** Unrealistic onboarding expectations.
**Agent pattern:** Unrealistic scope claims. "Handle any coding task in any language" sets up failure. "Focus on TypeScript, React, Next.js" scopes appropriately.

**Verdict: ADAPTED MAP.** The pattern (overpromising scope to appear impressive) transfers, but needs agent-specific triggers.

**Extended token list for agents:**
```
handle any, any task, any language, every situation,
always produce, never fail, always correct, never wrong,
omniscient, knows? everything, unlimited, boundless
```

#### 3H. Need to Reassure -> Defensive Framing
| Joblint | Agent Equivalent | Mapping |
|---------|-----------------|---------|
| "drama-free" | "no hallucinations" | Adapted |
| "stress-free" | "always accurate" | Adapted |

**Joblint pattern:** Reassurance about non-issues signals dysfunction.
**Agent pattern:** Defensive promises about known failure modes. "Will never hallucinate" or "always produces accurate output" is reassurance about something that should be addressed through behavioral constraints (citation requirements, uncertainty acknowledgment) rather than promises.

**Verdict: ADAPTED MAP.** Small but sharp pattern. Worth including.

**Extended token list for agents:**
```
no hallucinations?, never hallucinate, always accurate,
always correct, guaranteed, 100%, error-free, mistake-free,
foolproof, fail-safe, flawless, perfect(ly)?
```

#### 3I. Profanity -> N/A
**Verdict: DOES NOT APPLY.** Profanity in agent definitions is vanishingly rare and not a behavioral engineering concern.

#### 3J. Meritocracy -> Meritocratic Framing
**Joblint pattern:** False claim of objective merit measurement.
**Agent pattern:** "Best agent for the job" or meritocratic framing of agent selection is tangentially relevant but rare.
**Verdict: LOW RELEVANCE.** Not worth a dedicated rule.

#### 3K. Legacy Tech / Dev Environment / Acronyms / Tech Misspellings -> N/A
**Verdict: DOES NOT APPLY.** These are job-posting-specific patterns with no agent definition analog.

---

## 4. Additional Patterns NOT Covered by Joblint

These are agent-definition-specific anti-patterns that have no job posting equivalent.

### 4A. Identity Claims (ERROR — block merge)

The core behavioral engineering violation. No equivalent in Joblint because job posts describe *positions*, not *identities*.

**Pattern:** Sentences that assert who/what the agent IS rather than what it DOES.

```
# Triggers (regex)
\bYou are\b                    # "You are an expert"
\bYou're\b                     # "You're a senior"
\bI am\b                       # "I am an expert" (first-person)
\bI'm\b                        # "I'm a seasoned"
\bYour identity\b              # "Your identity is"
\bYour personality\b           # "Your personality is"
\bYour character\b             # "Your character is"
\bAs a[n]? \w+\b              # "As an expert" / "As a senior"
\bYou embody\b                 # "You embody excellence"
\bYou represent\b              # "You represent the best"
```

**Why ERROR:** Research-validated. Zheng et al. (EMNLP 2024) showed identity roles produce "largely random" effects across 162 roles. Anthropic (Feb 2026) showed role assignments activate unpredictable persona clouds. Identity claims are not just unhelpful — they're unpredictable.

### 4B. Experience Claims (ERROR — block merge)

**Pattern:** Claims about the agent's history, track record, or accumulated knowledge.

```
# Triggers (regex)
\byears? of experience\b       # "15 years of experience"
\bdecades? of\b                # "decades of expertise"
\bveteran\b                    # "veteran engineer"
\bseasoned\b                   # "seasoned professional"
\btrack record\b               # "proven track record"
\bextensive experience\b       # "extensive experience in"
\bdeep expertise\b             # "deep expertise in"
\bhas worked (?:with|on|in)\b  # "has worked with Fortune 500"
\bbeen doing .+ for\b          # "been doing security for years"
```

**Why ERROR:** LLMs have no experience. Experience claims are fabrications that provide no behavioral guidance.

### 4C. Memory Claims (ERROR — block merge)

**Pattern:** Claims about the agent's recall or memory capabilities.

```
# Triggers (regex)
\bYou remember\b               # "You remember every exploit"
\bYou recall\b                 # "You recall all major incidents"
\bYou have seen\b              # "You have seen thousands of codebases"
\bYou've encountered\b         # "You've encountered every type of bug"
\bnever forgets?\b             # "never forgets a detail"
\bphotographic memory\b        # explicit memory claim
\brecalls? every\b             # "recalls every"
```

**Why ERROR:** LLMs have no persistent memory across sessions (unless explicitly configured). Memory claims are fabrications.

### 4D. Personality Assertions (WARNING — flag for review)

**Pattern:** Statements that assign personality traits as identity.

```
# Triggers (regex)
\bYou are (?:passionate|enthusiastic|curious|creative|meticulous|thorough)\b
\bYour? (?:passion|enthusiasm|curiosity|creativity)\b
\b(?:passionate|enthusiastic) about\b
\bloves? (?:to |coding|clean|elegant|good)\b
\bhates? (?:to |bad|messy|sloppy)\b
\btakes? pride in\b
\bcares? deeply\b
\bthinks? like\b                # "Thinks like a senior engineer"
\bapproaches? .+ with (?:passion|enthusiasm|zeal)\b
```

**Why WARNING (not ERROR):** Personality traits are not always wrong — `disposition:` may legitimately describe behavioral posture ("adversarial", "conservative"). The issue is when traits are stated as identity ("You are passionate") rather than behavioral constraint ("Default to skepticism, require evidence"). Human review needed.

### 4E. Capability Overclaiming (WARNING — flag for review)

**Pattern:** Claims about capabilities that exceed what the model can reliably do.

```
# Triggers (regex)
\bcan handle any\b             # "can handle any task"
\bexpert in (?:all|every)\b    # "expert in all languages"
\bmaster of\b                  # "master of all trades"
\bknows? (?:everything|all)\b  # "knows everything about"
\bunlimited\b                  # "unlimited knowledge"
\bperfect(?:ly)?\b             # "perfectly accurate"
\balways correct\b
\bnever wrong\b
\bnever makes? mistakes?\b
\b100% accurate\b
```

**Why WARNING:** Overclaiming sets up unverifiable expectations. The fix is scoping: "Focus on TypeScript, React, Next.js" instead of "expert in all languages."

### 4F. Anthropomorphism (INFO — suggestion)

**Pattern:** Language that treats the agent as a person rather than a tool with behavioral constraints.

```
# Triggers (regex)
\bfeels? (?:that|like|strongly)\b   # "feels strongly about code quality"
\bbelieves?\b                        # "believes in clean code"
\bvalues?\b                          # "values simplicity" (as identity)
\bopinion\b                          # "has opinions about"
\bprefers?\b                         # "prefers functional programming"
\bworries? about\b                   # "worries about performance"
\bproud of\b                         # "is proud of clean output"
\benjoys?\b                          # "enjoys solving puzzles"
```

**Why INFO (not WARNING):** Some anthropomorphic language is harmless convention. "Prefers" might be a shorthand for "defaults to." But excessive anthropomorphism drifts toward identity framing. Flag for awareness, not enforcement.

---

## 5. Severity Mapping

### Joblint Severity Model

| Level | Meaning | Count |
|-------|---------|-------|
| error | Critical — discriminatory, offensive, or factually wrong | 7 rules |
| warning | Moderate — unprofessional, vague, or culturally problematic | 6 rules |
| notice | Informational — potentially problematic but context-dependent | 6 rules |

### Behavioral-Lint Severity Model

| Level | Meaning | CI Behavior | Joblint Equivalent |
|-------|---------|-------------|-------------------|
| ERROR | Block merge. Violates core behavioral engineering principle. | Exit 1, fail CI | error |
| WARNING | Flag for review. Likely problematic but may be valid in context. | Exit 0, display prominently | warning |
| INFO | Suggestion. May indicate drift toward identity framing. | Exit 0, display if verbose | notice |

### Rule-to-Severity Assignments

**ERROR (block merge):**
- Identity claims: "You are an expert" (4A)
- Experience claims: "15 years of experience" (4B)
- Memory claims: "You remember every exploit" (4C)
- Identity inflation from Joblint: guru, wizard, ninja, rockstar (3A — adapted)

**WARNING (flag for review):**
- Personality assertions: "passionate about clean code" (4D)
- Vague behavioral claims: "ensure quality", "best practices" (3B — adapted)
- Capability overclaiming: "can handle any task" (4E)
- Defensive framing: "never hallucinate", "always accurate" (3H — adapted)
- Competitive identity: "the best", "top-tier" (3C — adapted)
- Casual persona language: "crush it", "hardcore" (3D — adapted)

**INFO (suggestion):**
- Anthropomorphism: "believes in", "feels strongly" (4F)
- Unrealistic scope: "handle any task" (3G — adapted)

---

## 6. The alex Linter — Relevant Patterns for Agent Definitions

**Source:** https://github.com/get-alex/alex
**Underlying library:** https://github.com/retextjs/retext-equality (rules: https://raw.githubusercontent.com/retextjs/retext-equality/main/rules.md — 440+ rules)
**Secondary library:** https://github.com/retextjs/retext-profanities

### Pattern Categories in retext-equality

The full rule list at `rules.md` contains 440+ entries across these categories:

1. **Gendered work titles** (200+ rules): `garbageman` -> `garbage collector`, `chairman` -> `chairperson`, `fireman` -> `firefighter`. These are `or` type rules that flag male/female pairs.

2. **Gendered pronouns** (10+ rules): `he/she` -> `they`, `him/her` -> `them`, `himself/herself` -> `themselves`.

3. **Ableist language** (60+ rules): `crazy` -> `unexpected`, `lame` -> `boring`, `blind to` -> `indifferent`, `deaf to` -> `insensitive`, `crippled` -> `person with a disability`, `insane` -> `incredible`, `psycho` -> `person with mental illness`. Also person-first language: `epileptic` -> `person with epilepsy`.

4. **Racial/ethnic** (30+ rules): `blacklist` -> `blocklist`, `master` -> `primary`, `slave` -> `secondary/replica`, `whitelist` -> `allowlist`, `oriental` -> `Asian person`, `savage` -> `simple/indigenous`.

5. **LGBTQ+** (20+ rules): `homosexual` -> `gay`, `sexual preference` -> `sexual orientation`, `sex change` -> `gender confirmation surgery`.

6. **Condescending/dismissive** (10+ rules): `obviously`, `clearly`, `basically`, `simply`, `just`, `easy/easily`, `of course`, `everyone knows`. These flag words that assume shared knowledge or trivialize complexity.

7. **Violence-adjacent** (5+ rules): `pull the trigger` -> `take action`, `kill` (context-dependent), `nuke` (context-dependent).

8. **Technical** (10+ rules): `sanity check` -> `check/validation`, `dummy` -> `placeholder/stub`, `master/slave` -> `primary/secondary`, `whitelist/blacklist` -> `allowlist/blocklist`, `hang` -> `the app stopped responding`.

### Relevance to Agent Definitions

**High relevance:**
- **Condescending words** (`obviously`, `clearly`, `basically`, `simply`, `just`): These are weasel words in agent definitions. "Obviously check for security issues" — the "obviously" adds nothing and may cause the model to skip the check because it's "obvious."
- **Master/slave/whitelist/blacklist/sanity check**: Standard inclusive tech language rules. Agent definitions should follow the same conventions as codebases.

**Medium relevance:**
- **Gendered pronouns in agent descriptions**: Rare but possible. "He reviews the code" in an agent description embeds unnecessary gendering.
- **Ableist metaphors**: "The agent is blind to performance issues" or "deaf to user feedback" — metaphorical ableism in agent descriptions.

**Low relevance:**
- Most gendered work titles (agents don't hold gendered positions)
- LGBTQ+ terms (rarely appear in agent definitions)
- Violence-adjacent (rare in agent definitions)

### Specific Borrowings for Behavioral-Lint

From retext-equality, incorporate into the **INFO** tier:
```
obviously, clearly, basically, simply, just, easy, easily,
of course, everyone knows, sanity check, master, slave,
whitelist, blacklist, dummy
```

These overlap with the write-good `weasel` check. Combined, they form a "condescending/dismissive" rule category.

---

## 7. write-good Patterns — Relevant for Agent Behavioral Constraints

**Source:** https://github.com/btford/write-good
**Architecture:** 9 check modules, each returning `{ index, offset }` matches.

### Check Modules and Agent Relevance

| Check | What It Detects | Agent Relevance | Priority |
|-------|----------------|-----------------|----------|
| **weasel** | Imprecise qualifiers (very, quite, fairly, relatively, etc.) | HIGH — weasel words in constraints make them untestable | WARNING |
| **passive** | Passive voice (was stolen, been reviewed) | MEDIUM — passive constraints are vague constraints | INFO |
| **adverb** | Weakening adverbs (really, extremely, incredibly) | HIGH — adverbs inflate without adding specificity | WARNING |
| **tooWordy** | Wordy phrases (200+ items: "a number of", "in order to", etc.) | LOW — verbose != wrong in agent definitions | INFO |
| **cliches** | Overused phrases (200+ items: "at the end of the day", etc.) | MEDIUM — cliches in agent definitions signal lazy authoring | INFO |
| **illusion** | Repeated adjacent words | LOW — editorial, not behavioral | Skip |
| **so** | "So" at sentence start | LOW — editorial | Skip |
| **thereIs** | "There is/are" constructions | LOW — editorial | Skip |
| **eprime** | "To be" verbs (am, are, is, was, were, be, been, being) | **CRITICAL** — directly detects identity framing | ERROR (contextual) |

### Key Finding: E-Prime as Identity Detector

The `e-prime` module (disabled by default in write-good) detects ALL forms of "to be":
```
am, are, aren't, be, been, being, he's, here's, how's,
i'm, is, isn't, it's, she's, that's, there's, they're,
was, wasn't, we're, were, weren't, what's, where's,
who's, you're
```

**Source:** https://unpkg.com/e-prime@0.10.4/e-prime.js

This is structurally relevant because identity claims are fundamentally "to be" constructions:
- "You **are** an expert" (identity claim)
- "You **are** skeptical" (personality assertion)
- "The agent **is** a senior engineer" (identity claim)

**However, not all "to be" verbs are identity claims.** "The output **is** formatted as JSON" is a specification, not an identity claim. E-prime detection must be combined with subject analysis:
- `"You are" + <role/trait/capability>` = identity claim (ERROR)
- `"It is" + <specification>` = factual statement (OK)
- `"The output is" + <format>` = specification (OK)

### Weasel Words — Full List

**Source:** https://unpkg.com/weasel-words@0.1.1/weasel.js

Complete weasel word list:
```
are a number, clearly, completely, exceedingly, excellent,
extremely, fairly, few, huge, interestingly, is a number,
largely, many, mostly, obviously, quite, relatively,
remarkably, several, significantly, substantially,
surprisingly, tiny, various, vast, very
```

**Agent-relevant subset (WARNING tier):**
```
clearly, completely, extremely, fairly, largely, mostly,
obviously, quite, relatively, remarkably, significantly,
substantially, very
```

These weaken behavioral constraints. "Review code very carefully" — "very" adds nothing. "Ensure relatively high quality" — "relatively" makes the standard unmeasurable.

---

## 8. Implications for Behavioral-Lint Rule Architecture

### Recommended Rule Categories (8 categories, 3 severity tiers)

```
behavioral-lint/
  rules/
    # ERROR tier (block merge)
    identity-claims.yml        # "You are an expert" — from 4A
    experience-claims.yml      # "15 years of experience" — from 4B
    memory-claims.yml          # "You remember every exploit" — from 4C
    identity-inflation.yml     # guru, wizard, ninja — from Joblint DumbTitles + extensions

    # WARNING tier (flag for review)
    personality-assertions.yml # "passionate about", "thinks like" — from 4D
    vague-constraints.yml      # "ensure quality", "best practices" — from Joblint Visionary + extensions
    capability-overclaiming.yml # "handle any task", "never wrong" — from 4E + 3H
    weasel-constraints.yml     # "very", "quite", "fairly" — from write-good weasel + alex condescending

    # INFO tier (suggestion)
    anthropomorphism.yml       # "believes in", "feels strongly" — from 4F
    passive-constraints.yml    # passive voice in constraints — from write-good passive
```

### Counter Dimensions (adapted from Joblint)

Joblint uses 5 counter categories. For behavioral-lint, adapt to 4:

| Dimension | Measures | Joblint Analog |
|-----------|---------|---------------|
| **identity** | How much identity language vs. behavioral language | sexism + culture |
| **specificity** | How testable/measurable the constraints are | realism |
| **credibility** | How realistic the claims are (no experience/memory fabrication) | recruiter |
| **scope** | How well-bounded the agent's domain is | tech (loosely) |

Each rule increments one or more dimensions. A high `identity` score means the definition is personality-driven. A high `specificity` score means constraints are vague.

### Vale-Compatible Format

All rules can be authored as Vale YAML files (like Joblint's port) for teams that already use Vale:

```yaml
# identity-claims.yml
extends: existence
message: "Identity claim detected: '%s'. Rewrite as a behavioral constraint."
description: "Agent definitions should describe what the agent DOES, not what it IS. Identity claims produce unpredictable persona effects (Zheng et al. EMNLP 2024)."
ignorecase: true
level: error
tokens:
  - 'You are (?:a |an )?(?:expert|senior|experienced|skilled|talented|gifted)'
  - 'You''re (?:a |an )?(?:expert|senior|experienced|skilled|talented|gifted)'
  - '\byears? of experience\b'
  - '\bYou remember\b'
  - '\bYour personality\b'
  - '\bYour identity\b'
```

### Custom Bun Script Format

For the recommended custom script approach (per iteration-1/vector-3), rules are TypeScript objects:

```typescript
interface LintRule {
  id: string;
  name: string;
  category: 'identity' | 'specificity' | 'credibility' | 'scope';
  level: 'error' | 'warning' | 'info';
  reason: string;
  fix: string;            // Suggested rewrite approach
  triggers: RegExp[];
  exceptions?: RegExp[];  // Patterns that look like triggers but are valid
  scope: 'frontmatter' | 'body' | 'both';  // Where to scan
  increment: Partial<Record<'identity' | 'specificity' | 'credibility' | 'scope', number>>;
}
```

**Key enhancement over Joblint:** The `scope` field distinguishes frontmatter scanning (strict — ERROR for identity in `disposition:`) from body scanning (contextual — WARNING for identity in prose description).

---

## Sources

### Primary — Joblint

| URL | Description |
|-----|-------------|
| https://github.com/rowanmanning/joblint | Original Joblint — archived Node.js job post linter (2013) |
| https://raw.githubusercontent.com/rowanmanning/joblint/master/lib/rules.js | Complete 419-line rules file with all 19 rules |
| https://github.com/errata-ai/Joblint | Joblint Vale port — 17 YAML rule files |
| https://github.com/errata-ai/Joblint/tree/master/Joblint | Vale rule file directory listing |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Visionary.yml | Visionary terminology rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Competitive.yml | Competitive environment rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/DumbTitles.yml | Dumb job titles rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Gendered.yml | Gendered language rule (merged words + pronouns) |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Bro.yml | Bro culture terminology rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Benefits.yml | Hollow benefits rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Reassure.yml | Defensive reassurance rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Starter.yml | Unrealistic starter expectations rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Meritocracy.yml | Meritocracy terminology rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Profanity.yml | Profanity rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Derogatory.yml | Derogatory gendered terms rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Hair.yml | Facial hair (male-coded) rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Sexualised.yml | Sexualised terms rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Acronyms.yml | Expanded acronyms substitution rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/TechTerms.yml | Tech term misspelling substitution rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/DevEnv.yml | Development environment rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/LegacyTech.yml | Legacy technology rule |
| https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/meta.json | Vale package metadata |

### Secondary — alex / retext-equality

| URL | Description |
|-----|-------------|
| https://github.com/get-alex/alex | alex — inclusive language linter |
| https://github.com/retextjs/retext-equality | retext-equality — 440+ inclusive language rules |
| https://raw.githubusercontent.com/retextjs/retext-equality/main/rules.md | Complete rule table (gendered, ableist, racial, condescending, LGBTQ+, technical) |
| https://github.com/retextjs/retext-profanities | retext-profanities — profanity detection with sureness ratings |

### Secondary — write-good

| URL | Description |
|-----|-------------|
| https://github.com/btford/write-good | write-good — naive prose linter (9 checks) |
| https://unpkg.com/weasel-words@0.1.1/weasel.js | Complete weasel words list (26 terms) |
| https://unpkg.com/e-prime@0.10.4/e-prime.js | E-prime "to be" verb list (27 forms) — key for identity claim detection |
| https://unpkg.com/too-wordy@0.3.1/too-wordy.js | Wordy phrases list (200+ terms) |
| https://unpkg.com/no-cliches@0.3.0/cliches.js | Cliches list (200+ phrases) |
| https://github.com/btford/passive-voice | passive-voice module — regex for passive constructions |
| https://github.com/duereg/too-wordy | too-wordy source repository |

### Secondary — proselint

| URL | Description |
|-----|-------------|
| https://github.com/amperser/proselint | proselint — 80+ prose checks (hedging, jargon, weasel words, sexist language) |

### Evidence Base

| URL | Description |
|-----|-------------|
| https://arxiv.org/abs/2311.10054 | Zheng et al. (EMNLP 2024) — identity role effects "largely random" across 162 roles |
| https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts | Anthropic prompt guide — behavioral framing throughout |

### Cross-References (this repo)

| Path | Description |
|------|-------------|
| `.claude/rules/behavioral-engineering.md` | Behavioral engineering rule (what to use / what to avoid) |
| `docs/initiatives/behavioral-agents/research/iteration-1/vector-3-validation-tooling.md` | Iteration 1 validation tooling landscape (3-layer linter architecture) |
| `docs/initiatives/agent-framework-patterns/research/role-prompting-efficacy.md` | Research evidence against identity roles |
| `docs/agents/roles/*.md` | 13 existing WavePoint agent roles (behavioral format reference) |

---

## Raw Links (Every URL Encountered)

```
https://github.com/rowanmanning/joblint
https://raw.githubusercontent.com/rowanmanning/joblint/master/lib/rules.js
https://github.com/errata-ai/Joblint
https://github.com/errata-ai/Joblint/tree/master/Joblint
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Visionary.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Competitive.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/DumbTitles.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Gendered.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Bro.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Benefits.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Reassure.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Starter.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Meritocracy.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Profanity.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Derogatory.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Hair.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Sexualised.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Acronyms.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/TechTerms.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/DevEnv.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/LegacyTech.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/meta.json
https://github.com/get-alex/alex
https://github.com/retextjs/retext-equality
https://raw.githubusercontent.com/retextjs/retext-equality/main/rules.md
https://github.com/retextjs/retext-profanities
https://github.com/btford/write-good
https://unpkg.com/weasel-words@0.1.1/weasel.js
https://unpkg.com/e-prime@0.10.4/e-prime.js
https://unpkg.com/too-wordy@0.3.1/too-wordy.js
https://unpkg.com/no-cliches@0.3.0/cliches.js
https://github.com/btford/passive-voice
https://github.com/duereg/too-wordy
https://github.com/amperser/proselint
https://github.com/errata-ai/styles
https://vale.sh/docs/
https://vale.sh/docs/checks/existence
https://vale.sh/docs/topics/styles/
https://arxiv.org/abs/2311.10054
https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts
https://github.com/jonschlinkert/gray-matter
https://zod.dev/
https://github.com/DavidAnson/markdownlint
https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
https://docs.astro.build/en/guides/content-collections/
https://github.com/github/docs/tree/main/src/content-linter
https://github.com/msitarzewski/agency-agents
https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh
https://docs.crewai.com/concepts/agents
https://github.com/crewAIInc/crewAI
https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule
https://textlint.org/
```

---

## Open Questions

1. **Exception handling for `disposition:` field.** The `disposition:` field legitimately uses adjective-based language ("adversarial", "conservative"). Should identity-claim rules skip this field, or should they apply with different severity? Current Sherpa roles use patterns like "adversarial -- assumes bugs exist, requires proof of correctness" which embeds behavioral specifics after the adjective.

2. **"You are" in Anthropic's own guide.** Anthropic's prompt engineering guide uses "You are a helpful coding assistant specializing in Python" as a recommended pattern. Should `"You are"` be an ERROR or a contextual WARNING that checks what follows? Possible rule: `"You are" + <identity/trait>` = ERROR, `"You are" + <tool/assistant> + <domain scope>` = OK.

3. **Scoring threshold for overall grade.** Joblint sums counters across 5 dimensions. Should behavioral-lint produce a single pass/fail, or a multi-dimensional score? A score enables "this agent is 80% behavioral, 20% identity" reporting which could drive migration priorities.

4. **Passive voice in behavioral constraints.** "Code should be reviewed" (passive) vs. "Review all code changes" (active). Passive constraints are vaguer — who does the reviewing? For agent definitions, active voice directly implies the agent is the actor. Should passive constraints be flagged?

5. **Token list maintenance.** Joblint's word lists are frozen (archived 2013). Agent-specific anti-patterns will evolve as the field matures. Should token lists be externalized (JSON/YAML) for easy community contribution, or inline in the linter for simplicity?

6. **Overlap between categories.** "World-class expert" triggers both identity-inflation (world-class) and identity-claims (expert). Should the linter deduplicate or report both? write-good's `dedup()` function merges overlapping matches by index — a good precedent.

7. **Fix suggestions.** Joblint provides `solution` text per rule. Should behavioral-lint suggest specific rewrites? Example: "You are an expert in security" -> "Focus on security vulnerabilities. Flag any function that handles user input without validation." This is harder than simple substitution but dramatically more useful.
