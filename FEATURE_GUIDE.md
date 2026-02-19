# Feature Guide — Wonderlic Practice

## Overview
A focused, personal Wonderlic prep app. Two modes. 1000+ questions with full explanations. Built for one person — feels like it.

---

## Core Data Model

### Question
```ts
type Question = {
  id: number
  category: QuestionCategory
  question: string
  options: string[]          // Always 4 options (A–D) or 5 (A–E)
  answer: number             // Index of correct option
  explanation: string        // Why the answer is correct
  difficulty?: 'easy' | 'medium' | 'hard'
}

type QuestionCategory =
  | 'verbal'          // Analogies, vocabulary, reading comprehension
  | 'math'            // Arithmetic, algebra, word problems
  | 'logic'           // Sequences, pattern recognition
  | 'spatial'         // Figures, shapes (if applicable)
  | 'general'         // Mixed / miscellaneous
```

### Session (runtime state)
```ts
type Session = {
  mode: 'test' | 'practice'
  questions: Question[]      // Shuffled subset for test, full set for practice
  current: number            // Index into questions array
  answers: Record<number, number | null>  // questionId -> chosen option index
  startTime: number          // Date.now() at session start
  timeLimit?: number         // Seconds — test mode only (12 minutes = 720s)
}
```

### User Progress (persisted in localStorage)
```ts
type UserProgress = {
  name: string               // Personalized name, set on first visit
  practiceIndex: number      // Where they left off in practice mode
  totalAnswered: number
  totalCorrect: number
  categoryStats: Record<QuestionCategory, { answered: number; correct: number }>
  sessionsCompleted: number
  lastActive: string         // ISO date
}
```

---

## Pages / Routes

```
/                   → Home / mode select
/test               → Test session (full timed Wonderlic simulation)
/practice           → Practice session (untimed, sequential)
/results            → Post-session results (test mode)
/progress           → Stats dashboard (optional phase 2)
```

All session state lives in React context / state — no server needed. Questions are static JSON. Progress persists in localStorage.

---

## Feature 1: Home Screen

**Purpose:** Entry point. Warm, welcoming, shows the two paths clearly.

**Elements:**
- Personalized greeting if name is set: "Hey [Name], ready to practice?"
- Two large mode cards side by side (stack on mobile):
  - **Test Mode** — "Simulate the real thing" — 50 questions, 12 minutes
  - **Practice Mode** — "No pressure, just reps" — unlimited, untimed
- Stats row beneath: total answered, overall accuracy, current streak (if tracked)
- Small "Continue Practice" shortcut if a practice session is in progress (resume from last index)

**First Visit Flow:**
- Simple name prompt modal: "What should I call you?" → stores in localStorage
- Skip option available ("Maybe later")

---

## Feature 2: Test Mode

**What it simulates:** The real Wonderlic Cognitive Ability Test — 50 questions, 12-minute time limit, scored out of 50.

**Flow:**
1. Confirmation screen: shows rules (50 Qs, 12 min, no going back), "Start Test" CTA
2. Question screen — one question at a time
3. User selects answer → immediately locked in, no change
4. Auto-advance to next question (no explanation shown during test — just like the real thing)
5. Timer counts down in top right — color shifts as time runs low
6. Test ends when: all 50 answered OR time runs out
7. Results screen

**Question screen — test mode:**
- Progress: "Question 12 / 50" (top left)
- Timer: MM:SS (top right, color-coded)
- Thin progress bar at top
- Question text (large, centered)
- Answer options (A–D, full width, single tap selects and locks)
- No "Check Answer" button — selection auto-advances after a short delay (300ms) to feel snappy but not jarring
- No explanation panel

**Timer behavior:**
- Starts at 12:00 on first question
- Persists across questions
- If timer hits 0:00 → session ends immediately, any unanswered questions count as wrong

**Results screen:**
- Score: X / 50
- Percentile estimate (hardcoded lookup table based on score)
- Time used vs time limit
- Category breakdown (how many right per category)
- Missed questions list — shows correct answer + explanation for each miss
- "Try Again" and "Go to Practice" CTAs

---

## Feature 3: Practice Mode

**What it is:** Sequential run through the full question bank, untimed. User controls pace completely.

**Flow:**
1. Jumps straight to the first unanswered question (resumes progress)
2. Question screen — one at a time
3. User selects an answer → "Check Answer" button appears → submit reveals feedback
4. Correct/incorrect state shown immediately on options
5. Explanation panel fades in below
6. "Next Question →" button to advance
7. Checkpoint screens at milestones (see below)
8. Can pause anytime — progress is saved

**Question screen — practice mode:**
- Progress: "Question 234 / 1000+" (top)
- Category pill: small tag showing e.g. "Math" or "Verbal"
- Thin progress bar
- Question text
- Answer options (tap to select, can change selection before submitting)
- "Check Answer" button (primary, activates after selection)
- Explanation panel (after submit)
- "Next →" button (after submit)

**Resuming:**
- Practice index stored in localStorage
- "Continue Practice" from home picks up exactly where left off
- "Start Over" option buried in settings (requires confirmation)

---

## Feature 4: Checkpoint Screens

**Purpose:** Break up the monotony. Celebrate progress. Keep it fun and personal.

**Trigger points (practice mode):**
| Question | Message Theme |
|---|---|
| 25 | "Warm up complete!" |
| 50 | First milestone — "50 down. You mean business." |
| 100 | Triple digits — "100 questions. The average person quit at zero." |
| 250 | Quarter of the way — random fun fact about the Wonderlic |
| 500 | Halfway — big celebration moment |
| 750 | "Almost there. Don't stop now." |
| 1000 | "You did it. Every single one." — full celebration screen |

Also trigger checkpoints at:
- 5 correct in a row (streak checkpoint)
- First time completing each category

**Checkpoint card design:**
- Full-screen takeover (modal or page)
- Big emoji / simple illustration
- Short, punchy message (2–3 lines max)
- Optional personalized touch (e.g. "Your score on math is 91% — [Name] is a numbers person 👀")
- Single CTA: "Keep going →" or "See your stats"

**Personalized messages (example set):**
- "10 questions in a row correct. Are you even trying anymore? (Keep going.)"
- "Halfway through. That's literally more prep than most people do. Period."
- "You just hit 500. I'm proud of you. Seriously."
- "Math section complete. Numbers fear you now."
- Use the stored name in messages occasionally for warmth.

---

## Feature 5: Explanation Panel

**Every question in practice mode (and on results screen after test) has an explanation.**

Explanation content should:
- State the correct answer plainly first: "The answer is B."
- Explain *why* in plain language — no jargon
- For math: show the step-by-step work
- For verbal/logic: explain the reasoning pattern
- Keep it to 2–5 sentences max — dense explanations don't help retention

Panel behavior:
- Hidden until user submits answer
- Fades in below answer options
- Does not push question/options off screen — scrollable if needed
- Sky-blue tinted to visually distinguish from question card

---

## Feature 6: Question Bank Structure

**Volume:** 1000+ questions (can start with 100–200 and expand)

**Category distribution (roughly):**
- Verbal: 30% (vocabulary, synonyms/antonyms, reading comp, analogies)
- Math: 35% (arithmetic, percentages, fractions, word problems, algebra)
- Logic: 25% (sequences, deductive reasoning, patterns)
- General / Mixed: 10%

**Question file format:**
- Static JSON file(s) at `/data/questions.json` (or split by category)
- Imported at build time — no API calls needed
- Questions shuffled in test mode (using seeded or random shuffle)
- Questions served sequentially in practice mode

**Difficulty tagging:**
- Nice to have, not required for v1
- Can use later to sort practice sets or filter review sessions

---

## Feature 7: Progress Tracking

**Stored locally (localStorage) — no backend required for v1.**

**Tracked data:**
- Overall: total answered, total correct, sessions completed
- Per category: answered + correct count
- Practice: current index (resume position)
- Test history: array of { date, score, timeUsed } (last N tests)
- Streak: consecutive days with activity (optional)

**Where it's shown:**
- Home screen: summary row (total answered, accuracy %)
- Post-test results: category breakdown
- Checkpoint screens: referenced in messages
- (Phase 2) `/progress` dashboard with full charts

---

## Feature 8: Settings (minimal)

Accessible via a small gear icon on home screen.

Options:
- Change display name
- Reset practice progress (confirmation required)
- Clear all data (double confirmation — "Are you sure? This can't be undone.")
- (Optional) Toggle: auto-advance in test mode on/off

---

## Out of Scope for v1

- User accounts / backend
- Leaderboards
- Multiplayer / shared sessions
- Paid features
- Adaptive difficulty algorithms
- Offline PWA (nice to have but not required)
- Mobile app (web is fine, but make it mobile-friendly)

---

## Tech Stack Decisions

| Concern | Decision | Reason |
|---|---|---|
| Framework | Next.js (App Router) | Already scaffolded |
| Styling | Tailwind CSS v4 | Already installed |
| State | React useState + Context | Simple enough, no Redux needed |
| Persistence | localStorage | No backend needed for v1 |
| Questions | Static JSON | Fast, simple, no API |
| Icons | Lucide React | Lightweight, clean |
| Animations | Tailwind transitions + CSS | No heavy animation lib needed |
| Fonts | Next.js font optimization | Inter or similar |

---

## Development Phases

### Phase 1 — Core (ship this)
- [ ] Question data model + first 100 questions seeded
- [ ] Home screen with name prompt
- [ ] Practice mode — full flow
- [ ] Test mode — full flow with timer
- [ ] Results screen
- [ ] Checkpoints (at least the milestone ones)
- [ ] Explanation panel

### Phase 2 — Polish
- [ ] Full 1000+ question bank
- [ ] Progress dashboard (`/progress`)
- [ ] Category filters in practice mode
- [ ] Streak tracking
- [ ] Better checkpoint messages

### Phase 3 — Nice to Have
- [ ] PWA support
- [ ] Keyboard shortcuts (1/2/3/4 to select answers, Enter to submit/advance)
- [ ] Review mode (re-do missed questions from a test)
- [ ] Dark mode refinements
