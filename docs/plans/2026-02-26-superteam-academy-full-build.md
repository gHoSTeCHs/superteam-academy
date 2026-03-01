# Superteam Academy — Full Build Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete Superteam Academy frontend as a PR to the `solanabr/superteam-academy` monorepo — 10+ student pages, admin CMS, auth, Solana program integration, gamification, i18n, analytics.

**Architecture:** Next.js App Router with locale-prefixed routes (`/[locale]/...`), Sanity for course content, Neon Postgres + Drizzle for users/auth, Better Auth for Google/GitHub/SIWS, Solana Wallet Adapter for on-chain interactions, Helius DAS for leaderboard/credentials. Backend signing via Next.js API routes.

**Tech Stack:** Next.js 16, TypeScript (strict), Tailwind CSS 4, Radix UI, Sanity, Neon Postgres, Drizzle ORM, Better Auth, Solana Wallet Adapter, @coral-xyz/anchor, Helius DAS API, next-intl, Tiptap v3, Monaco Editor, Sentry, GA4, PostHog.

**Submission:** PR to `github.com/solanabr/superteam-academy` — our code in `/app` folder.

**Existing work:** 88 TypeScript files (components, types, code runner, admin builders) on branch `feat/lms-components` in standalone repo. Must migrate into monorepo `/app`.

---

## Phase 0: Repository Setup & Migration

### Task 1: Fork Monorepo and Migrate Existing Work

**Files:**
- Clone: `github.com/solanabr/superteam-academy` (fork)
- Move: entire `superteam-academy/` content → `superteam-academy-upstream/app/`

**Step 1: Fork the upstream repo on GitHub**

Go to `https://github.com/solanabr/superteam-academy` and fork it to your GitHub account.

**Step 2: Clone your fork locally**

Run:
```bash
git clone https://github.com/<your-username>/superteam-academy.git ~/Documents/Projects/Hackathons/superteam-academy-fork
cd ~/Documents/Projects/Hackathons/superteam-academy-fork
```

**Step 3: Create working branch**

Run:
```bash
git checkout -b feat/frontend-app-26-02-2026
```

**Step 4: Copy existing Next.js app into `/app`**

Run:
```bash
mkdir -p app
cp -r ~/Documents/Projects/Hackathons/superteam-academy/* app/
cp ~/Documents/Projects/Hackathons/superteam-academy/.gitignore app/
rm -rf app/.git app/.next app/node_modules app/tsconfig.tsbuildinfo
```

**Step 5: Install dependencies in `/app`**

Run:
```bash
cd app && npm install
```

**Step 6: Verify build**

Run:
```bash
npx next build
```
Expected: Build succeeds with 0 errors.

**Step 7: Commit**

```bash
cd .. && git add app/
git commit -m "feat: migrate existing Next.js frontend into /app"
```

---

## Phase 1: Infrastructure (i18n, Database, Auth)

### Task 2: Set Up next-intl (i18n)

**Files:**
- Create: `app/messages/en.json`
- Create: `app/messages/pt-BR.json`
- Create: `app/messages/es.json`
- Create: `app/src/i18n/routing.ts`
- Create: `app/src/i18n/request.ts`
- Create: `app/src/i18n/navigation.ts`
- Create: `app/src/middleware.ts`
- Modify: `app/next.config.ts`
- Modify: `app/src/app/layout.tsx` → move to `app/src/app/[locale]/layout.tsx`
- Move: all pages under `app/src/app/` → `app/src/app/[locale]/`

**Step 1: Install next-intl**

Run:
```bash
cd app && npm install next-intl
```

**Step 2: Create routing config**

Create `app/src/i18n/routing.ts`:
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt-BR', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
```

**Step 3: Create request config**

Create `app/src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 4: Create navigation utilities**

Create `app/src/i18n/navigation.ts`:
```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

**Step 5: Create middleware**

Create `app/src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|studio|.*\\..*).*)',
};
```

**Step 6: Update next.config.ts**

Wrap with next-intl plugin:
```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
```

**Step 7: Create initial message files**

Create `app/messages/en.json` with all UI strings (navigation, buttons, labels, pages). Create `app/messages/pt-BR.json` and `app/messages/es.json` with generated translations.

Structure:
```json
{
  "Navigation": { "home": "Home", "courses": "Courses", "dashboard": "Dashboard", "leaderboard": "Leaderboard", "profile": "Profile", "settings": "Settings" },
  "Auth": { "signIn": "Sign In", "signOut": "Sign Out", "connectWallet": "Connect Wallet", "signInWithGoogle": "Sign in with Google", "signInWithGithub": "Sign in with GitHub" },
  "Landing": { "hero": "...", "cta": "..." },
  "Courses": { "catalog": "...", "enroll": "...", "enrolled": "...", "progress": "..." },
  "Dashboard": { "title": "...", "xp": "...", "level": "...", "streak": "..." },
  "Leaderboard": { "title": "...", "rank": "...", "filters": "..." },
  "Common": { "loading": "Loading...", "error": "Something went wrong", "save": "Save", "cancel": "Cancel", "delete": "Delete", "edit": "Edit", "publish": "Publish", "draft": "Draft" }
}
```

**Step 8: Move pages under [locale]**

Move `app/src/app/layout.tsx` → `app/src/app/[locale]/layout.tsx`. Update it to wrap children with `NextIntlClientProvider`. Move `app/src/app/page.tsx` → `app/src/app/[locale]/page.tsx`. Move `app/src/app/showcase/` → `app/src/app/[locale]/showcase/`. Keep `app/src/app/api/` at root level (outside `[locale]`).

**Step 9: Verify build**

Run: `npx next build`
Expected: Build succeeds.

**Step 10: Commit**

```bash
git add -A && git commit -m "feat: add next-intl i18n with en/pt-BR/es locales"
```

---

### Task 3: Set Up Neon Postgres + Drizzle ORM

**Files:**
- Create: `app/src/db/index.ts`
- Create: `app/src/db/schema.ts`
- Create: `app/drizzle.config.ts`
- Create: `app/.env.local` (gitignored)

**Step 1: Install dependencies**

Run:
```bash
cd app && npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit dotenv
```

**Step 2: Create .env.local**

```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Get the connection string from https://console.neon.tech after creating a project.

**Step 3: Create drizzle config**

Create `app/drizzle.config.ts`:
```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 4: Create database connection**

Create `app/src/db/index.ts`:
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: sql, schema });
```

**Step 5: Create schema with auth tables + custom tables**

Create `app/src/db/schema.ts` with:
- Better Auth required tables: `user`, `session`, `account`, `verification`
- Custom tables: `walletLink` (userId → walletAddress), `userPreferences` (locale, theme)

See Task 4 for the Better Auth schema generation step — the auth tables are generated by `@better-auth/cli`.

**Step 6: Push schema to Neon**

Run:
```bash
npx drizzle-kit push
```
Expected: Tables created in Neon.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Neon Postgres + Drizzle ORM setup"
```

---

### Task 4: Set Up Better Auth

**Files:**
- Create: `app/src/lib/auth.ts`
- Create: `app/src/lib/auth-client.ts`
- Create: `app/src/app/api/auth/[...all]/route.ts`
- Create: `app/src/lib/auth-plugins/siws/index.ts`
- Create: `app/src/lib/auth-plugins/siws/client.ts`
- Modify: `app/src/db/schema.ts` (add auth tables)

**Step 1: Install dependencies**

Run:
```bash
cd app && npm install better-auth tweetnacl bs58
```

**Step 2: Generate auth schema**

Run:
```bash
npx @better-auth/cli@latest generate --config ./src/lib/auth.ts
```

This generates the auth tables in the schema. Merge them into `app/src/db/schema.ts`.

**Step 3: Create server auth config**

Create `app/src/lib/auth.ts`:
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { siwsPlugin } from './auth-plugins/siws';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies(), siwsPlugin()],
});
```

**Step 4: Create client auth**

Create `app/src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from 'better-auth/react';
import { siwsClientPlugin } from './auth-plugins/siws/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [siwsClientPlugin()],
});
```

**Step 5: Create SIWS plugin**

Create `app/src/lib/auth-plugins/siws/index.ts` — custom Better Auth plugin that:
1. Exposes a `POST /api/auth/siws/verify` endpoint
2. Verifies Ed25519 signature using `tweetnacl`
3. Finds or creates user + account in Neon
4. Creates session via `ctx.context.internalAdapter.createSession`

Create `app/src/lib/auth-plugins/siws/client.ts` — client plugin that infers server plugin types.

**Step 6: Create API route handler**

Create `app/src/app/api/auth/[...all]/route.ts`:
```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

**Step 7: Add env vars to .env.local**

```
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**Step 8: Push updated schema**

Run: `npx drizzle-kit push`

**Step 9: Verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 10: Commit**

```bash
git add -A && git commit -m "feat: add Better Auth with Google/GitHub/SIWS providers"
```

---

### Task 5: Set Up Solana Wallet Adapter

**Files:**
- Create: `app/src/components/providers/solana-provider.tsx`
- Create: `app/src/components/providers/app-providers.tsx`
- Modify: `app/src/app/[locale]/layout.tsx` (wrap with providers)

**Step 1: Install dependencies**

Run:
```bash
cd app && npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @coral-xyz/anchor
```

**Step 2: Create Solana provider (client component)**

Create `app/src/components/providers/solana-provider.tsx`:
- `'use client'` directive
- `ConnectionProvider` with devnet endpoint (from env `NEXT_PUBLIC_SOLANA_RPC_URL`)
- `WalletProvider` with `wallets={[]}` (auto-detect standard wallets)
- `WalletModalProvider`

**Step 3: Create unified app providers**

Create `app/src/components/providers/app-providers.tsx`:
- Wraps `SolanaProvider` + `ThemeProvider` (next-themes) + `NextIntlClientProvider`
- Single provider tree for the layout

**Step 4: Update locale layout**

Modify `app/src/app/[locale]/layout.tsx` to use `AppProviders`.

**Step 5: Add env vars**

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf
NEXT_PUBLIC_XP_MINT=xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3
```

**Step 6: Verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Solana Wallet Adapter with devnet config"
```

---

### Task 6: Set Up Sanity CMS

**Files:**
- Create: `app/src/sanity/config.ts`
- Create: `app/src/sanity/client.ts`
- Create: `app/src/sanity/schemas/course.ts`
- Create: `app/src/sanity/schemas/module.ts`
- Create: `app/src/sanity/schemas/lesson.ts`
- Create: `app/src/sanity/schemas/content-block.ts`
- Create: `app/src/sanity/schemas/index.ts`
- Create: `app/src/sanity/queries.ts`
- Create: `app/src/app/studio/[[...tool]]/page.tsx` (Sanity Studio embed)

**Step 1: Install Sanity**

Run:
```bash
cd app && npm install sanity next-sanity @sanity/client @sanity/image-url
```

**Step 2: Create Sanity project**

Go to https://sanity.io/manage and create a new project. Note the project ID and dataset name.

**Step 3: Create Sanity config**

Create `app/src/sanity/config.ts` with project ID, dataset, API version.

**Step 4: Create Sanity client**

Create `app/src/sanity/client.ts`:
- Server client (for SSR/RSC fetches, with CDN)
- Preview client (for draft content, no CDN, with token)

**Step 5: Define schemas**

Create schemas that match our existing TypeScript types:

`course.ts`: title, slug, description, image, difficulty (1/2/3), trackId, trackLevel, prerequisite (ref to course), xpPerLesson, creatorRewardXp, isPublished, publishedAt, modules (array of references to module)

`module.ts`: title, type (text/video/assessment), order, lessons (array of references to lesson)

`lesson.ts`: title, slug, xp, difficulty (beginner/intermediate/advanced), estimatedMinutes, contentBlocks (array of content-block objects), courseId (string — maps to on-chain course PDA)

`content-block.ts`: A polymorphic object type supporting all 7 block types:
- text: { body: TiptapJSON (stored as raw JSON) }
- code_example: { code, language, filename }
- code_challenge: { starterCode, solutionCode, testCases, hints, language, maxAttempts }
- quiz: { questions: array of question objects with type + responseConfig }
- callout: { type (info/warning/tip/danger), title, body }
- image: { asset, caption, alt }
- video_embed: { url, provider, checkpoints }

**Step 6: Create GROQ queries**

Create `app/src/sanity/queries.ts`:
- `allCoursesQuery` — all published courses with module count, lesson count
- `courseBySlugQuery` — single course with nested modules → lessons
- `lessonBySlugQuery` — single lesson with all content blocks expanded
- `draftCourseQuery` — includes `drafts.*` for admin preview

**Step 7: Embed Sanity Studio**

Create `app/src/app/studio/[[...tool]]/page.tsx`:
```typescript
'use client';
import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

This gives admins access to Sanity Studio at `/studio` for direct content management as a fallback.

**Step 8: Add env vars**

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=... (for preview/mutations)
```

**Step 9: Verify**

Run: `npx next build`

**Step 10: Commit**

```bash
git add -A && git commit -m "feat: add Sanity CMS with course/module/lesson schemas"
```

---

## Phase 2: Solana Service Layer

### Task 7: Create Solana Service Interfaces and PDA Utilities

**Files:**
- Create: `app/src/lib/solana/constants.ts`
- Create: `app/src/lib/solana/pda.ts`
- Create: `app/src/lib/solana/bitmap.ts`
- Create: `app/src/lib/solana/types.ts`
- Create: `app/src/lib/services/learning-progress.ts`

**Step 1: Create constants**

Create `app/src/lib/solana/constants.ts`:
```typescript
import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
export const XP_MINT = new PublicKey(process.env.NEXT_PUBLIC_XP_MINT!);
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
export const MPL_CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
```

**Step 2: Create PDA derivation helpers**

Create `app/src/lib/solana/pda.ts`:
- `getConfigPda()` → `["config"]`
- `getCoursePda(courseId)` → `["course", courseId]`
- `getEnrollmentPda(courseId, learner)` → `["enrollment", courseId, learner]`
- `getMinterRolePda(minter)` → `["minter", minter]`
- `getAchievementTypePda(achievementId)` → `["achievement", achievementId]`
- `getAchievementReceiptPda(achievementId, recipient)` → `["achievement_receipt", achievementId, recipient]`

All use `PublicKey.findProgramAddressSync`.

**Step 3: Create bitmap utilities**

Create `app/src/lib/solana/bitmap.ts`:
- `isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean`
- `countCompletedLessons(lessonFlags: BN[]): number`
- `getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[]`

Copy directly from the INTEGRATION.md reference.

**Step 4: Create service types**

Create `app/src/lib/solana/types.ts`:
```typescript
export interface CourseOnChain {
  courseId: string;
  creator: string;
  lessonCount: number;
  difficulty: number;
  xpPerLesson: number;
  trackId: number;
  trackLevel: number;
  isActive: boolean;
  totalCompletions: number;
}

export interface EnrollmentOnChain {
  lessonFlags: BN[];
  enrolledAt: number;
  completedAt: number | null;
  credentialAsset: string | null;
}

export interface LeaderboardEntry {
  walletAddress: string;
  xpBalance: number;
  level: number;
  rank: number;
}

export interface CredentialNft {
  mint: string;
  name: string;
  uri: string;
  trackId: number;
  coursesCompleted: number;
  totalXp: number;
  collection: string;
}
```

**Step 5: Create LearningProgressService interface**

Create `app/src/lib/services/learning-progress.ts`:
```typescript
export interface LearningProgressService {
  getXpBalance(walletAddress: string): Promise<number>;
  getLevel(walletAddress: string): Promise<number>;
  getEnrollment(courseId: string, walletAddress: string): Promise<EnrollmentOnChain | null>;
  getLeaderboard(timeframe: 'weekly' | 'monthly' | 'all-time'): Promise<LeaderboardEntry[]>;
  getCredentials(walletAddress: string): Promise<CredentialNft[]>;
  getAllCourses(): Promise<CourseOnChain[]>;
}
```

**Step 6: Verify**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Solana PDA utilities, bitmap helpers, and service interfaces"
```

---

### Task 8: Implement Solana Read Service

**Files:**
- Create: `app/src/lib/solana/program.ts`
- Create: `app/src/lib/solana/helius.ts`
- Create: `app/src/lib/services/solana-progress-service.ts`

**Step 1: Create program accessor**

Create `app/src/lib/solana/program.ts`:
- Initializes `Program<OnchainAcademy>` with the IDL
- Exports a `getProgram(connection)` function
- Works server-side (no wallet needed for reads)

Note: The IDL is generated from the Anchor build. Copy it from `onchain-academy/target/types/onchain_academy.ts` or `onchain-academy/target/idl/onchain_academy.json` into `app/src/lib/solana/idl.ts`.

**Step 2: Create Helius DAS client**

Create `app/src/lib/solana/helius.ts`:
- `getXpHolders()` — calls `getTokenAccounts` on XP mint, returns sorted by balance
- `getCredentialsByOwner(walletAddress)` — calls `getAssetsByOwner`, filters by track collection
- `getCredentialByMint(mint)` — calls `getAsset` for single credential details

Uses `HELIUS_API_KEY` env var. Endpoint: `https://devnet.helius-rpc.com/?api-key=...`

**Step 3: Implement SolanaProgressService**

Create `app/src/lib/services/solana-progress-service.ts`:
- `getXpBalance` → `getTokenAccountBalance` on Token-2022 ATA
- `getLevel` → `Math.floor(Math.sqrt(xp / 100))`
- `getEnrollment` → `program.account.enrollment.fetchNullable(enrollmentPda)`
- `getLeaderboard` → Helius `getXpHolders()`, derive level, sort by XP
- `getCredentials` → Helius `getCredentialsByOwner()`, parse attributes
- `getAllCourses` → `program.account.course.all()`, filter active

**Step 4: Verify**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: implement Solana read service with Helius DAS integration"
```

---

### Task 9: Backend Signing API Routes

**Files:**
- Create: `app/src/app/api/solana/complete-lesson/route.ts`
- Create: `app/src/app/api/solana/finalize-course/route.ts`
- Create: `app/src/app/api/solana/issue-credential/route.ts`
- Create: `app/src/lib/solana/backend-signer.ts`

**Step 1: Create backend signer utility**

Create `app/src/lib/solana/backend-signer.ts`:
- Loads backend signer keypair from `BACKEND_SIGNER_KEYPAIR` env var (base64 encoded secret key or file path)
- Exports `getBackendSigner(): Keypair`
- Server-side only — never imported from client code

**Step 2: Create complete-lesson API route**

`POST /api/solana/complete-lesson`

Body: `{ courseId: string, lessonIndex: number, learnerWallet: string }`

Flow:
1. Verify auth session (user is authenticated)
2. Verify learner wallet matches session user's linked wallet
3. Derive PDAs (config, course, enrollment)
4. Get or create learner's Token-2022 ATA
5. Build `completeLesson(lessonIndex)` instruction
6. Sign with backend signer
7. Send transaction
8. Return `{ txSignature: string }`

**Step 3: Create finalize-course API route**

`POST /api/solana/finalize-course`

Body: `{ courseId: string, learnerWallet: string }`

Similar flow — verifies all lessons complete via bitmap before signing.

**Step 4: Create issue-credential API route**

`POST /api/solana/issue-credential`

Body: `{ courseId: string, learnerWallet: string, credentialName: string, metadataUri: string }`

Flow:
1. Verify course is finalized (check `enrollment.completedAt`)
2. Check if credential already issued (`enrollment.credentialAsset`)
3. If not issued: call `issueCredential` with new Keypair for asset
4. If already issued: call `upgradeCredential` with existing asset pubkey
5. Return `{ txSignature: string, assetAddress: string }`

**Step 5: Add env var**

```
BACKEND_SIGNER_KEYPAIR=<base64 encoded secret key>
HELIUS_API_KEY=...
```

**Step 6: Verify**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add backend signing API routes for lesson completion and credentials"
```

---

## Phase 3: Layouts & Navigation

### Task 10: Create App Shell (Student Layout)

**Files:**
- Create: `app/src/components/layout/header.tsx`
- Create: `app/src/components/layout/footer.tsx`
- Create: `app/src/components/layout/sidebar.tsx`
- Create: `app/src/components/layout/locale-switcher.tsx`
- Create: `app/src/components/layout/user-menu.tsx`
- Create: `app/src/components/layout/wallet-button.tsx`
- Modify: `app/src/app/[locale]/layout.tsx`

**Step 1: Create header**

`header.tsx`: Logo, navigation links (Courses, Dashboard, Leaderboard), locale switcher, wallet button, user menu (avatar + dropdown with Profile, Settings, Sign Out). All strings from `useTranslations('Navigation')`. Use the `Link` from `@/i18n/navigation` (locale-aware).

**Step 2: Create locale switcher**

`locale-switcher.tsx`: Dropdown using our existing Select component. Shows language names (English, Portugues, Espanol). Uses `useRouter` from `@/i18n/navigation` to switch locale via `router.replace(pathname, { locale })`.

**Step 3: Create wallet button**

`wallet-button.tsx`: Wraps `WalletMultiButton` from `@solana/wallet-adapter-react-ui` with our design system styling. Shows truncated address when connected.

**Step 4: Create user menu**

`user-menu.tsx`: Avatar dropdown. If authenticated: name, email, Profile link, Settings link, Sign Out. If wallet connected: show wallet address. If neither: Sign In button.

**Step 5: Create footer**

`footer.tsx`: Superteam branding, links, social icons.

**Step 6: Update locale layout**

Wire header + footer into the `[locale]/layout.tsx`. Apply dark mode as primary theme.

**Step 7: Verify**

Run: `npm run dev` — navigate to `localhost:3000`, see header/footer.

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add app shell with header, footer, locale switcher, wallet button"
```

---

### Task 11: Create Admin Layout

**Files:**
- Create: `app/src/app/[locale]/admin/layout.tsx`
- Create: `app/src/components/admin/admin-sidebar.tsx`
- Create: `app/src/components/admin/admin-header.tsx`

**Step 1: Create admin sidebar**

`admin-sidebar.tsx`: Navigation links for admin pages — Dashboard, Courses, Content, Questions, Preview. Uses our existing admin component styling.

**Step 2: Create admin header**

`admin-header.tsx`: Breadcrumb, back-to-site link, user menu.

**Step 3: Create admin layout**

`app/src/app/[locale]/admin/layout.tsx`:
- Auth gate: check session, redirect to sign-in if not admin
- Sidebar + main content area
- Different from student layout

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add admin layout with sidebar navigation"
```

---

## Phase 4: Student Pages

### Task 12: Landing Page

**Files:**
- Create: `app/src/app/[locale]/page.tsx` (replace existing)
- Create: `app/src/components/landing/hero.tsx`
- Create: `app/src/components/landing/features.tsx`
- Create: `app/src/components/landing/course-preview.tsx`
- Create: `app/src/components/landing/cta.tsx`

**Step 1: Build landing page sections**

- Hero: Title, subtitle, CTA buttons (Browse Courses, Connect Wallet). Animated or visual element.
- Features: 3-4 cards (Interactive Coding, On-Chain Credentials, XP & Leaderboards, Multi-Language)
- Course Preview: Fetch 3 featured courses from Sanity, show cards with title, description, difficulty badge, lesson count
- CTA: Bottom section encouraging sign-up

All strings from `useTranslations('Landing')`.

**Step 2: Verify**

Run: `npm run dev` — landing page renders.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add landing page with hero, features, course preview"
```

---

### Task 13: Course Catalog Page

**Files:**
- Create: `app/src/app/[locale]/courses/page.tsx`
- Create: `app/src/components/courses/course-card.tsx`
- Create: `app/src/components/courses/course-filters.tsx`

**Step 1: Build course catalog**

Server component that fetches all published courses from Sanity. Displays as a grid of cards. Each card: title, description, difficulty badge, module count, lesson count, XP total, enrollment count (from on-chain `course.totalEnrollments`).

**Step 2: Add filters**

`course-filters.tsx`: Filter by difficulty (beginner/intermediate/advanced), track, search by title. Client component with URL search params.

**Step 3: Verify**

Requires at least one course in Sanity. Use Sanity Studio to create a test course.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add course catalog page with filters"
```

---

### Task 14: Course Detail Page

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

### Task 15: Lesson View Page

**Files:**
- Create: `app/src/app/[locale]/courses/[slug]/lessons/[lessonSlug]/page.tsx`
- Create: `app/src/components/lessons/lesson-content.tsx`
- Create: `app/src/components/lessons/lesson-navigation.tsx`
- Create: `app/src/components/lessons/lesson-complete-button.tsx`
- Create: `app/src/components/lessons/content-block-renderer.tsx`
- Create: `app/src/components/lessons/code-challenge.tsx`
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
6. **XP award animation** — triggered by `onPass()` callback. Renders a full-overlay burst animation (CSS keyframes): `+{xp} XP` in large text rises and fades out over 1.5s. Uses a portal so it overlays the entire lesson view, not just the component.

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

**Step 4: Build lesson navigation**

`lesson-navigation.tsx`: Previous/Next lesson buttons. Shows current position (Lesson 3 of 10). Module name breadcrumb.

**Step 5: Build lesson complete button**

`lesson-complete-button.tsx` (client component):
- Calls `POST /api/solana/complete-lesson` when clicked
- Backend signs the transaction
- Shows XP earned animation (same portal animation as CodeChallenge — extract to `app/src/components/ui/xp-burst.tsx` and share)
- Checks if all lessons complete → shows "Finalize Course" button
- On finalize: calls `POST /api/solana/finalize-course`

**Step 6: Verify**

Navigate to a lesson page on desktop — confirm split-pane renders. Resize to < 768px — confirm tab bar appears and Content/Code tabs switch correctly. Open a code challenge lesson — confirm editor loads with starter code, run tests, see pass/fail states, cycle hints.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add lesson view with mobile tabs, CodeChallenge component, and completion"
```

---

### Task 16: Dashboard Page

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

### Task 17: Profile Page

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

### Task 18: Leaderboard Page

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

### Task 19: Settings Page

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

### Task 20: Certificate/Credential View Page

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

### Task 21: Auth Pages (Sign In / Sign Up)

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

## Phase 5: Admin Pages

### Task 22: Admin Dashboard

**Files:**
- Create: `app/src/app/[locale]/admin/page.tsx`

**Step 1: Build admin dashboard**

Stats overview:
- Total courses (from Sanity)
- Total enrollments (from on-chain)
- Total users (from Neon)
- Published vs draft courses
- Recent activity

Uses our existing `stat-card.tsx` component.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add admin dashboard with stats overview"
```

---

### Task 23: Admin Course Management

**Files:**
- Create: `app/src/app/[locale]/admin/courses/page.tsx`
- Create: `app/src/app/[locale]/admin/courses/new/page.tsx`
- Create: `app/src/app/[locale]/admin/courses/[id]/edit/page.tsx`
- Create: `app/src/lib/sanity/mutations.ts`

**Step 1: Build course list page**

Uses our existing `data-table.tsx`. Columns: title, status (draft/published), modules, lessons, created date, actions (edit, preview, publish/unpublish, delete).

**Step 2: Build course create/edit page**

Uses our existing `CourseTree` component. On save: writes to Sanity via `sanityClient.createOrReplace()`. Draft/publish toggle: sets `isPublished` field.

**Step 3: Create Sanity mutation helpers**

`app/src/lib/sanity/mutations.ts`:
- `createCourse(data)` → Sanity create
- `updateCourse(id, data)` → Sanity patch
- `publishCourse(id)` → set `isPublished: true, publishedAt: new Date()`
- `unpublishCourse(id)` → set `isPublished: false`
- `deleteCourse(id)` → Sanity delete

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add admin course management with CRUD and publish workflow"
```

---

### Task 24: Admin Content Editor

**Files:**
- Create: `app/src/app/[locale]/admin/courses/[id]/lessons/[lessonId]/edit/page.tsx`

**Step 1: Build lesson content editor page**

Uses our existing `BlockList` (content editor) component. Fetches lesson content blocks from Sanity. On save: writes blocks back to Sanity.

Integrates:
- `TiptapEditor` for text blocks
- `CodeEditor` for code blocks
- Question builders for quiz blocks
- Image upload → Sanity assets
- Video embed URL input

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add admin content editor for lesson blocks"
```

---

### Task 25: Admin Preview Mode

**Files:**
- Create: `app/src/app/[locale]/admin/courses/[id]/preview/page.tsx`
- Create: `app/src/app/[locale]/admin/courses/[id]/preview/lessons/[lessonSlug]/page.tsx`

**Step 1: Build admin preview**

Admin can view the course exactly as a student would — using the same rendering components (ContentBlockRenderer, TiptapRenderer, VideoPlayer, CodeChallenge, QuestionRenderer) but fetching draft content from Sanity (using preview client with `drafts.*` query).

No on-chain interactions in preview mode — progress/completion is simulated locally.

A banner at the top: "Preview Mode — This is a draft. [Exit Preview] [Publish Course]"

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add admin preview mode for draft course content"
```

---

## Phase 6: Gamification UI

### Task 26: Streak System

**Files:**
- Already created in Task 16: `app/src/lib/streaks.ts`
- Create: `app/src/hooks/use-streak.ts`

**Step 1: Create streak hook**

`use-streak.ts` — wraps `streaks.ts` localStorage functions in a React hook:
- `currentStreak`, `longestStreak`, `lastActivityDate`
- `recordActivity()` — called when user completes a lesson
- `getCalendarData(month, year)` — for the streak calendar
- Milestone checks: 7, 30, 100 day badges

**Step 2: Integrate with lesson completion**

After `complete-lesson` API returns success, call `recordActivity()` to update streak.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add streak tracking with localStorage and milestone rewards"
```

---

### Task 27: Achievement Definitions

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
  { id: 'rust-rookie', name: 'Rust Rookie', category: 'skills', description: 'Complete a Rust course', xpReward: 150 },
  { id: 'anchor-expert', name: 'Anchor Expert', category: 'skills', description: 'Complete all Anchor courses', xpReward: 500 },
  { id: 'early-adopter', name: 'Early Adopter', category: 'special', description: 'Join during launch month', xpReward: 100 },
  { id: 'perfect-score', name: 'Perfect Score', category: 'special', description: 'Score 100% on all quizzes in a course', xpReward: 250 },
] as const;
```

~15-20 achievements across the 5 categories.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add achievement definitions catalog"
```

---

## Phase 7: Analytics & Polish

### Task 28: Analytics Integration

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

Create `posthog-provider.tsx` — client-side PostHog initialization. Tracks page views, heatmaps. Env var: `NEXT_PUBLIC_POSTHOG_KEY`.

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

### Task 29: Performance Optimization (Lighthouse / Core Web Vitals)

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

### Task 30: Sample Course Content

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

### Task 31: Deploy to Vercel

**Files:**
- Create: `app/vercel.json` (if needed)
- Modify: root `.gitignore`

**Step 1: Connect to Vercel**

1. Push branch to GitHub fork
2. Import project in Vercel, set root directory to `app/`
3. Set all environment variables
4. Deploy

**Step 2: Configure preview deployments**

Vercel auto-creates preview deploys per commit. Verify the preview URL works.

**Step 3: Deploy own Solana program instance**

Follow `docs/DEPLOY-PROGRAM.md`:
1. Generate keypairs in `wallets/`
2. `anchor build && anchor deploy --provider.cluster devnet`
3. Run `scripts/initialize.ts`
4. Run `scripts/create-mock-course.ts`
5. Update env vars with new program ID and XP mint

**Step 4: Verify full flow**

1. Visit deployed URL
2. Connect wallet
3. Browse courses
4. Enroll in sample course
5. Complete a lesson (XP minted)
6. Check dashboard (XP, streak, progress)
7. Check leaderboard
8. Complete all lessons, finalize, get credential
9. View certificate page

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Vercel deployment config"
```

---

## Phase 8: Final PR

### Task 32: Documentation and PR

**Files:**
- Create: `app/README.md`
- Create: `app/docs/SETUP.md`

**Step 1: Write app README**

Cover: project overview, tech stack, setup instructions, environment variables, architecture diagram, deployment guide.

**Step 2: Write setup guide**

Step-by-step for a new developer: clone, install, create Sanity project, create Neon database, set up auth providers, deploy Solana program, seed content, run dev server.

**Step 3: Clean up**

- Remove any unused files, debug logs, TODO comments
- Run `npx next build` — verify 0 errors
- Run `npx tsc --noEmit` — verify 0 type errors
- Check all pages render correctly
- Verify dark mode works everywhere
- Test all 3 locales

**Step 4: Create PR**

```bash
git push origin feat/frontend-app-26-02-2026
gh pr create --repo solanabr/superteam-academy --title "feat: Superteam Academy frontend application" --body "..."
```

PR body should include:
- Summary of what's built
- Screenshots of key pages
- Architecture diagram
- Setup instructions
- Demo URL (Vercel)
- Tech stack list
- List of all pages and features

---

## Task Dependency Graph

```
Phase 0: [Task 1: Migrate] ─────────────────────────────────────────────────┐
                                                                              │
Phase 1: [Task 2: i18n] → [Task 3: Neon+Drizzle] → [Task 4: Auth] ──────┐  │
         [Task 5: Wallet Adapter] ─────────────────────────────────────┐  │  │
         [Task 6: Sanity] ──────────────────────────────────────────┐  │  │  │
                                                                     │  │  │  │
Phase 2: [Task 7: PDA+Service Interface] → [Task 8: Read Service] ──┤  │  │  │
         [Task 9: Backend Signing] ──────────────────────────────────┤  │  │  │
                                                                     │  │  │  │
Phase 3: [Task 10: Student Layout] ─────(needs 2,4,5)───────────────┤  │  │  │
         [Task 11: Admin Layout] ───────(needs 2,4)──────────────────┤  │  │  │
                                                                     │  │  │  │
Phase 4: [Tasks 12-21: Student Pages] ──(needs 6,8,10)──────────────┤  │  │  │
                                                                     │  │  │  │
Phase 5: [Tasks 22-25: Admin Pages] ────(needs 6,11)────────────────┤  │  │  │
                                                                     │  │  │  │
Phase 6: [Tasks 26-27: Gamification] ───(needs 8,16)────────────────┤  │  │  │
                                                                     │  │  │  │
Phase 7: [Task 28: Analytics] [Task 29: Performance] [Task 30: Seed] ──┤  │  │  │
                                                                        │  │  │  │
Phase 8: [Task 31: Deploy] → [Task 32: PR] ─────────────────────────────┘  │  │  │
```

---

## Environment Variables Summary

```env
# Database (Neon)
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require

# Auth (Better Auth)
BETTER_AUTH_SECRET=<random 32 bytes base64>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=...
NEXT_PUBLIC_PROGRAM_ID=...
NEXT_PUBLIC_XP_MINT=...
BACKEND_SIGNER_KEYPAIR=<base64 secret key>
HELIUS_API_KEY=...

# Analytics
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
SENTRY_DSN=https://...@sentry.io/...

# Code Runner (optional)
CODE_RUNNER_BACKEND=mock
JUDGE0_URL=...
```

---

## Execution Notes

- **Parallel opportunities:** Tasks 2, 5, 6 can run in parallel (no dependencies between i18n, wallet adapter, and Sanity setup). Tasks 7+9 can run in parallel. Student pages (12-21) can be parallelized by page.
- **Critical path:** Task 1 → Task 2 → Task 3 → Task 4 → Task 10 → Task 15 (lesson view is the core experience).
- **Time estimate guidance:** Phase 0-1 (infrastructure): ~1.5 days. Phase 2 (Solana): ~1 day. Phase 3-5 (pages): ~3 days. Phase 6-8 (polish): ~1.5 days. Total: ~7 days.
- **Cut scope if behind:** Leaderboard weekly/monthly filters, skill radar chart, activity feed, achievement NFT minting can be stubbed. Core flow (browse → enroll → learn → complete → credential) is non-negotiable.
- **Performance task (Task 29) is non-negotiable:** Lighthouse scores are 15% of evaluation weight. Do not defer this to the end — run the bundle analyzer after Phase 3 layouts are in place so large chunks are identified early.
