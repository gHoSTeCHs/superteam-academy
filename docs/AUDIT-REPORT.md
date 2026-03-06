# Codebase Audit Report

**Date:** 2026-03-05 (updated 2026-03-06)
**Branch:** `main`
**Scope:** Phases 0–8 as defined in `docs/plans/phases/`

---

## Executive Summary

| Phase                       | Status              | Critical | Important | Missing Files                       |
| --------------------------- | ------------------- | -------- | --------- | ----------------------------------- |
| 0 — Repo Setup              | PASS                | 0        | 0         | 0                                   |
| 1 — Infrastructure          | PASS                | 0        | 0         | 0                                   |
| 2 — Solana Service Layer    | PASS                | 0        | 0         | 0                                   |
| 3 — Layouts & Navigation    | PASS                | 0        | 0         | 0                                   |
| 4 — Student Pages           | Partial             | 1        | 5         | 1 route (`profile/[walletAddress]`) |
| 5 — Admin Pages             | Partial             | 1        | 4         | 0                                   |
| 6 — Gamification            | Partial             | 0        | 3         | 0                                   |
| 7 — Analytics & Performance | **NOT IMPLEMENTED** | —        | —         | 12                                  |
| 8 — Deploy & PR             | **NOT IMPLEMENTED** | —        | —         | 6                                   |
| **Totals**                  |                     | **3**    | **16**    | **21**                              |

The codebase is structurally ~70% complete (Phases 0–6 have all pages and components present) but has significant functional gaps in on-chain integration wiring and two entirely unimplemented phases (7, 8).

---

## Phase 0 — Repo Setup — PASS

Monorepo structure is correct. Next.js app lives in `/app`, no nested `.git`, build is clean.

---

## Phase 1 — Infrastructure

### Critical

**~~1.1 `<html>` has no `lang` attribute~~ — FIXED**

- **Resolution:** Moved `<html>` and `<body>` tags from root layout into `[locale]/layout.tsx`, which has access to the locale param. Root layout is now a pass-through returning `{children}`. `<html lang={locale}>` renders the correct language attribute for all locales.

**~~1.2 SIWS bypasses Better Auth session lifecycle~~ — FIXED**

- **Resolution:** `siws.ts` rewritten as a proper `BetterAuthPlugin` using `createAuthEndpoint`, `setSessionCookie`, and `internalAdapter`. Nonces stored in Better Auth's verification table. Old standalone routes (`/api/auth/sign-in/solana`, `/api/auth/siws/nonce`) deleted. Plugin registered in `auth.ts` and `auth-client.ts`. `wallet-sign-in.tsx` updated to call `/api/auth/siws/nonce` (POST) and `/api/auth/siws/verify` (POST) with proper SIWS message format including domain, nonce, and issuedAt validation.

### Important

**~~1.3 `sanity.config.ts` in wrong location with brittle import~~ — FALSE ALARM**

- **Assessment:** `sanity.config.ts` at the app root is the standard location for Next.js + Sanity projects. The Studio page's four-level relative import (`../../../../sanity.config`) is correct for its depth. No code change needed.

**~~1.4 `app-providers.tsx` does not exist~~ — FIXED**

- **Resolution:** Created `app/src/providers/app-providers.tsx` as a `"use client"` component composing `NextIntlClientProvider` → `SolanaProvider` → `AuthProvider` → `ThemeProvider` + `Toaster`. The locale layout now imports and uses `<AppProviders>` instead of inline nesting.

### ~~Guideline Violation~~

**~~1.5 Single-line comment in `use-streak.ts`~~ — FIXED**

- **Resolution:** Removed the `// eslint-disable-next-line react-hooks/exhaustive-deps` comment. The suppression was unnecessary — both dependencies are already listed in the dependency array.

### Confirmed Correct

All three locale message files (`en.json`, `pt-BR.json`, `es.json`) have identical key sets across all 17 namespaces. The i18n routing, request config, navigation exports, and middleware are correctly wired. The Drizzle schema matches the generated migration. Better Auth's Drizzle adapter, Google/GitHub social providers, and the `[...all]` route are correctly configured. The Solana wallet adapter registers all five required wallets. The Sanity schema exports all four document types.

---

## Phase 2 — Solana Service Layer

### Critical

**~~2.1 No `server-only` guard on secret key files~~ — FIXED**

- **Resolution:** Added `import "server-only"` as the first import in both `backend-signer.ts` and `session.ts`. Any client component that transitively imports either file will now trigger a build-time error.

**~~2.2 `lessonIndex` not bounds-checked~~ — FIXED**

- **Resolution:** Added `Number.isInteger()`, `>= 0`, and `<= 255` checks to the `complete-lesson` route validation block. Floats, negatives, and values exceeding `u8` range are now rejected with 400.

**~~2.3 `BigInt(undefined)` crash in credential routes~~ — FIXED**

- **Resolution:** Added `typeof` + `Number.isInteger()` + non-negative checks for both `coursesCompleted` and `totalXp` to the validation blocks in `issue-credential/route.ts` and `upgrade-credential/route.ts`. Missing or invalid values now return 400 instead of crashing with TypeError.

**~~2.4 DB enrollment recorded without on-chain confirmation~~ — FIXED**

- **Resolution:** Added on-chain PDA existence check via `connection.getAccountInfo(expectedPda)` before the DB insert in `record-enrollment/route.ts`. The enrollment PDA can only be created by the on-chain program, so its existence proves a real enrollment regardless of the submitted signature value.

### Important

**~~2.5 `lessonFlags` typed as `BN[]` instead of `[BN, BN, BN, BN]`~~ — FIXED**

- **Resolution:** Changed `lessonFlags` to `[BN, BN, BN, BN]` tuple type in `types.ts`. Added `LessonFlags` type alias in `bitmap.ts` and updated all 3 function signatures. Exported from barrel.

**~~2.6 Helius DAS helpers reachable from client context~~ — FIXED**

- **Resolution:** Moved `getXpAta` (pure PDA derivation) from `helius.ts` to `pda.ts`. Added `import "server-only"` to `helius.ts`. Removed helius re-exports from barrel `index.ts`. Server code imports DAS functions directly from `@/lib/solana/helius`.

**~~2.7 Learner ATA existence not checked in `finalize-course`~~ — FIXED**

- **Resolution:** Added learner ATA existence check + `createAssociatedTokenAccountInstruction` pre-instruction before the existing creator ATA check, matching the pattern from `complete-lesson/route.ts`.

**~~2.8 `LearningProgressService` interface never created~~ — FIXED**

- **Resolution:** Created `app/src/lib/services/learning-progress.ts` with `import "server-only"` guard. Three functions: `getUserXpBalance` (on-chain XP via Helius), `getActiveEnrollments` (DB enrollments + Sanity courses), `getRecentActivity` (DB lesson/course completions). Dashboard page fetches data server-side and passes as props to `DashboardClient`.

---

## Phase 3 — Layouts & Navigation

### Critical

**~~3.1 `sidebar.tsx` does not exist~~ — FIXED**

- **Resolution:** Created `app/src/components/layout/sidebar.tsx` with 5 nav links (Dashboard, Courses, Leaderboard, Profile, Settings). Created `main-layout-shell.tsx` client shell orchestrating header + sidebar + Sheet drawer + footer. Sidebar hidden on landing page (`/`), visible on all other `(main)` routes. Mobile hamburger triggers Sheet drawer. Header nav links removed (sidebar handles all navigation).

**~~3.2 Dark mode default is wrong~~ — FIXED**

- **Resolution:** Changed `defaultTheme="light"` to `defaultTheme="dark"` in `theme-provider.tsx`.

**~~3.3 Wallet button has no CLS guard~~ — FIXED**

- **Resolution:** Wrapped both button states in a `min-w-[160px]` container div. Button no longer causes layout shift on connect/disconnect.

### Important

**~~3.4 Dashboard missing from primary nav~~ — FIXED**

- **Resolution:** Resolved by 3.1 — sidebar includes Dashboard as the first navigation link.

**~~3.5 Connected-but-unauthenticated wallet cannot disconnect~~ — FIXED**

- **Resolution:** Destructured `disconnect` from `useWallet()`. Added `else { disconnect(); }` branch in onClick handler for connected state.

**~~3.6 Admin redirect strips the locale~~ — FIXED**

- **Resolution:** Changed `import { redirect } from "next/navigation"` to `import { redirect } from "@/i18n/navigation"` in admin layout, dashboard, profile, and settings pages (also fixes 4.2).

**~~3.7 `<html>` has no `lang` attribute~~ — FIXED**

- Same as Issue 1.1.

---

## Phase 4 — Student Pages

### Critical

**~~4.1 Lesson completion is a no-op~~ — FIXED**

- **Resolution:** `LessonViewClient` now passes `onComplete` and `onFinalizeCourse` callbacks to `LessonCompleteButton`. `onComplete` calls `POST /api/solana/complete-lesson` with `{ courseId, lessonIndex }`. `onFinalizeCourse` calls `POST /api/solana/finalize-course` with `{ courseId }`. Error handling in `LessonCompleteButton.handleComplete` fixed to only set completed state on success. `courseId` prop threaded from server page through to client component.

**~~4.2 Auth redirect breaks non-English locales~~ — FIXED**

- **Resolution:** Changed `import { redirect } from "next/navigation"` to `import { redirect } from "@/i18n/navigation"` in `dashboard/page.tsx`, `profile/page.tsx`, and `settings/page.tsx`. Fixed as part of issue 3.6.

**4.3 Sign-in page renders blank for authenticated users**

- **File:** `app/src/app/[locale]/(auth)/sign-in/page.tsx`
- **Confidence:** 90
- When `isAuthenticated` is true, returns `null` instead of redirecting to dashboard.

**4.4 `useStreak("")` called for unauthenticated users**

- **File:** `app/src/components/lessons/lesson-complete-button.tsx`, line 43
- **Confidence:** 95
- When `walletAddress` is undefined, the hook initializes with empty string, reading and writing `localStorage["streak_"]` — a data pollution risk.

### Important

**4.5 Public profile route missing**

- **Confidence:** 100
- `profile/[walletAddress]/page.tsx` is absent. Leaderboard links to per-wallet profiles have no destination.

**4.6 Achievement toasts have no idempotency guard**

- **File:** `app/src/components/lessons/lesson-complete-button.tsx`, lines 62–70
- **Confidence:** 85
- "First Steps" and "Course Completer" toasts fire on every completion click because `isCompleted` is never initialized from server state.

**~~4.7 Enroll button uses a mock timeout~~ — FIXED**

- **Resolution:** `EnrollButton.handleEnroll` replaced with real enrollment flow: `POST /api/solana/enroll` → deserialize base64 transaction → `wallet.signTransaction()` → `connection.sendRawTransaction()` → `connection.confirmTransaction()` → `POST /api/solana/record-enrollment`. Error state resets to "unenrolled" with inline error message. `courseId` prop added and threaded from `CourseDetailClient`. Button disabled when `courseId` or `signTransaction` unavailable.

**4.8 `StreakCalendar` month labels escape container**

- **File:** `app/src/components/dashboard/streak-calendar.tsx`, lines 96–99
- **Confidence:** 80
- Month label `<span>` elements use `position: absolute` but the parent div has no `position: relative`.

**~~4.9 Single-line `eslint-disable` comment~~ — FIXED**

- Same as Issue 1.5.

---

## Phase 5 — Admin Pages

### Critical

**5.1 `revalidatePath` misses locale prefix**

- **File:** `app/src/sanity/mutations.ts`
- **Confidence:** 88
- Every call uses bare paths like `"/admin/courses"`. Actual routes are at `/en/admin/courses`, `/pt-BR/courses`, etc. Cache is never busted — admins and users see stale data after mutations.

### Important

**5.2 Edit pages read stale CDN data**

- **Confidence:** 88
- `EditCoursePage` and `LessonEditorPage` use CDN-cached public client. After saving, may re-render with data behind what was just written. Preview pages correctly use `previewClient`.

**5.3 `totalEnrollments` hardcoded to `0`**

- **File:** `app/src/app/[locale]/(admin)/admin/page.tsx`, line 79
- **Confidence:** 85
- Dashboard enrollment stat is permanently zero despite the `enrollment` table existing.

**5.4 `console.error` in `error.tsx` leaks stack traces**

- **File:** `app/src/app/[locale]/(admin)/admin/error.tsx`, line 13
- **Confidence:** 85
- Bare `console.error(error)` logs raw error objects including stack traces to the browser console in production.

**5.5 `deleteCourse` cascade has no transaction semantics**

- **File:** `app/src/sanity/mutations.ts`
- **Confidence:** 80
- Individual Sanity API calls with no error handling. Mid-cascade failure leaves dangling references.

### Low

**5.6 String-interpolated IDs in Sanity patch paths**

- **Confidence:** 80
- Template literals for delete operations (`modules[_ref == "${moduleId}"]`). Non-idiomatic and fragile.

---

## Phase 6 — Gamification

### Important

**6.1 Timezone bug in `streaks.ts`**

- **File:** `app/src/lib/streaks.ts`
- **Confidence:** 85
- `.toISOString()` returns UTC dates. Users in UTC-negative timezones will have streaks silently fail to increment correctly.

**6.2 "First Steps" fires on every course's first lesson**

- **Confidence:** 85
- No persistence check (localStorage flag or DB row) guards against repeat triggers. The "First Steps" toast appears every time a user starts any new course.

**6.3 `code-challenge.tsx` delegates streak recording to parent**

- **Confidence:** 80
- If `walletAddress` is null (Google-only auth user), the streak is never recorded even on a passed challenge.

---

## Phase 7 — Analytics & Performance — NOT IMPLEMENTED

Every deliverable is missing:

| Required                                            | Status                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `app/src/components/analytics/google-analytics.tsx` | Missing                                                               |
| `app/src/components/analytics/posthog-provider.tsx` | Missing                                                               |
| `posthog-js` in `package.json`                      | Missing                                                               |
| `@sentry/nextjs` + config files                     | Missing                                                               |
| `app/src/lib/analytics.ts` (trackEvent helper)      | Missing                                                               |
| Monaco Editor dynamic import (`next/dynamic`)       | Missing — statically imported (~7 MB bundle hit on every lesson page) |
| Wallet adapter lazy loading                         | Missing — statically imported in `solana-provider.tsx`                |
| Font optimization (`.woff2`, variable fonts)        | Missing — fonts are `.ttf`, 4 separate weight files                   |
| `@next/bundle-analyzer`                             | Not installed                                                         |
| `app/scripts/seed-sanity.ts`                        | Missing                                                               |
| Lighthouse scores in `app/README.md`                | Missing                                                               |

---

## Phase 8 — Deploy & PR — NOT IMPLEMENTED

Every deliverable is missing:

| Required                           | Status                      |
| ---------------------------------- | --------------------------- |
| `app/README.md` (project-specific) | Default Next.js boilerplate |
| `app/docs/SETUP.md`                | Missing                     |
| `app/docs/ARCHITECTURE.md`         | Missing                     |
| `app/docs/CMS_GUIDE.md`            | Missing                     |
| `app/docs/CUSTOMIZATION.md`        | Missing                     |
| `app/vercel.json`                  | Missing                     |

---

## Systemic Patterns

These issues appear across multiple phases and represent recurring patterns rather than isolated bugs:

### i18n Redirect Bug (5+ occurrences)

`redirect("/sign-in")` from `"next/navigation"` drops the locale for pt-BR and es users. Appears in dashboard, profile, settings, admin layout, and potentially other auth-gated pages.

### `revalidatePath` Without Locale Prefix

Cache is never busted for any i18n route after admin mutations because `revalidatePath("/admin/courses")` does not match `/en/admin/courses` or `/pt-BR/admin/courses`.

### Dark Mode Default

`defaultTheme="light"` contradicts the plan requirement for dark as default.

### ~~Missing `<html lang>` Attribute~~ — FIXED

`<html>` and `<body>` moved to locale layout with `lang={locale}`. All locales now render the correct language attribute.

---

## Top Priority Fixes (by impact)

| Priority | Issue                                                 | Impact                                                              |
| -------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| ~~1~~    | ~~**Lesson completion is a no-op** (4.1)~~            | ~~Core feature broken~~ — **FIXED**                                 |
| ~~2~~    | ~~**Enroll button is a mock** (4.7)~~                 | ~~Core feature broken~~ — **FIXED**                                 |
| 3        | **Phase 7 entirely missing**                          | Analytics = 25% feature weight, Performance = 15% evaluation weight |
| 4        | **Phase 8 entirely missing**                          | Documentation = 10% score, no live demo                             |
| ~~5~~    | ~~**No `server-only` guard** (2.1)~~                  | ~~Security — backend signer could leak to client bundle~~ — **FIXED** |
| ~~6~~    | ~~**DB enrollment without on-chain verification** (2.4)~~ | ~~Security — fabricated enrollments possible~~ — **FIXED**        |
| ~~7~~    | ~~**Auth redirects break i18n** (3.6, 4.2)~~          | ~~UX broken for 2 of 3 supported locales~~ — **FIXED**              |
| 8        | **`revalidatePath` misses locale** (5.1)              | Admin always sees stale data                                        |
| ~~9~~    | ~~**Dark mode default wrong** (3.2)~~                 | ~~Visual requirement unmet~~ — **FIXED**                            |
| ~~10~~   | ~~**`<html>` missing `lang`** (1.1)~~                 | ~~WCAG + SEO failure~~ — **FIXED**                                  |

---

## Fix Log

| Date       | Issues Fixed | Description                                                                                  |
| ---------- | ------------ | -------------------------------------------------------------------------------------------- |
| 2026-03-06 | 1.2          | SIWS rewritten as proper Better Auth plugin with `createAuthEndpoint` and `setSessionCookie` |
| 2026-03-06 | 4.1          | Lesson completion wired to `/api/solana/complete-lesson` and `/api/solana/finalize-course`    |
| 2026-03-06 | 4.7          | Enrollment button wired to `/api/solana/enroll` with client-side wallet signing               |
| 2026-03-06 | 1.1          | `<html lang>` fixed — tags moved to locale layout with `lang={locale}`                        |
| 2026-03-06 | 1.3          | Marked as false alarm — `sanity.config.ts` at app root is standard Next.js + Sanity pattern   |
| 2026-03-06 | 1.4          | Created `app-providers.tsx` as centralized provider composition root                          |
| 2026-03-06 | 1.5, 4.9     | Removed single-line eslint-disable comment from `use-streak.ts`                               |
| 2026-03-06 | 2.1          | Added `import "server-only"` to `backend-signer.ts` and `session.ts`                          |
| 2026-03-06 | 2.2          | Added integer + bounds check (0–255) for `lessonIndex` in `complete-lesson` route             |
| 2026-03-06 | 2.3          | Added `coursesCompleted`/`totalXp` validation in `issue-credential` and `upgrade-credential`  |
| 2026-03-06 | 2.4          | Added on-chain PDA existence check before DB insert in `record-enrollment` route              |
| 2026-03-06 | 2.5          | Changed `lessonFlags` to `[BN, BN, BN, BN]` tuple; added `LessonFlags` type alias            |
| 2026-03-06 | 2.6          | Moved `getXpAta` to `pda.ts`, added `server-only` to `helius.ts`, removed barrel re-exports  |
| 2026-03-06 | 2.7          | Added learner ATA existence check + pre-creation in `finalize-course` route                   |
| 2026-03-06 | 2.8          | Created `learning-progress.ts` service; wired into dashboard with server-side data fetching   |
| 2026-03-06 | 3.1          | Created `sidebar.tsx`, `main-layout-shell.tsx`, `sheet.tsx`; sidebar with 5 nav links         |
| 2026-03-06 | 3.2          | Changed `defaultTheme` from `"light"` to `"dark"` in `theme-provider.tsx`                     |
| 2026-03-06 | 3.3          | Added `min-w-[160px]` CLS guard wrapper to wallet button                                      |
| 2026-03-06 | 3.4          | Resolved by 3.1 — sidebar includes Dashboard as first nav link                                |
| 2026-03-06 | 3.5          | Added `disconnect()` fallback for connected-but-unauthenticated wallet state                  |
| 2026-03-06 | 3.6, 4.2     | Changed `redirect` import to `@/i18n/navigation` in admin layout + 3 student pages            |
