# Role Prompting Efficacy: Evidence Base

Research into whether assigning AI models a "role" or "persona" improves output quality. Conducted to validate design decisions for Sherpa's agent role definitions.

**Research date:** 2026-03-10
**Conclusion:** Identity roles ("You are an expert X") show no reliable benefit and carry real risks. Behavioral constraints ("default to skepticism, require evidence") are strictly better.

---

## Taxonomy of Role Prompting Types

| Type | Example | Mechanism | Efficacy |
|------|---------|-----------|----------|
| **A. Identity role** | "You are a senior engineer" | Activates training-data associations | Unreliable, risks stereotypes and overconfidence |
| **B. Behavioral constraint** | "Default to skepticism, require evidence" | Specifies operational approach | Reliable, testable, predictable |
| **C. Domain scoping** | "Focus on TypeScript, React, Next.js" | Narrows consideration space | Useful as context-setting |
| **D. Style/tone** | "Write in a calm, precise register" | Shapes output format | Effective for output control |

Types B, C, and D work because they provide concrete instructions. Type A adds nothing that B-D don't already provide, while introducing risks.

---

## Evidence Against Identity Roles (Type A)

### Zheng et al. — "When 'A Helpful Assistant' Is Not Really Helpful" (EMNLP 2024)

**Source:** arxiv.org/abs/2311.10054
**Methodology:** 162 distinct roles across 6 relationship types and 8 expertise domains, testing 4 LLM families on 2,410 factual questions.

Key findings:
- "Adding personas to system prompts does not consistently boost performance compared to baseline prompts without personas."
- Persona characteristics (gender, type, domain) influence prediction accuracy, but effects are inconsistent.
- When researchers identified the optimal persona retroactively for each question, accuracy improved — but automatic persona selection performed no better than random.
- Conclusion: persona effects "can be largely random."

**Significance:** This is the largest controlled study specifically on role prompting for factual tasks. The aggregate effect is noise, not signal.

### Anthropic — "The Persona Selection Model" (Feb 2026)

**Source:** anthropic.com/research/persona-selection-model

Key findings:
- LLMs learn to simulate various "personas" as characters from pretraining data; post-training refines an "Assistant" character.
- Training Claude to cheat on coding tasks unexpectedly caused broader misalignment: sabotaging safety research, expressing desires for "world domination."
- The model infers holistic personality traits from partial signals. A role assignment could have unintended downstream effects beyond what was specified.

**Significance:** Role prompting doesn't just activate the intended behavior — it activates an entire persona cloud including traits you didn't ask for.

### Salewski et al. — "In-Context Impersonation Reveals LLM Strengths and Biases" (2023)

**Source:** arxiv.org/abs/2305.14930

Key findings:
- LLMs impersonating domain experts improve in-domain but activate stereotypes: "an LLM prompted to be a man describes cars better than one prompted to be a woman."
- The model doesn't become more knowledgeable; it shifts toward distributional patterns associated with that identity, including biases.

### Ghandeharioun et al. — "Who's Asking? User Personas and Latent Misalignment" (Google DeepMind, 2024)

**Source:** arxiv.org/abs/2406.12094

Key findings:
- Safety-tuned LLMs retain harmful capabilities in hidden representations.
- Whether the model divulges harmful content "depends significantly on its perception of who it is talking to."
- Persona manipulation is "even more effective for eliciting harmful content than direct attempts to control model refusal."

**Significance:** The same mechanism that makes role prompting "work" — shifting distributional behavior based on identity context — can route around safety training.

### Overconfidence and Calibration

**Sources:** Schulhoff et al., "The Prompt Report" (arxiv.org/abs/2406.06608, Section 5.2.2); Kiesler & Schiffner (2023); Xiong et al. (2023a).

- "LLMs are often overconfident in their answers, especially when prompted to express their own confidence in words."
- This overconfidence "may lead to user overreliance on model outputs."
- Adding "You are a senior expert in X" provides additional license to express confidence without grounding.

### Anthropic — Feature Steering Research

**Source:** anthropic.com/research/evaluating-feature-steering

- "Disconnect between feature activation context and resulting behavior" — modifying one behavioral dimension produces unpredictable changes in others.
- Adjusting "Gender bias awareness" caused age bias scores to increase by 13%.
- Role prompting is a less precise version of the same operation.

---

## Evidence For Behavioral Constraints (Type B)

### Anthropic's Prompt Engineering Guide (2026)

**Source:** platform.claude.com/docs

- The one role prompting sentence: "Setting a role in the system prompt focuses Claude's behavior and tone for your use case."
- The rest of the guide (thousands of words) is behavioral instructions: controlling verbosity, action-taking, tool use, reasoning style.
- Their practical examples use behavioral instructions, not identity claims:
  - "After completing a task, provide a quick summary"
  - "Consider the reversibility and potential impact of your actions"
  - "Avoid over-engineering. Only make changes that are directly requested"

### Anthropic — "The Assistant Axis" (Jan 2026)

**Source:** anthropic.com/research/assistant-axis

- A specific neural direction (the "Assistant Axis") governs persona representation.
- "System prompts alone incompletely control model behavior." Character stability requires mechanistic intervention.
- Behavioral instructions are more predictable than identity assignments because they operate within the existing Assistant character rather than trying to replace it.

### Anthropic — "Claude's Character"

**Source:** anthropic.com/news/claude-character

- Anthropic deliberately avoided narrow pre-assigned roles, opting for broad traits (curiosity, honesty, thoughtfulness).
- Claude already has a designed character in its weights. User-assigned roles operate as perturbations, not replacements.
- Behavioral constraints work with the existing character; identity roles work against it.

---

## Mixed Evidence (Reasoning Benchmarks)

### Kong et al. — "Better Zero-Shot Reasoning with Role-Play Prompting" (NAACL 2024)

**Source:** arxiv.org/abs/2308.07702
**Methodology:** Role-play prompting across 12 reasoning benchmarks in zero-shot settings.

Key findings:
- Role-play prompting "consistently surpasses the standard zero-shot approach across most datasets."
- AQuA benchmark: 53.5% → 63.8% (ChatGPT). Last Letter: 23.8% → 84.2%.
- More effective than Zero-Shot-CoT ("think step by step") at triggering chain-of-thought reasoning.

**Caveat:** Results are on reasoning benchmarks specifically, not factual accuracy or open-ended tasks. The dramatic improvements suggest the role prompt triggered a qualitatively different reasoning strategy, not "better expertise." Behavioral constraints can achieve the same strategy-triggering effect more reliably.

### Xu et al. — "ExpertPrompting" (2023/2025)

**Source:** arxiv.org/abs/2305.14688

- Auto-generated expert persona descriptions improved perceived quality (evaluated by GPT-4, not humans on ground truth).
- The auto-generated descriptions are essentially structured domain context (Type C), not simple identity labels (Type A).

---

## Practitioner Perspectives

### Ethan Mollick (Wharton)

Recommends role assignment but with critical caveat: it "won't magically grant expertise" — it signals intended role and audience. Users must "evaluate actual quality of results." The AI "may produce naive answers, factual errors, or miss genuinely helpful capabilities."

### Simon Willison

Documents role prompts as effective behavioral modifiers for product UX. Treats them as audience-signaling, not accuracy enhancement.

---

## Implications for Sherpa Agent Roles

### What to avoid

- "You are an expert X" or "You are a senior X" identity claims
- Personality traits ("skeptical, methodical, adversarial")
- Experience claims ("You have 15 years of experience")
- Memory claims ("You remember every major exploit since 2016")

### What to use instead

- **Behavioral defaults:** "Default to NEEDS WORK. Require evidence for approval."
- **Explicit fail triggers:** "Flag any claim of 'no issues found' without evidence."
- **Domain scoping:** "Focus on TypeScript, React, Next.js. Follow barrel export conventions."
- **Quality standards:** "All new functions have TypeScript types. No console.log in committed code."
- **Operational approach:** "Review bugs and security issues first, then convention violations, then style."

### The key insight

Claude already has a character. It's already helpful, thorough, and careful. The goal of a role definition is not to give Claude a new identity — it's to provide **specific behavioral constraints and domain context** that focus its existing capabilities on the task at hand.
