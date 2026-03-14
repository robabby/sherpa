# Component Content Patterns

Per-component content guidance for Studio UI — structure, tone, and examples for every message type.

| Component | Structure | Tone |
|-----------|-----------|------|
| Error messages | What happened + why + how to fix. Imperative verbs on actions. | Calm, direct, solution-first |
| Empty states | Heading describes state. Body gives reason + next step. | Inviting, unhurried |
| Success messages | Confirm what happened. One sentence max. | Warm, brief |
| Warning messages | What might go wrong + how to prevent it. | Clear, not alarming |
| Info messages | One key point of additional context. | Helpful, concise |
| Confirmation dialogs | What will happen + is it reversible? Action verb on primary button. | Direct, specific |
| Loading states | Describe what's happening if visible > 2 seconds. | Calm, informative |
| Tooltips | One sentence. No period if fragment. | Brief, clarifying |

---

### Error messages
What happened + why + how to fix. 1-2 sentences. Imperative verbs ("Retry"), not vague labels ("OK").

| Do | Don't |
|----|-------|
| "Initiative not found. Check the slug and try again." | "Oops! We couldn't find that initiative anywhere!" |
| "Changes weren't saved. Retry or copy your work." | "An unexpected error has occurred. We apologize for the inconvenience." |
### Empty states
Heading describes the state. Body gives the reason and one clear next step.

| Do | Don't |
|----|-------|
| "No initiatives yet. Create one to get started." | "It's looking pretty empty in here!" |
| "No tasks match this filter." | "Oops, nothing to see here! Maybe try a different filter?" |
### Success messages
Confirm what happened. One sentence, then get out of the way.

| Do | Don't |
|----|-------|
| "Initiative approved." | "Your initiative has been successfully approved!" |
| "Saved." | "Great job! Your changes were saved successfully." |
### Warning messages
What might go wrong and what to do to prevent it. Don't catastrophize.

| Do | Don't |
|----|-------|
| "Removing this agent will stop three active workflows." | "WARNING: Dangerous action detected!" |
| "This initiative has unsaved changes." | "Careful! You might lose everything!" |
### Info messages
One key point of additional context. More than two sentences belongs in docs.

| Do | Don't |
|----|-------|
| "Behavioral constraints override identity claims." | "Here's some important information you should know about..." |
| "Next scheduled run: 2 PM." | "FYI: This workflow is configured to run periodically." |
### Confirmation dialogs
State what will happen and whether it's reversible. Action verb on primary button.

| Do | Don't |
|----|-------|
| "Delete this initiative? This can't be undone." Button: "Delete initiative" | "Are you sure?" Button: "OK" |
| "Archive 3 tasks? You can restore them later." Button: "Archive tasks" | "Do you really want to do this?" Button: "Yes" |
### Loading states
Describe what's happening if visible longer than 2 seconds. No bare spinners.

| Do | Don't |
|----|-------|
| "Loading initiatives..." | "Please wait while we fetch your data..." |
| "Connecting to server..." | (spinner with no text) |
### Tooltips
One sentence. Sentence fragments skip the period. Full sentences keep it.

| Do | Don't |
|----|-------|
| "Filters tasks by status" | "Click here to filter all of your tasks by their current status" |
| "Last edited March 13, 2026" | "This shows when the item was most recently edited by any user" |

---

*See also: [Voice & Tone](./voice-and-tone.md) for tone by context, [Design Principles](./design-principles.md) for visual design rules.*
