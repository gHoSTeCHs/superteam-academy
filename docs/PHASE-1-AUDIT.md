# Phase 1 Infrastructure Audit Report

**Date**: 2026-03-01
**Scope**: `app/src/` — Next.js 16.1.6 frontend
**Branch**: `feat/frontend-app-26-02-2026`

---

## Overall Status: ~65-70% Complete — Not Yet Phase 2 Ready

---

## Phase 1 Task Status

| Task | Status | Notes |
|------|--------|-------|
| i18n (next-intl) | ✅ 100% | 3 locales, middleware, messages all correct |
| Neon + Drizzle | ⚠️ 80% | Schema correct, **migrations never generated** |
| Solana Wallet Adapter | ⚠️ 40% | Connection/modal works, no Anchor client or Helius |
| Better Auth + SIWS | ⚠️ 70% | SIWS verified + sessions created, OAuth paths unclear |
| Sanity CMS | ✅ 100% | Schema, queries, studio all complete |

---

## Critical Issues (Blocks Phase 2)

**C1 — No Anchor IDL / program client**
- `@coral-xyz/anchor` installed but zero usage
- No IDL constant, no `useProgram()` hook, no instruction builders
- All on-chain interactions (enroll, complete_lesson, finalize, etc.) are blocked

**C2 — No Token-2022 helpers**
- `NEXT_PUBLIC_XP_MINT` set in `.env.example` but never referenced in code
- No `getXpAta()`, no `getXpBalance()` — XP display is impossible
- `@solana/spl-token` installed but unused

**C3 — No Helius DAS integration**
- `helius-sdk` installed but unused
- Cannot query credential NFTs (`getAssetsByOwner`) or XP leaderboard
- `HELIUS_RPC_URL` env var not even in `.env.example`

**C4 — No database migrations**
- `drizzle/` directory doesn't exist
- `npm run db:generate` has never been run
- App cannot connect to a real database until migrations are pushed

**C5 — No course/enrollment flow**
- Zero app routes beyond `/[locale]` (landing) and `/[locale]/showcase`
- Missing: `/courses`, `/courses/[slug]`, `/lessons/[slug]`, `/dashboard`, `/leaderboard`, `/profile`
- ~30 components exist for these features but are not wired

---

## Moderate Issues

**M1 — Type misalignment: `course.ts` vs Sanity schema**
- `app/src/types/course.ts:25` uses `xpReward` — Sanity schema uses `xp`
- `app/src/types/course.ts:18` uses `sortOrder` — Sanity module schema uses `order`
- Hydrating Sanity data into TypeScript types will fail silently

**M2 — ContentBlock type mismatch**
- `app/src/types/content.ts` uses `type` field — Sanity schema uses `blockType`
- Quiz structure in types doesn't match Sanity schema fields

**M3 — No `useSession()` hook**
- Session cookie is set on sign-in but no component can read it
- UI has no way to know if a user is authenticated

**M4 — OAuth callbacks unclear**
- Google/GitHub providers configured in `auth.ts` but `/api/auth/callback/[provider]` never tested
- BetterAuth should handle these automatically via `[...all]`, but unverified

**M5 — Missing env vars**
- `HELIUS_RPC_URL` absent from `.env.example`
- `BACKEND_SIGNER_KEYPAIR` / `BACKEND_SIGNER_PUBKEY` absent (needed for `finalize_course` + `issue_credential`)

---

## Minor Issues

- `NEXT_PUBLIC_XP_MINT` env var unused in code
- No error boundary wrapping `SolanaProvider`
- SIWS creates fake email `${pubkey}@wallet.solana` (acceptable for MVP, but undocumented)
- No replay protection on SIWS message (timestamp present but not validated on server)

---

## What's Working

- i18n routing (en/pt-BR/es, `localePrefix: 'as-needed'`)
- SIWS signature verification + session creation + cookie
- Wallet modal with 5 real adapters (Phantom, Solflare, Coinbase, Ledger, Trust)
- PDA derivation utilities — all 6 types, seeds match SPEC.md exactly
- Sanity schemas (course/module/lesson/contentBlock) + GROQ queries + studio
- 95+ UI components (structure complete, data not wired)
- Lazy DB client (no build-time crash without DATABASE_URL)
- `next build` + `tsc --noEmit` both pass cleanly

---

## Missing Files / Routes

### App Routes (all missing)
- `[locale]/courses/` — Course listing
- `[locale]/courses/[slug]/` — Course detail + enroll
- `[locale]/lessons/[slug]/` — Lesson viewer
- `[locale]/dashboard/` — User dashboard
- `[locale]/leaderboard/` — XP leaderboard
- `[locale]/profile/` — User profile + credentials
- `[locale]/auth/` — Auth pages

### Source Files (all missing)
- `src/lib/anchor/idl.ts` — IDL constant
- `src/hooks/useProgram.ts` — Anchor program hook
- `src/hooks/useEnrollment.ts` — Enrollment PDA hook
- `src/hooks/useXpBalance.ts` — Token-2022 balance hook
- `src/hooks/useCredentials.ts` — Helius DAS credential hook
- `src/hooks/useSession.ts` — Auth session hook
- `src/lib/solana/token.ts` — Token-2022 ATA helpers
- `src/lib/helius/index.ts` — Helius DAS client

### API Routes (all missing)
- `/api/enroll` — Backend: create enrollment
- `/api/complete-lesson` — Backend: complete lesson + mint XP
- `/api/finalize-course` — Backend: finalize course + issue credential
- `/api/leaderboard` — Backend: XP leaderboard
- `/api/credentials` — Backend: list user credentials

### Infrastructure
- `drizzle/*.sql` — Database migration files (run `npm run db:generate`)

---

## Recommended Phase 2 Sequence

### Phase 2A: Infrastructure Gaps (before writing any pages)
1. Generate DB migrations: `npm run db:generate`
2. Add `HELIUS_RPC_URL` + `BACKEND_SIGNER_*` to `.env.example`
3. Create IDL constant from compiled on-chain program
4. Implement `useProgram()` hook + Anchor client factory
5. Implement Token-2022 helpers (`getXpAta`, `getXpBalance`)
6. Initialize Helius DAS client (`getAssetsByOwner`, `getTokenHolders`)
7. Fix type misalignments (Course.xpReward→xp, Module.sortOrder→order, ContentBlock.type→blockType)

### Phase 2B: Enrollment Flow
8. `/courses` page — Sanity course list
9. `/courses/[slug]` page — Course detail
10. Enroll button → `program.methods.enroll()` on-chain call
11. Lesson list + completion UI
12. Lesson completion → `complete_lesson` instruction via backend

### Phase 2C: Graduation & Credentials
13. Finalize course → backend `/api/finalize-course` → `finalize_course` instruction
14. Issue credential → `issue_credential` instruction → credential NFT
15. Credential display via Helius DAS (`getAssetsByOwner`)

### Phase 2D: Dashboard & Social
16. `/dashboard` — XP balance, active courses, activity feed
17. `/leaderboard` — DAS token holders sorted by XP
18. `/profile` — Credentials showcase + stats

---

## Type Alignment Reference

| TypeScript (`src/types/`) | Sanity Schema | Fix Needed |
|---------------------------|---------------|------------|
| `Lesson.xpReward` | `lesson.xp` | Rename type field |
| `Module.sortOrder` | `module.order` | Rename type field |
| `ContentBlock.type` | `contentBlock.blockType` | Rename type field |
| `QuizBlockData.questionType` | `contentBlock.quizQuestion` | Restructure |

---

## Environment Variables Reference

| Variable | Status | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | In `.env.example` | Neon Postgres connection |
| `BETTER_AUTH_SECRET` | In `.env.example` | Session signing secret |
| `BETTER_AUTH_URL` | In `.env.example` | Auth server URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | In `.env.example` | Client-side auth URL |
| `GOOGLE_CLIENT_ID/SECRET` | In `.env.example` | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | In `.env.example` | GitHub OAuth |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | In `.env.example` | Solana RPC endpoint |
| `NEXT_PUBLIC_PROGRAM_ID` | In `.env.example` | On-chain program address |
| `NEXT_PUBLIC_XP_MINT` | In `.env.example` | Token-2022 XP mint address |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | In `.env.example` | Sanity project |
| `NEXT_PUBLIC_SANITY_DATASET` | In `.env.example` | Sanity dataset |
| `SANITY_API_TOKEN` | In `.env.example` | Sanity write token |
| `HELIUS_RPC_URL` | ❌ **MISSING** | Helius DAS API endpoint |
| `BACKEND_SIGNER_KEYPAIR` | ❌ **MISSING** | Backend authority keypair |
