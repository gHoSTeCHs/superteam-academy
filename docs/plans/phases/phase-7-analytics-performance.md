# Phase 7: Analytics & Performance

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GA4, PostHog, and Sentry observability; seed the sample course content; then run a full Lighthouse audit and achieve ≥ 90 Performance across key pages.

**Architecture:** Analytics providers added to `[locale]/layout.tsx`. Performance work is audit-driven — run the bundle analyzer first, fix identified issues, then confirm with Lighthouse. Sample content is a seed script that populates Sanity programmatically.

**Tech Stack:** @next/third-parties (GA4), posthog-js, @sentry/nextjs, @next/bundle-analyzer, next/font, next/image, Monaco dynamic import.

**Prerequisites:** Phases 0–6 complete. All student pages render correctly. At least one course in Sanity (can be the manually created test course from Phase 4 — Task 30 will replace it with a richer seed).

> **Performance is 15% of evaluation weight. Do not skip or stub Task 29.**

---

## Task 28: Analytics Integration

**Files:**
- Create: `app/src/components/analytics/google-analytics.tsx`
- Create: `app/src/components/analytics/posthog-provider.tsx`
- Create: `app/src/lib/analytics.ts`
- Modify: `app/src/app/[locale]/layout.tsx`

**Step 1: Add GA4**

Install: `npm install @next/third-parties`

Create `google-analytics.tsx` — `GoogleAnalytics` component from `@next/third-parties/google`. Add to layout. Env var: `NEXT_PUBLIC_GA_ID`.

**Step 2: Add PostHog**

Install: `npm install posthog-js`

Create `posthog-provider.tsx` — client-side PostHog initialization. Defer initialization to `requestIdleCallback` to avoid blocking main thread. Tracks page views, heatmaps. Env var: `NEXT_PUBLIC_POSTHOG_KEY`.

**Step 3: Add Sentry**

Install: `npm install @sentry/nextjs`

Run: `npx @sentry/wizard@latest -i nextjs`

This sets up Sentry with error boundary, source maps, and performance monitoring.

**Step 4: Create analytics helper**

`app/src/lib/analytics.ts` — unified tracking:
- `trackEvent(name, properties)` — sends to both GA4 and PostHog
- Events: `lesson_completed`, `course_enrolled`, `course_completed`, `achievement_earned`, `wallet_connected`

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add GA4, PostHog, and Sentry analytics"
```

---

## Task 29: Performance Optimization (Lighthouse / Core Web Vitals)

> **Evaluation weight: 15%. Do not skip or stub this task.**

**Files:**
- Modify: `app/next.config.ts`
- Create: `app/src/components/ui/optimized-image.tsx`
- Create: `app/src/lib/fonts.ts`
- Modify: `app/src/app/[locale]/layout.tsx`
- Modify: bundle entry points as identified by bundle analyzer

**Step 1: Install analysis tooling**

Run:
```bash
cd app && npm install -D @next/bundle-analyzer
```

Add to `next.config.ts`:
```typescript
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(withNextIntl(nextConfig));
```

Run: `ANALYZE=true npx next build`

Open the generated HTML reports. Note every chunk > 100 kB. These are the targets for the next steps.

**Step 2: Font optimization**

Create `app/src/lib/fonts.ts`:
```typescript
import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
```

Apply both `variable` class names to the `<html>` element in `[locale]/layout.tsx`. Remove any `<link>` tags for Google Fonts — `next/font` self-hosts and eliminates the render-blocking external request.

**Step 3: Image optimization**

Create `app/src/components/ui/optimized-image.tsx` — a thin wrapper around `next/image` that enforces:
- `sizes` prop is always required (prevents over-fetching)
- `placeholder="blur"` for local images, `placeholder="empty"` for remote
- A consistent `loading="lazy"` default with `loading="eager"` override for above-the-fold images (hero, course card thumbnails on landing page)

Audit every `<img>` tag in the codebase and replace with this component. Audit every `next/image` usage without `sizes` and add appropriate values.

For Sanity images, use `@sanity/image-url` to build srcsets: serve WebP via Sanity's image pipeline (`?fm=webp&w=800`).

**Step 4: Bundle splitting**

For each chunk > 100 kB identified in Step 1, apply the appropriate fix:

- **Monaco Editor** — already lazy-loaded via dynamic import in `CodeEditor`. Verify `ssr: false` and that it is not accidentally imported in any server component. If the chunk is still large, use `monaco-editor/esm/vs/editor/editor.worker` direct worker config to tree-shake unused languages.
- **Solana wallet adapter UI** — `@solana/wallet-adapter-react-ui` pulls in wallet icons. Wrap `WalletModalProvider` in `dynamic(() => import(...), { ssr: false })`.
- **Sanity Studio** — the `/studio` route already uses `NextStudio`. Confirm it is not included in the main bundle via the analyzer. If it leaks, add `experimental: { optimizePackageImports: ['sanity'] }` to `next.config.ts`.
- **Recharts / chart libs** — if added for skill radar or leaderboard, lazy-load with `dynamic`.

**Step 5: Core Web Vitals — LCP**

The Largest Contentful Paint element on each key page must load fast:
- Landing page hero image: add `priority` prop to the hero `<Image>` — this injects a `<link rel="preload">` in the document head.
- Course catalog: first row of course cards is above the fold — add `priority` to their thumbnail images.
- Lesson view: no large above-the-fold image; LCP is likely the first text block — verify Tiptap content is SSR-rendered (not client-only).

**Step 6: Core Web Vitals — CLS**

Cumulative Layout Shift sources to eliminate:
- Font fallback swap: mitigated by `next/font` with `display: 'swap'` and `size-adjust` (Next.js handles this automatically).
- Wallet button: the `WalletMultiButton` renders server-side as a placeholder. Wrap in a fixed-size container (`min-w-[160px] h-10`) so layout does not shift when the client hydrates and the real button appears.
- Course card images: always set explicit `width` and `height` on every `<Image>` so the browser reserves space before the image loads.

**Step 7: Core Web Vitals — INP / FID**

- Defer non-critical JS: move PostHog initialization to `requestIdleCallback` inside the PostHog provider.
- Long tasks on lesson page: Monaco Editor initialization is the main offender. Wrap in `setTimeout(..., 0)` after first paint so it does not block the main thread during LCP.

**Step 8: Run Lighthouse audit**

Run: `npm run build && npm run start`

In Chrome DevTools → Lighthouse → run audit on:
1. `/` (landing page)
2. `/courses` (catalog)
3. `/courses/[test-slug]/lessons/[test-lesson]` (lesson view)

Target scores:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90

Document actual scores as a comment in `app/README.md` under a "Performance" section.

**Step 9: Verify**

Re-run: `ANALYZE=true npx next build`

Confirm no chunk that was previously > 100 kB remains unaddressed. Re-run Lighthouse. Scores at or above targets.

**Step 10: Commit**

```bash
git add -A && git commit -m "perf: image optimization, font self-hosting, bundle splitting, Lighthouse ≥90"
```

---

## Task 30: Sample Course Content

**Files:**
- Create: `app/scripts/seed-sanity.ts`

**Step 1: Create seed script**

Script that populates Sanity with a complete sample course:

**Course: "Introduction to Solana Development"**
- 3 modules, 8-10 lessons total
- Module 1: Solana Basics (3 lessons — text + quiz)
- Module 2: Writing Smart Contracts (3 lessons — text + code challenge)
- Module 3: Building dApps (2-3 lessons — text + video + code challenge)

Each lesson has realistic content blocks:
- Rich text explanations
- Code examples (Rust, TypeScript)
- Interactive code challenges with test cases
- Quiz questions using our 12 question types
- Callouts with tips and warnings

**Step 2: Also create the on-chain Course PDA**

Run the existing `scripts/create-mock-course.ts` from the monorepo's `onchain-academy/scripts/` to create the matching course on devnet. The `courseId` must match between Sanity and on-chain.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add sample course content seed script"
```

---

## Phase Gate — Must Pass Before Starting Phase 8

All of the following must be true before proceeding:

- [ ] `cd app && npx next build` exits with code 0
- [ ] **GA4**: open browser DevTools → Network tab → filter for `google-analytics.com` — request fires on page load
- [ ] **PostHog**: open browser DevTools → Network tab → filter for `posthog` — `capture` request fires on page load (or after idle)
- [ ] **Sentry**: trigger a deliberate test error (e.g., `throw new Error('sentry test')` in a client component) — error appears in Sentry dashboard within 60 seconds
- [ ] **Bundle analyzer**: re-run `ANALYZE=true npx next build` — no unaddressed chunk > 200 kB in the client bundle (Monaco is expected to be large but must be in a separate async chunk, not the main bundle)
- [ ] **Lighthouse — Landing page** (`/`): Performance ≥ 90, Accessibility ≥ 95
- [ ] **Lighthouse — Course catalog** (`/courses`): Performance ≥ 90
- [ ] **Lighthouse — Lesson view**: Performance ≥ 90
- [ ] Lighthouse scores documented in `app/README.md` under a "Performance" section
- [ ] **Sample course**: `npx tsx scripts/seed-sanity.ts` runs without error; course appears in Sanity Studio with 3 modules and ≥ 8 lessons
- [ ] Sample course PDA exists on devnet — verify with `solana account <pda-address> --url devnet`
- [ ] Full lesson flow works end-to-end with sample course: browse → enroll → complete lesson → XP minted
