---
title: >
  Portfolio Site Benchmarks — What the Best Engineering Sites Get Right in 2026
date: 2026-03-21
category: heartbeat
trigger: >
  Queue item #7. Rob has Claude Code actively updating robabby.com. Concrete patterns from the best sites will directly inform design decisions.
summary: >
  Analyzed 15+ top engineering portfolios and hiring manager feedback. The pattern that wins at Staff+ level is authority-first, not flash-first. Brittany Chiang's site (the most referenced in the space) uses a single-page dark layout with clean typography and subtle hover effects. Key finding from recruiter research — hiring managers spend seconds on visual quality, then go to the hero statement, then scan work previews. The About page is visited AFTER they already like the work. Rob's site already has strong bones — the gaps are narrative coherence (Sherpa/Studio missing) and the hero/title not reflecting current positioning.
---

## What the Best Engineering Portfolios Have in Common

Analyzed 15+ portfolios from SiteBuilderReport's 2026 curation, the emmabostian/developer-portfolios GitHub list, and recruiter/hiring manager feedback research.

### The 5 Patterns That Win

#### 1. Authority-First, Not Flash-First
The best Staff+ portfolios lead with credibility, not animations. Tom (Staff SWE at Figma): "clean and confident with a simple, scroll-friendly layout." Sahana (Engineering Manager, 10+ years): "clear and to the point, with a polished layout." Irene (GitHub Next, Google Creative Lab): "organized like a modern CV, with clear sections and plenty of space."

**The anti-pattern:** Tamal (5+ years frontend) — "engaging and interactive, with lots of sections and motion, though it can feel busy due to the amount of content on a single page." At junior level, energy works. At Staff level, restraint signals confidence.

**For Rob:** robabby.com already has this — the parallax hero and animated stats bar are tasteful, not excessive. The design DNA is right.

#### 2. The Hero Statement Does 80% of the Work
From the Open Doors Careers recruiter research (Oct 2025):
> "The hero is your first real chance to show fit. It's where someone figures out what kind of [engineer] you are and whether that overlaps with what they're looking for."

> "One or two short sentences that define what you do and where your strengths lie. Avoid the empty lines everyone writes when they don't know what to say."

> "If your hero section feels human and distinct, people scroll. If it's generic, they close the tab."

**For Rob:** Current hero says "Staff Engineer & AI-Augmented Builder" with tagline "From Design Systems to Intelligence-Native Products." This is decent but doesn't mention Sherpa, WavePoint, or the founder angle. The copy drafts from earlier research (heartbeat 2026-03-21-1820) have stronger options.

#### 3. Work Previews Need Clear Titles That Tell What Was Achieved
> "If you designed a group payment feature for PayPal, don't call the case study 'Group Payment' or 'PayPal Internship.' Say something that tells me what the project achieved."

**For Rob:** The WavePoint featured work section is strong — "What I Built / How I Built It / Why It Matters" is a good structure. But Sherpa Studio needs to be here too. The narrative audit identified this gap.

#### 4. Visual Quality Is the Gate (Seconds, Not Minutes)
> "The first assessment isn't about what you write — it's about what it feels like. The visual appearance of your portfolio is your first test, and it happens in seconds."

> "You don't need fancy interactions or animations. You need clarity. Good typography. Comfortable spacing. A sense of taste."

**For Rob:** robabby.com passes this test. The Radix UI foundation, clean typography, and SVG architecture diagrams signal craftsmanship. The design is professional without being flashy.

#### 5. The About Page Is Visited AFTER They Like the Work
> "The About page is where people go after they already like your work. It's the place that turns a good candidate into someone they'd want to meet."

**For Rob:** The About section is inline (not a separate page), which means it's seen in the scroll flow regardless. Good. But the content needs the Sherpa/Studio additions from the copy drafts.

## The Brittany Chiang Standard

Brittany Chiang's portfolio (brittanychiang.com) is the most-referenced engineering portfolio in the space. What it gets right:

- **Single-page dark layout** — no complex navigation, just scroll
- **Hero:** Name, title, one sentence positioning, subtle animation
- **Work history as a scrollable carousel** — not a wall of text
- **Consistent accent color** (green) throughout
- **Subtle hover effects** that reward exploration without demanding attention
- **Client list as credibility signal** (Harvard, Pratt, Vanderbilt)
- **One Page Website Award winner** — recognized for design quality

**What Rob already has that's comparable:** Dark theme, clean layout, animated stats, SVG diagrams (actually more sophisticated than Chiang's). What's missing: the narrative clarity. Chiang's positioning is instantly clear. Rob's current positioning ("Staff Engineer & AI-Augmented Builder") doesn't tell the story.

## Audit: How robabby.com Compares

| Element | Best Practice | robabby.com Status |
|---|---|---|
| Visual quality / first impression | Clean, confident, professional | ✅ Strong |
| Hero statement (clear positioning) | Specific, memorable, searchable | ⚠️ Needs update (no Sherpa/Studio mention) |
| Site title (SEO/social) | Matches current positioning | ❌ Says "Staff Frontend Engineer" |
| Featured work with outcomes | Clear titles, what was achieved | ✅ WavePoint is strong; ❌ Sherpa Studio missing |
| Experience section | Reverse chronological, metrics-driven | ✅ Good; ❌ Sherpa entry missing |
| About narrative | The full arc, human voice | ⚠️ Good bones but needs Sherpa/Studio content |
| Case studies with depth | Process + results + reflection | ✅ PartySlate venue page, Savo design system |
| Projects section | Featured + secondary | ⚠️ Claude Skills is there; Sherpa Studio should be featured |
| Blog/content section | Establishes thought leadership | ❌ No blog infrastructure |
| Contact/availability | Clear, accessible | ✅ "Available for opportunities" badge |
| Resume download | One-click access | ✅ PDF download in hero |
| Mobile responsiveness | Works on all devices | ✅ (Radix UI responsive patterns) |
| Performance | Fast load, no jank | ✅ Next.js static generation |

## Key Takeaway for Rob

The site's **design and technical quality** are already at or above the benchmark. The gaps are entirely **content and narrative**:

1. Sherpa and Sherpa Studio need to exist on the site (the #1 gap from the narrative audit)
2. The hero/title need to reflect current positioning
3. A blog route would strengthen inbound discovery

All three are being actively addressed by the Claude Code sessions today. The design doesn't need a redesign — the content needs to catch up to the design.

---

## Sources

1. SiteBuilderReport — Software Engineer Portfolios (2026): https://www.sitebuilderreport.com/inspiration/software-engineer-portfolios
2. Brittany Chiang portfolio: https://brittanychiang.com/
3. One Page Love — Brittany Chiang analysis: https://onepagelove.com/brittany-chiang
4. Open Doors Careers — How Recruiters and Hiring Managers Actually Look at Your Portfolio (Oct 2025): https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio
5. Zencoder — How to Create a Software Engineer Portfolio 2026: https://zencoder.ai/blog/how-to-create-software-engineer-portfolio
6. emmabostian/developer-portfolios (GitHub): https://github.com/emmabostian/developer-portfolios
7. Colorlib — 21 Best Developer Portfolios 2026: https://colorlib.com/wp/developer-portfolios/
