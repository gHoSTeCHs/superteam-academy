# Phase 6: Gamification UI

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up the streak system with a React hook and integrate it with lesson completion, then define the full achievement catalog to match on-chain achievement types.

**Architecture:** Streak state lives in `localStorage` (client-only, no server round-trip). The `use-streak.ts` hook wraps the `streaks.ts` utility from Task 16. Achievements are a static catalog in `lib/achievements.ts` — they mirror what exists on-chain but are used client-side for display and badge rendering.

**Tech Stack:** React hooks, localStorage, `streaks.ts` (already created in Task 16).

**Prerequisites:** Phase 4 complete. `streaks.ts` already exists at `app/src/lib/streaks.ts` (created in Task 16). Lesson complete button in `lesson-complete-button.tsx` calls `POST /api/solana/complete-lesson` successfully.

---

## Task 26: Streak System

**Files:**
- Already created in Task 16: `app/src/lib/streaks.ts`
- Create: `app/src/hooks/use-streak.ts`

**Step 1: Create streak hook**

`use-streak.ts` — wraps `streaks.ts` localStorage functions in a React hook:
- `currentStreak`, `longestStreak`, `lastActivityDate`
- `recordActivity()` — called when user completes a lesson
- `getCalendarData(month, year)` — for the streak calendar
- Milestone checks: 7, 30, 100 day badges

```typescript
export function useStreak(walletAddress: string) {
  const [streakData, setStreakData] = useState(() => getStreak(walletAddress));

  const recordActivity = useCallback(() => {
    const updated = recordActivityInStorage(walletAddress);
    setStreakData(updated);
  }, [walletAddress]);

  const milestones = useMemo(() => ({
    week: streakData.currentStreak >= 7,
    month: streakData.currentStreak >= 30,
    century: streakData.currentStreak >= 100,
  }), [streakData.currentStreak]);

  return { ...streakData, recordActivity, milestones, getCalendarData };
}
```

**Step 2: Integrate with lesson completion**

In `lesson-complete-button.tsx`:
- Import `useStreak`
- After `POST /api/solana/complete-lesson` returns success: call `recordActivity()`
- If a milestone was just crossed (e.g., streak went from 6 to 7), show a milestone toast

In `code-challenge.tsx`:
- The `onPass` callback chain already calls `POST /api/solana/complete-lesson`
- After that resolves: call `recordActivity()` from `useStreak`

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add streak tracking with localStorage and milestone rewards"
```

---

## Task 27: Achievement Definitions

**Files:**
- Create: `app/src/lib/achievements.ts`

**Step 1: Define achievement catalog**

Create static achievement definitions (to match what's created on-chain):

```typescript
export const ACHIEVEMENTS = [
  { id: 'first-steps', name: 'First Steps', category: 'progress', description: 'Complete your first lesson', xpReward: 50 },
  { id: 'course-completer', name: 'Course Completer', category: 'progress', description: 'Complete an entire course', xpReward: 200 },
  { id: 'speed-runner', name: 'Speed Runner', category: 'progress', description: 'Complete a course in under 24 hours', xpReward: 300 },
  { id: 'week-warrior', name: 'Week Warrior', category: 'streaks', description: '7-day streak', xpReward: 100 },
  { id: 'monthly-master', name: 'Monthly Master', category: 'streaks', description: '30-day streak', xpReward: 500 },
  { id: 'century-scholar', name: 'Century Scholar', category: 'streaks', description: '100-day streak', xpReward: 1000 },
  { id: 'rust-rookie', name: 'Rust Rookie', category: 'skills', description: 'Complete a Rust course', xpReward: 150 },
  { id: 'anchor-expert', name: 'Anchor Expert', category: 'skills', description: 'Complete all Anchor courses', xpReward: 500 },
  { id: 'defi-degen', name: 'DeFi Degen', category: 'skills', description: 'Complete a DeFi course', xpReward: 150 },
  { id: 'nft-creator', name: 'NFT Creator', category: 'skills', description: 'Complete an NFT course', xpReward: 150 },
  { id: 'early-adopter', name: 'Early Adopter', category: 'special', description: 'Join during launch month', xpReward: 100 },
  { id: 'perfect-score', name: 'Perfect Score', category: 'special', description: 'Score 100% on all quizzes in a course', xpReward: 250 },
  { id: 'code-warrior', name: 'Code Warrior', category: 'special', description: 'Complete 10 code challenges', xpReward: 200 },
  { id: 'polyglot', name: 'Polyglot', category: 'special', description: 'Use the app in all 3 languages', xpReward: 75 },
  { id: 'community-builder', name: 'Community Builder', category: 'special', description: 'Share a certificate on Twitter', xpReward: 50 },
] as const;

export type AchievementId = typeof ACHIEVEMENTS[number]['id'];
export type AchievementCategory = typeof ACHIEVEMENTS[number]['category'];
```

~15 achievements across 4 categories (progress, streaks, skills, special).

**Step 2: Wire achievement checks**

In `lesson-complete-button.tsx`, after lesson completion:
- If this is the user's first lesson: show "First Steps" achievement toast
- If this completes a course: show "Course Completer" achievement toast
- If streak milestone just crossed: show corresponding streak achievement toast

These are UI-only toasts — the actual on-chain `AchievementReceipt` PDA is created separately by the backend (or admin). The toast is optimistic.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add achievement definitions catalog"
```

---

## Phase Gate — Must Pass Before Starting Phase 7

All of the following must be true before proceeding:

- [ ] `cd app && npx tsc --noEmit` exits with code 0
- [ ] `cd app && npx next build` exits with code 0
- [ ] Complete a lesson in the browser → streak calendar on dashboard shows today highlighted
- [ ] `localStorage` in DevTools contains key `streak_<walletAddress>` with correct `currentStreak` value
- [ ] Complete a lesson on 2 consecutive days (or manually set `lastActivityDate` to yesterday in DevTools, then complete a lesson) → `currentStreak` increments
- [ ] `app/src/lib/achievements.ts` exports `ACHIEVEMENTS` with ≥ 15 entries
- [ ] Achievement toast appears in UI after completing first lesson (shows "First Steps" badge)
- [ ] Dashboard `recent-achievements.tsx` renders achievement badges for any `AchievementReceipt` PDAs on the wallet
