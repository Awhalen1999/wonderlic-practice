# Style Guide — Wonderlic Practice

## Philosophy
Clean, confident, slightly warm. This app is a gift — it should feel encouraging and a little personal, not like a sterile test-prep tool. Think "smart friend helping you study" not "corporate assessment software."

---

## Color Palette

### Primary (Indigo)
Used for primary actions, progress, active states.
- `indigo-600` — primary buttons, active selections
- `indigo-500` — hover states
- `indigo-100` — light backgrounds, highlights
- `indigo-50` — subtle tints

### Neutrals
- `zinc-950` — primary text
- `zinc-700` — secondary text, labels
- `zinc-400` — placeholder, disabled
- `zinc-100` — card borders, dividers
- `zinc-50` — page background
- `white` — card/surface background

### Semantic
- `emerald-500` — correct answer, success states
- `red-400` — incorrect answer, error states
- `amber-400` — checkpoint / milestone moments (the fun stuff)
- `sky-400` — informational (explanations, hints)

### Dark Mode
Support dark mode from day one. Map:
- Page bg: `zinc-950`
- Surface/card: `zinc-900`
- Border: `zinc-800`
- Primary text: `zinc-50`
- Secondary text: `zinc-400`

---

## Typography

### Font Stack
- **UI font:** System UI stack — `font-sans` (Inter via Next.js or system default)
- **Mono (answer labels):** `font-mono` for A / B / C / D labels only

### Scale
| Usage | Class | Notes |
|---|---|---|
| Page title | `text-3xl font-bold tracking-tight` | Home / mode select |
| Section heading | `text-xl font-semibold` | |
| Question text | `text-lg font-medium leading-relaxed` | Readable, not cramped |
| Answer option | `text-base font-normal` | |
| Explanation body | `text-sm leading-relaxed text-zinc-600` | |
| Label / meta | `text-xs font-medium uppercase tracking-wider text-zinc-400` | Timer, question count |
| Checkpoint message | `text-2xl font-bold` | Fun, prominent |

---

## Spacing & Layout

- Max content width: `max-w-2xl` centered — keeps questions focused and readable
- Card padding: `p-6` on mobile, `p-8` on md+
- Section gaps: `gap-6` between major sections
- Answer option gap: `gap-3` between choices
- Page vertical padding: `py-10` minimum

---

## Components

### Question Card
- `bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800`
- Question number label top-left, timer (test mode) top-right
- Question text centered vertically in its area
- Generous padding so nothing feels cramped

### Answer Option
Three states:
- **Default:** `bg-zinc-50 border border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all`
- **Selected (before submit):** `border-indigo-500 bg-indigo-50`
- **Correct:** `border-emerald-500 bg-emerald-50 text-emerald-800`
- **Incorrect (chosen):** `border-red-400 bg-red-50 text-red-800`
- **Correct (not chosen, revealed):** subtle `border-emerald-300 bg-emerald-50/50`

Letter label (A/B/C/D) is a small `font-mono rounded-md bg-zinc-200` pill on the left.

### Primary Button
`bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-6 py-3 transition-colors`

### Ghost / Secondary Button
`border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-medium rounded-xl px-6 py-3 transition-colors`

### Timer (Test Mode)
Top-right of question card. Color shifts:
- `>= 5min remaining` → normal `text-zinc-500`
- `2–5min` → `text-amber-500`
- `< 2min` → `text-red-500 font-semibold animate-pulse`

### Progress Bar
Thin `h-1.5 rounded-full bg-indigo-600` inside `bg-zinc-100 rounded-full` container. Lives at the very top of the question card or beneath the header. Subtle, always present.

### Explanation Panel
Slides in below the answer options after submitting. Distinct bg:
- `bg-sky-50 border border-sky-200 rounded-xl p-4 dark:bg-sky-950/30 dark:border-sky-800`
- Starts with "Here's why:" in `font-semibold text-sky-700`

### Checkpoint Card
Full-width, amber-tinted, fun. Shows at milestones (every 25%, halfway, etc.).
- `bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center`
- Large emoji or illustration area
- Personalized message (see Feature Guide)
- "Keep going →" CTA

---

## Motion & Transitions

Keep it subtle. No heavy animations — the goal is fast, fluid, not flashy.
- Answer selection: `transition-all duration-150`
- Explanation reveal: `transition-opacity duration-200` (fade in)
- Correct/incorrect state change: instant (don't delay feedback)
- Checkpoint card: simple fade-in `animate-in fade-in duration-300` (or equivalent)
- Page transitions: none needed — single-page feel

---

## Iconography

Use inline SVGs or a minimal icon library (Lucide is a good fit — lightweight, clean).
Common icons needed:
- Check mark (correct)
- X mark (incorrect)
- Clock (timer)
- Arrow right (next)
- Trophy / star (checkpoint)
- Home

---

## Tone of Voice (Copy)

- Warm but not over-the-top. One exclamation point max per screen.
- Direct: "Question 12 of 50" not "You're on your 12th question!"
- Encouragement is specific, not generic. "9/10 on the last set — you're on fire 🔥" not "Great job!"
- Checkpoints get the personality. Everywhere else: clean and clear.
- Placeholder name for GF can be personalized on first launch (store in localStorage).

---

## Dos and Don'ts

**Do:**
- Use `rounded-xl` and `rounded-2xl` — softer, friendlier corners
- Keep answer options full-width — easier to tap/click
- Always show question count and progress
- Animate feedback states immediately on answer

**Don't:**
- Don't use red for anything other than wrong answers
- Don't add shadows that compete with card focus
- Don't use more than 2 font weights per screen
- Don't auto-advance — always let the user control the pace in practice mode
- Don't clutter: one primary action per screen at a time
