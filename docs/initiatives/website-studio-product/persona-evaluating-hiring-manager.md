---
status: integrated
initiative: website-studio-product
created: 2026-06-13
updated: 2026-06-13
type: guideline-evolution
risk: additive
targets:
  - docs/ux/personas.md
spawned-from: website-studio-product
---

# Proposal: Add "The Evaluating Hiring Manager" persona

> **Approved by Rob 2026-06-13 and integrated into `docs/ux/personas.md`** (version 0.2).
> The persona was added after "The Honest Executive"; the intro count was bumped to four.

## Summary

`docs/ux/personas.md` defines three personas — Practitioner, Technical Leader, Honest
Executive — all positioned around a consulting sales funnel. The site's actual top priority
is now employment search (the website orientation pivot: sherpa.solar is a Sherpa Studio
product site, with Rob's job search as the primary goal). No persona encodes the visitor who
matters most for that goal: the engineering hiring manager evaluating Rob as a candidate.
This proposal adds that persona so content gates (especially scorecard gate 8, persona
alignment) optimize for the right reader.

## State Snapshot

- `docs/ux/personas.md` (v0.1, updated 2026-03-14) defines three JTBD personas, no demographics.
- All three serve the consulting business: a Practitioner who champions the framework, a
  Technical Leader who evaluates it for a team, an Honest Executive who approves an engagement.
- The hiring-manager audit (`research/hiring-manager-audit-2026-06-12.md`, §7 gate 8 and §9-R10)
  flagged the gap: every content pass keeps optimizing for a consulting funnel because the
  rubric has no employer/hiring-manager persona, despite employment being the top priority.
- The CTA section currently pitches consulting ("If you'd like a guide, we consult too") at
  the exact visitor who came to evaluate a candidate.

## Proposed Change

Add the following persona to `docs/ux/personas.md`, after "The Honest Executive" and before
"The Journey Between Personas". Bump the file's `version` to 0.2 and `updated` to the merge date.

---

### The Evaluating Hiring Manager

| | |
|---|---|
| **Type** | Evaluator Persona |
| **JTBD** | When I'm assessing a candidate's portfolio, help me verify they designed and shipped a real system, so I can advocate for an interview. |

**Time budget:** 3–5 minutes, 2–3 clicks. They are skimming many candidates; the bar is
"is this worth a conversation," decided fast.

**Pain points**
- Most portfolios are tutorials, clones, or landing pages with nothing running behind them.
- Claims of scale and sophistication are rarely backed by anything inspectable.
- It's hard to tell, quickly, whether a candidate *designed* a system or just *used* one.

**Evaluation criteria:** Evidence over assertion — something running, a real decision trail,
shipped output. Signals of systems thinking (architecture, trade-offs, failure handling) over
feature lists. A clear, honest account of what's real and what's still in progress. Numbers
that reconcile with what's shown.

**Objections:** "Is this a real system or a demo?" "Did they build the hard parts or wire
together libraries?" "Every solo project claims to be production — show me." "Why can't I see
the code?"

**Content that resonates:** A screenshot or recording of the system actually running. A
case study that walks one real piece of work end to end. Posts that show the thinking and the
failures, not just the wins. A direct, human path to contact — name, GitHub, a way to reach out.
Honesty about what isn't public yet beats silence.

**Path to Sherpa:** Arrives from a job application, referral, or Rob's profile. Lands on the
homepage or framework page with minutes to spend. Converts to "I want to talk to this person"
when they see the system governing its own development — not when they read another feature
bullet. Leaves via the contact channels or bounces if the "wow" never arrives within their budget.

---

## Rationale

- The orientation pivot is recorded but not encoded in the rubrics. Until it is, every Worker
  drafting content and every Judge scoring it against gate 8 will keep serving the consulting
  funnel by default. Adding the persona makes the priority operational, not just stated.
- The audit's central finding — capability is asserted, never shown — is precisely this
  persona's top objection. Naming the persona lets `/framework` and the homepage be scored
  against "did we show a real system to someone deciding whether to interview Rob," which is
  the question that actually matters right now.
- "Evaluator Persona" (not Buyer/User) is a deliberate fourth type: this reader isn't buying
  the framework or adopting it — they're assessing the builder. The distinction keeps the
  consulting personas intact while adding the employment lens alongside them.

## Dependencies

None. Purely additive to `docs/ux/personas.md`. Does not alter the three existing personas.
Complements the Phase 4 content work (R9 framework cards, R7 posts) which already aim at this
reader; this proposal makes that targeting explicit in the rubric.

## Review Notes

- **Should the journey diagram change?** The existing "Journey Between Personas" diagram is a
  consulting-adoption funnel and doesn't include this persona by design — the Evaluating Hiring
  Manager sits outside that funnel. Left unchanged; open to a separate note if Rob wants the
  diagram to acknowledge the employment path.
- **Naming.** "Evaluating Hiring Manager" matches the audit's language. Alternative: "The
  Hiring Evaluator." Rob's call.
- **Gate 8 wiring.** Once merged, the content-quality scorecard's gate 8 should treat this
  persona as the primary check for `/framework` and the homepage. That's a usage convention,
  not a file change, so it's noted here rather than proposed as an edit.
