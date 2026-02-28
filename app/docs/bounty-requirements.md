# Superteam Academy — Bounty Requirements

**Source:** https://superteam.fun/earn/listing/superteam-academy
**Prize Pool:** $5,000 USDG ($3,500 1st / $1,000 2nd / $500 3rd)
**Deadline:** March 5, 2026
**Winner Announcement:** Within 10 days after deadline
**Payment:** Within 15 days of announcement

---

## Objective

Build a production-ready learning management system (LMS) for Solana development with gamified progression, interactive coding challenges, on-chain credentials, and community-driven learning across multiple languages.

---

## Required Tech Stack

| Category | Requirement |
|----------|-------------|
| Framework | React + Next.js 14+ (App Router) — OR Vue 3 + Nuxt 3, Svelte + SvelteKit |
| Language | TypeScript (strict mode, no `any` types) |
| Styling | Tailwind CSS with custom design tokens |
| Components | shadcn/ui, Radix, or Headless UI |
| CMS | Sanity, Strapi, or Contentful (headless) |
| Auth | Solana Wallet Adapter (multi-wallet) + Google sign-in (GitHub bonus) |
| Analytics | GA4 + heatmap (PostHog/Hotjar/Clarity) + Sentry error monitoring |
| i18n | Portuguese (PT-BR), Spanish (ES), English (EN) |
| Code Editor | Monaco Editor, CodeMirror 6, or embedded Solana Playground |
| Deployment | Vercel or Netlify with preview environments |

---

## On-Chain Program Integration

The Anchor program repo is at `github.com/solanabr/superteam-academy`. Submissions must be a PR following the monorepo structure:

```
/root
  .claude/
  docs/
  onchain-academy/
    app/        (frontend)
    backend/
```

### On-Chain Components

| Component | Details |
|-----------|---------|
| XP System | Soulbound fungible token (Token-2022, NonTransferable). Level = floor(sqrt(xp / 100)) |
| Credentials | Metaplex Core NFTs (soulbound via PermanentFreezeDelegate), one per learning track, upgradable in-place |
| Courses | On-chain PDAs spawning per-learner Enrollment PDAs with 256-bit progress bitmaps (up to 256 lessons) |
| Achievements | Bitmap-based (256 possible), minted as soulbound Metaplex Core NFTs with configurable supply caps and XP rewards |
| Leaderboard | Off-chain, derived via Helius DAS API or custom indexer of XP balances |
| Streaks | Frontend-only (local storage/database/CMS), no on-chain tracking |

### Features to Fully Implement (Devnet)

1. Wallet authentication (multi-wallet adapter)
2. XP balance display from Token-2022 accounts
3. Credential (Metaplex Core NFT) display and verification
4. Leaderboard by indexing XP balances
5. Course enrollment (learner-signed transactions, no backend needed)

### Features to Stub (Clean Service Abstractions)

1. Lesson completion flow (backend-signed transactions)
2. Course finalization and credential issuance
3. Achievement claiming
4. Streak tracking

Create a `LearningProgressService` interface exposing: progress retrieval, lesson completion, XP balance, streak data, leaderboard entries (weekly/monthly/all-time), and credential retrieval. See `docs/INTEGRATION.md` for exact PDA structures and instruction parameters.

---

## Required Pages (10 Core)

### 1. Landing Page (`/`)
Hero section, learning path previews, social proof, feature highlights, footer.

### 2. Course Catalog (`/courses`)
Filterable grid (difficulty, topic, duration), curated paths, cards with progress %, full-text search.

### 3. Course Detail (`/courses/[slug]`)
Header, expandable modules/lessons, progress bar, enrollment CTA, reviews section.

### 4. Lesson View (`/courses/[slug]/lessons/[id]`)
Split layout — content left, code editor right (resizable). Markdown rendering, navigation, completion tracking, hints/solution toggle.

### 5. Code Challenge Interface
Prompt, visible test cases, pre-populated starter code, run button with output, error messages, completion marking.

### 6. User Dashboard (`/dashboard`)
Current courses with %, XP/level progress, streak calendar, achievements, recommendations, activity feed.

### 7. User Profile (`/profile`, `/profile/[username]`)
Avatar, bio, social links, skill radar chart, achievement showcase, on-chain credential display, completed courses, public/private toggle.

### 8. Leaderboard (`/leaderboard`)
Global XP rankings, weekly/monthly/all-time filters, user cards with rank/avatar/XP/level/streak, current user highlighted.

### 9. Settings (`/settings`)
Profile editing, account management (wallets, Google/GitHub), preferences (language/theme/notifications), privacy controls.

### 10. Certificate/Credential View (`/certificates/[id]`)
Visual certificate, on-chain verification link, social share buttons, downloadable image, NFT metadata.

---

## Gamification System

### XP Rewards

| Action | XP |
|--------|-----|
| Complete lesson | 10-50 (difficulty-based) |
| Complete challenge | 25-100 |
| Complete course | 500-2,000 |
| Daily streak bonus | 10 |
| First completion of day | 25 |

### Leveling
Formula: `Level = floor(sqrt(xp / 100))`

### Streaks (Frontend-Managed)
Track consecutive days, visual calendar, milestone rewards at 7/30/100 days.

### Achievements/Badges (5 Categories)

**Progress:** First Steps, Course Completer, Speed Runner
**Streaks:** Week Warrior, Monthly Master, Consistency King
**Skills:** Rust Rookie, Anchor Expert, Full Stack Solana
**Community:** Helper, First Comment, Top Contributor
**Special:** Early Adopter, Bug Hunter, Perfect Score

---

## Code Editor Requirements

- Rust / TypeScript / JSON syntax highlighting
- Basic autocompletion
- Error display
- Pass/fail feedback for challenges

---

## Account Linking

Users sign up with wallet OR Google OR GitHub, link additional methods later, and use any linked method to sign in. Wallet linking is mandatory for course finalization and credential receipt.

---

## CMS Integration

Courses contain modules; modules contain lessons (content or challenge type). The CMS must support:
- Visual content editor with markdown/code blocks
- Media management
- Draft/publish workflow
- Course metadata (difficulty, duration, XP, track association)

Submission must include a configured CMS with sample course imported.

---

## Performance Targets

### Lighthouse
| Metric | Target |
|--------|--------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 90+ |

### Core Web Vitals
| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

Implement: image optimization, code splitting, lazy loading, static generation, bundle optimization.

---

## Required Deliverables

1. **Pull Request** to `github.com/solanabr/superteam-academy` (monorepo structure)
2. **Production Application** — all 10 pages functional, wallet auth, gamification, code editor, i18n (PT-BR/ES/EN), light/dark themes, responsive, Lighthouse targets met
3. **Analytics** — GA4 with custom events, heatmap solution, Sentry monitoring
4. **CMS** — configured with schema and sample course
5. **Deployment** — live demo on Vercel/Netlify with preview deployments
6. **Documentation:**
   - `README.md` — overview, tech stack, setup, env vars, deployment
   - `ARCHITECTURE.md` — system architecture, components, data flow, service interfaces, on-chain integration points
   - `CMS_GUIDE.md` — course creation/editing, content schema, publishing workflow
   - `CUSTOMIZATION.md` — theme customization, language addition, gamification extension
7. **Demo Video** (3-5 min) — feature walkthrough, architecture overview, key decisions
8. **Twitter Post** — share submission, tag @SuperteamBR

---

## Bonus Features

- Admin dashboard (course management, user analytics)
- E2E tests (Playwright/Cypress)
- Community/forum section
- Onboarding with skill assessment quiz
- PWA support (installable, offline)
- Advanced gamification (daily challenges, seasonal events)
- CMS course creator dashboard
- Actual devnet program integration

---

## Evaluation Criteria

| Criteria | Weight |
|----------|--------|
| Code Quality & Architecture | 25% |
| Feature Completeness | 25% |
| UI/UX Design | 20% |
| Performance | 15% |
| Documentation | 10% |
| Bonus Features | 5% |

**Code Quality notes:** Clean, typed, well-structured, maintainable. Clean service abstractions for future on-chain integration.

**UI/UX notes:** Polished, intuitive, developer-focused. Dark mode is primary.

---

## Key Rules

- All submissions must be original work
- Code must be open-source (MIT license)
- Winning submission becomes foundation for LATAM developer education
- Non-winning submissions remain developer property
- Multiple submissions from same person/agent/team disallowed
- AI-generated code allowed if reviewed, tested, production-quality
- Judges' decisions final
- Polished subset preferred over buggy complete implementation
- Supabase acceptable for MVP with clean abstractions for future on-chain swapping
- Teams allowed; prize per submission, not per person
