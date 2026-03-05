# Superteam Academy — Full-Stack Audit Report

**Date:** 2026-03-04
**Scope:** On-chain program, frontend, database, Solana service layer, auth, Sanity CMS
**Method:** 5 parallel read-only agents covering independent domains
**Status:** Report only — no code changes made

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 9 |
| HIGH | 10 |
| MEDIUM | 19 |
| LOW | 10 |

---

## CRITICAL — Blocking for any real users

### C1 · Auth — No admin role system

Any authenticated user can access `/admin/*` routes. The `user` table has no `role` field; middleware only checks cookie existence, not admin status. All Sanity write mutations are reachable by any logged-in learner.

**Files:** `src/db/schema/auth.ts`, `src/lib/auth.ts`, `src/middleware.ts`

---

### C2 · Auth / SIWS — Replay attack vulnerability

`handleSiwsSignIn()` accepts client-provided message strings with no domain, nonce, timestamp, or expiry validation. A captured signature can be replayed indefinitely.

**File:** `src/lib/auth-plugins/siws.ts` (lines 77–84)

---

### C3 · Database — Zero migrations generated

`drizzle/` directory does not exist. Schema is defined but never deployed to Neon. The database is empty and the app cannot function.

**File:** `drizzle.config.ts` (output dir configured but no output exists)
**Fix:** `npm run db:generate && npm run db:push`

---

### C4 · Database — No off-chain tracking of on-chain actions

`complete-lesson`, `finalize-course`, and `issue-credential` API routes write nothing to the database after on-chain success. The app has no way to show learner progress, issued credentials, or completions without a live Helius call on every render.

**Files:** `src/app/api/solana/complete-lesson/route.ts`, `finalize-course/route.ts`, `issue-credential/route.ts`

---

### C5 · Database — Core tables missing entirely

No `enrollment`, `lesson_completion`, `course_completion`, or `credential_issuance` tables exist. The admin dashboard hardcodes `totalEnrollments: 0`.

**File:** `src/db/schema/custom.ts`
**Admin evidence:** `src/app/[locale]/(admin)/admin/page.tsx` (line 79)

---

### C6 · Solana API — 13 of 16 on-chain instructions have no API route

Only `complete_lesson`, `finalize_course`, and `issue_credential` have routes. `enroll` and `close_enrollment` (learner-initiated) are missing — students cannot enroll from the frontend.

**Missing learner routes:** `enroll`, `close_enrollment`, `upgrade_credential`
**Missing authority routes:** `initialize`, `update_config`, `create_course`, `update_course`, `register_minter`, `revoke_minter`, `create_achievement_type`, `deactivate_achievement_type`, `reward_xp`, `award_achievement`

---

### C7 · Sanity — Draft courses visible to all students

`allCoursesQuery` has no `isPublished == true` filter. All Sanity drafts appear in the `/courses` page for every visitor.

**File:** `src/sanity/queries.ts` (line 4: `*[_type == "course"]`)

---

### C8 · Frontend — Zero error boundaries

No `error.tsx` files exist anywhere in the app. Any server-side fetch failure crashes the entire page with a raw error rather than a fallback UI.

---

### C9 · Frontend — i18n message files don't exist

Three locales configured (en, pt-BR, es) but `src/i18n/locales/` is empty. All UI text is hard-coded English in components. Non-English routes will render untranslated or broken.

---

## HIGH

### H1 · Auth — Session validation inconsistency

Middleware uses cookie presence; routes use `getServerSession()` DB lookup. A revoked session with a valid cookie bypasses middleware and gets denied at route level — inconsistent and potentially confusing.

---

### H2 · Auth — Unvalidated file upload in Sanity mutations

`uploadAsset()` server action accepts any file type and size with no MIME whitelist or size limit.

**File:** `src/sanity/mutations.ts` (lines 238–248)

---

### H3 · Sanity / Security — XSS and URL injection in content rendering

Quiz option text and video URLs are rendered without sanitization. `ReactPlayer` accepts arbitrary URLs including malicious domains. An admin can inject executable HTML into student browsers.

**Files:** `src/components/lessons/content-block-renderer.tsx` (lines 139–156), `src/components/video-player.tsx` (line 144)

---

### H4 · Database — No transaction support

`NeonHttpDatabase` (HTTP mode) does not support database transactions. `findOrCreateWalletUser()` performs 3 inserts without a transaction — partial failures leave orphaned user/account records.

**Files:** `src/db/index.ts`, `src/lib/auth-plugins/siws.ts` (lines 35–71)

---

### H5 · Database — No indexes on high-frequency columns

No indexes defined on `email`, `user_id`, `session.token`, or `wallet_address`. All auth queries degrade at scale.

**Files:** `src/db/schema/auth.ts`, `src/db/schema/custom.ts`

---

### H6 · Database — Wallet address not on user row

`walletAddress` is stored in a separate `wallet_link` table, requiring a join on every session check. Server-side code cannot get wallet address without a DB round-trip after session validation.

**File:** `src/db/schema/custom.ts`

---

### H7 · Solana API — Missing `system_program` in `issue_credential` route

`system_program` is not explicitly passed in `accountsPartial` — relies on Anchor auto-resolution which is fragile and may fail.

**File:** `src/app/api/solana/issue-credential/route.ts` (lines 89–99)

---

### H8 · On-chain — Prerequisite PDA spoofing in `enroll`

`enroll.rs` derives the enrollment PDA from the course account passed in `remaining_accounts` without first verifying that account's address. A spoofed course PDA can satisfy prerequisite checks.

**File:** `programs/onchain-academy/src/instructions/enroll.rs` (lines 57–68)

---

### H9 · Frontend — No loading states

No `loading.tsx` files and no `<Suspense>` wrappers exist. Users see blank pages while Sanity/RPC calls complete (1–2s typical).

---

### H10 · Frontend — Backend signer env vars empty

`BACKEND_SIGNER_KEYPAIR` and `BACKEND_SIGNER_PUBKEY` are empty in `.env.local`. All 3 Solana API routes fail at runtime.

**File:** `src/lib/solana/backend-signer.ts` (line 10)

---

## MEDIUM

### M1 · Auth — Fake email for wallet users

SIWS creates `${publicKey}@wallet.solana` as the user email. Breaks email-based workflows and pollutes user records.

**File:** `src/lib/auth-plugins/siws.ts` (line 55)

---

### M2 · Auth — No session count limit per user

No limit on active sessions per user — spam sign-ins bloat the sessions table.

---

### M3 · Auth — Session expiry not enforced at middleware

30-day sessions linger past revocation; middleware checks cookie presence only, not expiry or DB validity.

---

### M4 · Sanity — Slug collision in `createCourse`

Slug generation has no uniqueness check. Two courses with the same title produce identical slugs.

**File:** `src/sanity/mutations.ts` (lines 23–26)

---

### M5 · Sanity — 11 quiz question types render blank

12 question types defined in schema (`cloze`, `matching`, `ordering`, `diagram_label`, `calculation`, `assertion_reason`, `matrix_matching`, `numeric_entry`, etc.) but the content block renderer only handles MCQ-style `options` arrays. All other types render as empty.

**Files:** `src/sanity/schemas/content-block.ts`, `src/components/lessons/content-block-renderer.tsx`

---

### M6 · Sanity — PortableText links accept any URI scheme

Link serializer accepts any `href` including `javascript:` and `data:` URIs.

**File:** `src/components/portable-text-renderer.tsx` (lines 87–96)

---

### M7 · Solana API — No rate limiting or caching on Helius calls

`getXpLeaderboard()` and `getCredentialsByOwner()` have no rate limiting, retry logic, or cache. The leaderboard page hammers Helius quota on every render.

**File:** `src/lib/solana/helius.ts`

---

### M8 · Solana API — Session wallet address not validated as public key

`walletAddress` from DB is passed to `new PublicKey()` without prior validation. Corrupted DB data causes cryptic runtime errors.

**File:** `src/lib/solana/session.ts` (line 29)

---

### M9 · Solana API — No transaction simulation before submit

All 3 API routes call `.rpc()` without `.simulate()` first. On-chain validation errors surface only after submission.

---

### M10 · Database — No wallet-per-user uniqueness constraint

`wallet_link` has no constraint preventing one user from linking multiple wallets.

**File:** `src/db/schema/custom.ts`

---

### M11 · Database — Duplicate locale preference fields

`learnerProfile` and `userPreferences` both store locale preference.

**File:** `src/db/schema/custom.ts`

---

### M12 · Database — No XP balance cache

Every dashboard and leaderboard render calls Helius RPC live. No cached `xp_balance` table with TTL.

---

### M13 · On-chain — `close_enrollment` cooldown bypassable

The 24h cooldown can be bypassed if `course.is_active == false`. A learner can close enrollment immediately after course deactivation regardless of enrollment age.

**File:** `programs/onchain-academy/src/instructions/close_enrollment.rs` (lines 11–16)

---

### M14 · On-chain — Zombie minter state in `update_config`

`update_config` silently skips old MinterRole deactivation if `remaining_accounts` is empty. The old backend signer's MinterRole is left active.

**File:** `programs/onchain-academy/src/instructions/update_config.rs` (lines 20–35)

---

### M15 · Frontend — Auth checks duplicated

Auth checks exist both in middleware and per-layout server code — divergence risk as routes evolve.

**Files:** `src/middleware.ts`, `src/app/[locale]/(admin)/admin/layout.tsx`

---

### M16 · Frontend — No dynamic metadata on course/lesson pages

No `generateMetadata()` on course or lesson pages — all social shares show the generic site title.

---

### M17 · Frontend — No rate limiting on Solana API routes

A user can spam `complete-lesson` calls with no throttle.

---

### M18 · Frontend — No Content Security Policy

No CSP headers set in `next.config.ts`. Allows iframe injection and arbitrary external script loading.

---

### M19 · Frontend / Database — `DATABASE_URL` not validated at startup

`process.env.DATABASE_URL!` is non-null asserted without a readable error message on missing value.

**Files:** `src/db/index.ts`, `drizzle.config.ts`

---

## LOW

| # | Domain | Issue | File |
|---|--------|-------|------|
| L1 | On-chain | Unnecessary `.clone()` on String fields in event emissions | Multiple `instructions/*.rs` |
| L2 | On-chain | No `enrollment.course_version` snapshot — XP changes after enrollment are untracked | `state/enrollment.rs` |
| L3 | Solana API | Bitmap `isLessonComplete()` has no bounds check — out-of-range index silently returns `false` | `src/lib/solana/bitmap.ts` |
| L4 | Solana API | Unsafe `Record<string, unknown>` type casting when fetching course/enrollment accounts | `finalize-course/route.ts`, `issue-credential/route.ts` |
| L5 | Solana API | No transaction confirmation strategy — `.rpc()` returns signature before block confirmation | All 3 API routes |
| L6 | Frontend | `HELIUS_RPC_URL` defaults to `""` silently — leaderboard fails with no warning | `src/lib/solana/constants.ts` |
| L7 | Auth | Detailed Anchor error messages returned to client — reveals program structure | All 3 API routes |
| L8 | Sanity | No `description` fields on schema properties — CMS is undocumented for editors | `src/sanity/schemas/*.ts` |
| L9 | Database | No soft-delete (`deletedAt`) on any table — account deletion destroys enrollment history | `src/db/schema/` |
| L10 | Database | Drizzle Proxy pattern in `db/index.ts` bypasses type safety unnecessarily | `src/db/index.ts` |

---

## Cross-Domain Architecture Gaps

| Gap | Impact |
|-----|--------|
| No audit log | No record of who published courses, ran mutations, or called on-chain instructions |
| No enroll/unenroll flow | Students cannot enroll from the frontend — the biggest functional gap |
| No React hooks for wallet state | Components manually manage Solana state; no `useXpBalance()`, `useEnrollments()`, etc. |
| On-chain is sole source of truth | Dashboard, leaderboard, and profile all require live Helius calls — no offline capability |
| No CSRF protection verified | Better Auth should handle this, but CSP, SameSite cookies, and header checks are unverified |

---

## Recommended Fix Order

### Tier 1 — Before any user testing

1. C3 — Generate DB migrations
2. C5 — Create core tables (`enrollment`, `lesson_completion`, `course_completion`, `credential_issuance`)
3. C1 — Implement admin role system
4. C2 — Fix SIWS nonce/domain/timestamp validation
5. C6 — Implement `enroll` and `close_enrollment` API routes
6. C7 — Add `isPublished == true` filter to all student-facing Sanity queries

### Tier 2 — Before beta

7. C4 — Write off-chain records after on-chain success in all 3 API routes
8. H10 — Fill backend signer env vars
9. H4 — Switch to Neon Serverless for transaction support
10. H3 — Sanitize quiz options and validate video URLs
11. H7 — Explicitly pass `system_program` in `issue_credential`
12. C8 — Add `error.tsx` boundaries at layout levels
13. C9 — Extract i18n message keys for all 3 locales

### Tier 3 — Before public launch

14. H5 — Add DB indexes on queried columns
15. M7 — Add caching and retry logic for Helius calls
16. M9 — Add transaction simulation before submit
17. M5 — Implement all 12 quiz question type renderers
18. M18 — Set CSP headers
19. H9 — Add `loading.tsx` skeleton screens

---

*Generated by 5 parallel read-only audit agents on 2026-03-04.*
