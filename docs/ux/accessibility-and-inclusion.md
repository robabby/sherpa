# Accessibility & Inclusion

Practical rules for writing content that works for everyone — website, Studio app, and framework docs.

---

## Writing Accessible Content

**Use plain language.** Short sentences, common words. Aim for grade 8 readability or below.

**Structure with headings.** H2, then H3, then H4 — never skip a level. Headings create a navigable outline for screen readers.

**Don't rely on color alone.** Pair color with text, icons, or patterns. "Fields marked in red" means nothing to a colorblind user.

**Write descriptive link text.** Link text should describe the destination. Screen readers often navigate links out of context.

**Write meaningful alt text.** Describe what the image communicates, not what it looks like. Decorative images get empty `alt=""`.

**Write descriptive button labels.** Labels should say what the action does — generic labels force users to rely on surrounding context.

**Use tables for data, not layout.** Always include header rows. Use CSS for layout.

| Do | Don't |
|----|-------|
| "Read the [initiative convention](./initiative-convention.md)" | "[Click here](./initiative-convention.md) to learn more" |
| `alt="Bar chart showing 80% pilot failure rate"` | `alt="chart"` |
| "Save initiative", "Delete workflow" | "Submit", "OK", "Confirm" |
| "Start a new initiative" | "Instantiate a new initiative instance" |
| Decorative images: `alt=""` | `alt="decorative-banner.png"` |

---

## Inclusive Language

**Use gender-neutral language.** Default to "they/them" for singular unknown persons.

**Write about disability directly.** No euphemisms. "Disabled person" or "person with a disability" — follow the individual's preference when known.

**Avoid culturally specific idioms.** They don't translate and exclude non-native speakers.

**Don't call tasks "simple" or "easy."** What's easy for you may not be easy for the reader. Describe the steps instead.

| Do | Don't |
|----|-------|
| "When a user opens their dashboard" | "When a user opens his dashboard" |
| "Hey team" or "Hey everyone" | "Hey guys" |
| "Accessible to disabled users" | "Accessible to differently abled users" |
| "Uses a wheelchair" | "Wheelchair-bound" or "confined to a wheelchair" |
| "This takes two steps" | "This is simple" |
| "Add the config and restart" | "Just add the config" |

### Terms to Swap

Replace ability-based metaphors and idioms with direct alternatives.

| Instead of | Use |
|------------|-----|
| "Blind spot" | "Gap" or "oversight" |
| "Crippled" | "Broken" or "degraded" |
| "Lame" | "Weak" or "unconvincing" |
| "Sanity check" | "Confidence check" or "review" |
| "Hit it out of the park" | "Exceeded expectations" |
| "Low-hanging fruit" | "Quick wins" |

---

*See also: [Voice & Tone](./voice-and-tone.md) for how we speak, [Grammar & Mechanics](./grammar-and-mechanics.md) for formatting rules.*
