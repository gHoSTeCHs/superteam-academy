# Phase 4: Student Pages

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all 10 student-facing pages — landing, course catalog, course detail, lesson view (with mobile tabs and CodeChallenge), dashboard, profile, leaderboard, settings, certificate, and sign-in.

**Architecture:** Mix of server components (data fetching from Sanity + on-chain) and client components (interactive UI, wallet state). All pages are locale-prefixed under `app/src/app/[locale]/`. All text strings from `useTranslations`.

**Tech Stack:** Next.js App Router RSC, Sanity GROQ queries, SolanaProgressService, Better Auth session, Monaco Editor, Tiptap renderer, next-intl, Radix UI.

**Prerequisites:** Phases 0–3 complete. App shell renders (header/footer/layout). At least one course seeded in Sanity Studio (create manually at `/studio` before building Task 13+). On-chain course PDA exists on devnet for the test course.

---

## Task 12: Landing Page

**Files:**
- Create: `app/src/app/[locale]/page.tsx` (replace existing)
- Create: `app/src/components/landing/hero.tsx`
- Create: `app/src/components/landing/features.tsx`
- Create: `app/src/components/landing/course-preview.tsx`
- Create: `app/src/components/landing/cta.tsx`

**Step 1: Build landing page sections**

- Hero: Title, subtitle, CTA buttons (Browse Courses, Connect Wallet). Animated or visual element.
- Features: 3-4 cards (Interactive Coding, On-Chain Credentials, XP & Leaderboards, Multi-Language)
- Course Preview: Fetch 3 featured courses from Sanity, show cards with title, description, difficulty badge, lesson count. Add `priority` prop to the hero image (LCP element).
- CTA: Bottom section encouraging sign-up

All strings from `useTranslations('Landing')`.

**Step 2: Verify**

Run: `npm run dev` — landing page renders.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add landing page with hero, features, course preview"
```

---

## Task 13: Course Catalog Page

**Files:**
- Create: `app/src/app/[locale]/courses/page.tsx`
- Create: `app/src/components/courses/course-card.tsx`
- Create: `app/src/components/courses/course-filters.tsx`

**Step 1: Build course catalog**

Server component that fetches all published courses from Sanity. Displays as a grid of cards. Each card: title, description, difficulty badge, module count, lesson count, XP total, enrollment count (from on-chain `course.totalEnrollments`). Add `priority` to first-row card thumbnails (above the fold).

**Step 2: Add filters**

`course-filters.tsx`: Filter by difficulty (beginner/intermediate/advanced), track, search by title. Client component with URL search params.

**Step 3: Verify**

Requires at least one course in Sanity. Use Sanity Studio to create a test course.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add course catalog page with filters"
```

---

## Task 14: Course Detail Page

**Files:**
- Create: `app/src/app/[locale]/courses/[slug]/page.tsx`
- Create: `app/src/components/courses/course-header.tsx`
- Create: `app/src/components/courses/module-list.tsx`
- Create: `app/src/components/courses/enroll-button.tsx`
- Create: `app/src/components/courses/progress-bar.tsx`

**Step 1: Build course detail page**

Server component. Fetches course from Sanity by slug with all modules and lessons. Also fetches on-chain Course PDA for enrollment count, completion count.

Sections:
- Course header: title, description, difficulty, track, XP breakdown, creator
- Enroll button: if not enrolled, shows "Enroll" (wallet signs `enroll` tx). If enrolled, shows progress bar.
- Module accordion: expandable modules showing lesson list with completion checkmarks
- Prerequisites: if course has prerequisite, show prerequisite course card with completion status

**Step 2: Build enroll button (client component)**

`enroll-button.tsx`:
- Uses `useWallet()` to get connected wallet
- Checks enrollment via `getEnrollment(courseId, wallet)`
- If not enrolled: builds and sends `enroll` transaction
- If enrolled: shows progress bar with lesson completion count
- If completed: shows "Completed" badge + view credential link

**Step 3: Verify**

Run: `npm run dev` — navigate to `/courses/test-course`.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add course detail page with enrollment and progress"
```

---

## Task 15: Lesson View Page

**Files:**
- Create: `app/src/app/[locale]/courses/[slug]/lessons/[lessonSlug]/page.tsx`
- Create: `app/src/components/lessons/lesson-content.tsx`
- Create: `app/src/components/lessons/lesson-navigation.tsx`
- Create: `app/src/components/lessons/lesson-complete-button.tsx`
- Create: `app/src/components/lessons/content-block-renderer.tsx`
- Create: `app/src/components/lessons/code-challenge.tsx`
- Create: `app/src/components/ui/xp-burst.tsx`
- Create: `app/src/hooks/use-code-challenge.ts`

**Step 1: Build lesson view**

Server component. Fetches lesson from Sanity with all content blocks.

Desktop layout: two-column split-pane — left column (60%) holds text/quiz/callout/image/video blocks; right column (40%) is a sticky pane that holds the active `CodeChallenge` or `CodeEditor` for the current block. When no code block is active, the right pane collapses and the left column expands to full width.

Main area: sequential rendering of content blocks using `content-block-renderer.tsx`:
- `text` → `TiptapRenderer`
- `code_example` → `CodeEditor` (read-only, rendered in right pane)
- `code_challenge` → `CodeChallenge` component (interactive, rendered in right pane)
- `quiz` → `QuestionRenderer` (interactive, inline in left column)
- `callout` → styled callout card (inline in left column)
- `image` → responsive image with caption (inline in left column)
- `video_embed` → `VideoPlayer` with checkpoints (inline in left column)

**Step 2: Mobile responsive layout**

On screens `< 768px` the split-pane collapses to a vertical tabbed layout. A tab bar with two tabs — **"Content"** and **"Code"** — replaces the side-by-side panes. Switching to the Code tab scrolls to or reveals the active code block. Implementation:

- Wrap the two-column grid in a responsive container: `grid-cols-1 md:grid-cols-[3fr_2fr]`
- Add a `<MobileLessonTabs>` client component that renders the tab bar only on mobile (`flex md:hidden`) and controls which pane is visible via local state
- The Content tab shows all non-code blocks stacked vertically
- The Code tab shows the `CodeChallenge` or `CodeEditor` for the current lesson section, defaulting to the first code block
- Tab state resets when lesson slug changes (use `useEffect` on `lessonSlug`)
- No separate route needed — same page, CSS-driven visibility with tab state overlay

**Step 3: Build CodeChallenge component**

`code-challenge.tsx` is a self-contained client component. It receives the full `code_challenge` content block as props. Internal state machine has these states: `idle → running → pass | fail → revealed`.

Props interface:
```typescript
interface CodeChallengeProps {
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expectedOutput: string; label: string }[];
  hints: string[];
  language: string;
  maxAttempts: number;
  lessonIndex: number;
  courseId: string;
  onPass: () => void;
}
```

UI layout (top to bottom):
1. **Editor area** — Monaco Editor initialized with `starterCode`. Read-only lines above a `// YOUR CODE HERE` marker are locked (use Monaco's `readOnly` ranges). Language set from `language` prop.
2. **Action bar** — "Run Tests" button (primary), attempt counter `(2 / 3 attempts used)`, "Get a Hint" button (secondary, disabled until first failed attempt).
3. **Test results panel** — shown after each run. Renders one row per test case: green checkmark + label on pass, red X + expected vs actual diff on fail. Animates in with a slide-up transition.
4. **Hint drawer** — collapsible. Each hint is revealed one at a time (never show all at once). "Next Hint" button cycles through `hints[]`. Hint count shown: `Hint 1 of 3`.
5. **Solution reveal** — shown only after `maxAttempts` exhausted OR after passing. On exhaustion: "Show Solution" button appears, clicking replaces editor content with `solutionCode` and marks the block as viewed-solution (tracked in local state, does not block XP). On pass: solution is never auto-shown.
6. **XP award animation** — triggered by `onPass()` callback. Uses `xp-burst.tsx` portal: `+{xp} XP` in large text rises and fades out over 1.5s. Overlays the entire lesson view.

State managed via `use-code-challenge.ts` hook:
```typescript
interface CodeChallengeState {
  code: string;
  status: 'idle' | 'running' | 'pass' | 'fail' | 'revealed';
  attempts: number;
  testResults: { label: string; passed: boolean; actual?: string }[];
  hintsRevealed: number;
  solutionShown: boolean;
}
```

Test execution: POST to `/api/code-runner/run` with `{ code, language, testCases }`. The API route calls Judge0 (or mock runner if `CODE_RUNNER_BACKEND=mock`). On pass (all test cases green), call `onPass()` which triggers the XP animation and then calls `POST /api/solana/complete-lesson`.

**Step 4: Build XP burst portal**

Create `app/src/components/ui/xp-burst.tsx` — shared by both `CodeChallenge` and `lesson-complete-button.tsx`. Accepts `xp: number` and `visible: boolean`. When `visible`, renders via `ReactDOM.createPortal` into `document.body`. CSS keyframe: element starts at `opacity: 1, translateY: 0`, animates to `opacity: 0, translateY: -80px` over 1.5s, then `visible` is set back to false.

**Step 5: Build lesson navigation**

`lesson-navigation.tsx`: Previous/Next lesson buttons. Shows current position (Lesson 3 of 10). Module name breadcrumb.

**Step 6: Build lesson complete button**

`lesson-complete-button.tsx` (client component):
- Calls `POST /api/solana/complete-lesson` when clicked
- Backend signs the transaction
- Shows XP earned animation via `XpBurst`
- Checks if all lessons complete → shows "Finalize Course" button
- On finalize: calls `POST /api/solana/finalize-course`

**Step 7: Verify**

Navigate to a lesson page on desktop — confirm split-pane renders. Resize to < 768px — confirm tab bar appears and Content/Code tabs switch correctly. Open a code challenge lesson — confirm editor loads with starter code, run tests, see pass/fail states, cycle hints.

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add lesson view with mobile tabs, CodeChallenge component, and completion"
```

---

## Task 16: Dashboard Page

**Files:**
- Create: `app/src/app/[locale]/dashboard/page.tsx`
- Create: `app/src/components/dashboard/xp-level-card.tsx`
- Create: `app/src/components/dashboard/streak-calendar.tsx`
- Create: `app/src/components/dashboard/active-courses.tsx`
- Create: `app/src/components/dashboard/recent-achievements.tsx`
- Create: `app/src/components/dashboard/activity-feed.tsx`
- Create: `app/src/lib/streaks.ts`

**Step 1: Create streak utility**

Create `app/src/lib/streaks.ts`:
- Reads/writes to `localStorage` (key: `streak_<walletAddress>`)
- Tracks: `{ currentStreak: number, longestStreak: number, lastActivityDate: string, activityDays: string[] }`
- `recordActivity()` — marks today as active, updates streak
- `getStreak()` — returns current streak data
- `getCalendarData(month, year)` — returns array of days with activity flags

**Step 2: Build XP/Level card**

`xp-level-card.tsx` (client component):
- Fetches XP balance from Token-2022 ATA via `SolanaProgressService`
- Shows: XP number, level number, progress to next level (visual bar)
- Level formula: `floor(sqrt(xp / 100))`
- Next level XP: `(level + 1)^2 * 100`

**Step 3: Build streak calendar**

`streak-calendar.tsx`:
- GitHub-style contribution grid showing last 3 months
- Green squares for active days, gray for inactive
- Current streak count + longest streak
- Milestone badges at 7, 30, 100 days

**Step 4: Build active courses**

`active-courses.tsx`:
- Lists enrolled but not completed courses
- Shows progress bar per course (from bitmap)
- "Continue" button links to next incomplete lesson
- Recommended next course based on track progression

**Step 5: Build recent achievements**

`recent-achievements.tsx`:
- Fetches AchievementReceipt PDAs for the wallet
- Shows badge icons, names, XP earned, date

**Step 6: Build activity feed**

`activity-feed.tsx`:
- Recent events: lesson completions, course completions, achievements earned
- Sourced from on-chain transaction history or local event log

**Step 7: Compose dashboard page**

Grid layout: XP card + Streak calendar (top row), Active courses (middle), Achievements + Activity feed (bottom).

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add dashboard with XP, streaks, courses, achievements"
```

---

## Task 17: Profile Page

**Files:**
- Create: `app/src/app/[locale]/profile/page.tsx`
- Create: `app/src/app/[locale]/profile/[walletAddress]/page.tsx`
- Create: `app/src/components/profile/skill-radar.tsx`
- Create: `app/src/components/profile/badge-showcase.tsx`
- Create: `app/src/components/profile/credential-cards.tsx`
- Create: `app/src/components/profile/completed-courses.tsx`

**Step 1: Build profile page**

Two variants:
- `/profile` — own profile (authenticated user)
- `/profile/[walletAddress]` — public profile (any user)

Sections:
- Avatar, name, wallet address (truncated), join date
- Skill radar chart (Rust, Anchor, Frontend, Security, DeFi, NFTs) — derived from completed course tracks
- Achievement badge showcase — grid of earned badges
- Credential NFT cards — Metaplex Core NFTs with on-chain verification links
- Completed courses list

**Step 2: Build credential cards**

`credential-cards.tsx`:
- Fetches credentials from Helius DAS
- Shows: NFT image, track name, level, courses completed, total XP
- "View on Solana Explorer" link
- "Share" button (Twitter, copy link)

**Step 3: Build skill radar**

`skill-radar.tsx`:
- SVG-based radar/spider chart
- Axes: track categories (Rust, Anchor, Frontend, Security, DeFi, NFTs)
- Values: derived from courses completed per track
- Use canvas or a lightweight chart lib if needed

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add profile page with skill radar, badges, credentials"
```

---

## Task 18: Leaderboard Page

**Files:**
- Create: `app/src/app/[locale]/leaderboard/page.tsx`
- Create: `app/src/components/leaderboard/leaderboard-table.tsx`
- Create: `app/src/components/leaderboard/leaderboard-filters.tsx`
- Create: `app/src/components/leaderboard/user-rank-card.tsx`

**Step 1: Build leaderboard**

Server component. Fetches XP token holders from Helius DAS API (`getTokenAccounts` on XP mint), sorts by balance descending, derives level for each.

- Table: rank, avatar, name/wallet, XP, level, streak
- Current user highlighted
- Filters: weekly/monthly/all-time, by course/track
- User's own rank card at top if not in visible range

**Step 2: Build filters**

`leaderboard-filters.tsx`: Timeframe selector (weekly/monthly/all-time), course filter dropdown.

Note: Weekly/monthly filtering requires either indexing transaction timestamps or caching periodic snapshots. For the bounty, "all-time" from Helius is the primary view, with weekly/monthly as stretch goals (can stub with same data).

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add leaderboard page with rankings and filters"
```

---

## Task 19: Settings Page

**Files:**
- Create: `app/src/app/[locale]/settings/page.tsx`
- Create: `app/src/components/settings/appearance-settings.tsx`
- Create: `app/src/components/settings/language-settings.tsx`
- Create: `app/src/components/settings/account-settings.tsx`
- Create: `app/src/components/settings/linked-accounts.tsx`

**Step 1: Build settings page**

Tabbed or sectioned layout:
- **Appearance**: Dark/light mode toggle (next-themes), accent color
- **Language**: Locale selector (same as header switcher but with full names and flags)
- **Account**: Name, email, avatar upload
- **Linked Accounts**: Show connected wallet address, Google account, GitHub account. Link/unlink buttons.
- **Notifications**: Email preferences (stretch)

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add settings page with appearance, language, account sections"
```

---

## Task 20: Certificate/Credential View Page

**Files:**
- Create: `app/src/app/[locale]/certificates/[mint]/page.tsx`
- Create: `app/src/components/certificates/certificate-display.tsx`
- Create: `app/src/components/certificates/certificate-share.tsx`
- Create: `app/src/components/certificates/on-chain-proof.tsx`

**Step 1: Build certificate page**

Server component. Fetches credential NFT from Helius DAS by mint address.

Sections:
- Visual certificate: course name, recipient name/wallet, completion date, Superteam Academy branding
- On-chain proof: mint address, owner, collection, Solana Explorer link, metadata URI
- NFT attributes: track, level, courses completed, total XP
- Share buttons: Twitter, LinkedIn, copy link
- Download as image (html2canvas or similar)

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add certificate/credential view page with on-chain verification"
```

---

## Task 21: Auth Pages (Sign In / Sign Up)

**Files:**
- Create: `app/src/app/[locale]/sign-in/page.tsx`
- Create: `app/src/components/auth/sign-in-form.tsx`
- Create: `app/src/components/auth/wallet-sign-in.tsx`

**Step 1: Build sign-in page**

Options:
- "Connect Wallet" — primary CTA (Solana Wallet Adapter modal)
- "Sign in with Google" — Better Auth social sign-in
- "Sign in with GitHub" — Better Auth social sign-in
- Divider: "or connect your wallet"

After Google/GitHub sign-in, prompt to connect wallet for on-chain features.
After wallet sign-in (SIWS), prompt to link Google for profile features.

**Step 2: Build wallet sign-in flow**

`wallet-sign-in.tsx`:
1. User clicks "Connect Wallet"
2. Wallet Adapter modal opens → user selects wallet → connects
3. Frontend generates SIWS message with nonce
4. User signs message
5. Frontend POSTs to `/api/auth/siws/verify`
6. Session created → redirect to dashboard

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add sign-in page with wallet, Google, and GitHub auth"
```

---

## Phase Gate — Must Pass Before Starting Phase 5

All of the following must be true before proceeding:

- [ ] `cd app && npx next build` exits with code 0, no errors
- [ ] `cd app && npx tsc --noEmit` exits with code 0
- [ ] **Landing page** (`/`) renders with hero, feature cards, and at least 1 course preview card
- [ ] **Course catalog** (`/courses`) renders with course cards; difficulty filter changes visible courses
- [ ] **Course detail** (`/courses/[slug]`) renders with module accordion; "Enroll" button visible when wallet not connected
- [ ] **Lesson view — desktop** (`/courses/[slug]/lessons/[lessonSlug]`): split-pane renders (content left, code right)
- [ ] **Lesson view — mobile** (browser width < 768px): "Content" and "Code" tabs appear; switching tabs shows correct pane
- [ ] **CodeChallenge**: Monaco editor loads with starter code; "Run Tests" triggers test results panel; hint drawer reveals one hint at a time; XP burst animates on pass
- [ ] **Dashboard** (`/dashboard`): XP card shows balance (may be 0 if no XP earned yet); streak calendar renders
- [ ] **Profile** (`/profile`): renders without crash; skill radar SVG visible
- [ ] **Leaderboard** (`/leaderboard`): table renders (may be empty if no XP holders yet)
- [ ] **Settings** (`/settings`): all tabs/sections render; dark/light toggle works
- [ ] **Certificate** (`/certificates/[mint]`): page renders; navigating to an invalid mint shows a graceful error (not a 500)
- [ ] **Sign-in** (`/sign-in`): wallet connect option, Google button, GitHub button all visible
- [ ] Completing a lesson via "Mark Complete" button shows XP burst and updates on-chain (verify tx signature returned)
- [ ] All pages render in all 3 locales (`/`, `/pt-BR/`, `/es/`) without missing translation keys (no `[MISSING]` strings)
