# Phase 1: Infrastructure (i18n, Database, Auth, Solana, Sanity)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up every infrastructure dependency — i18n routing, Neon database, Better Auth with SIWS, Solana Wallet Adapter, and Sanity CMS — so that all subsequent phases can import from these without setup work.

**Architecture:** Next.js App Router with locale-prefixed routes (`/[locale]/...`), Sanity for course content, Neon Postgres + Drizzle for users/auth, Better Auth for Google/GitHub/SIWS, Solana Wallet Adapter, next-intl.

**Tech Stack:** next-intl, Neon Postgres, Drizzle ORM, Better Auth, tweetnacl, bs58, Solana Wallet Adapter, @coral-xyz/anchor, Sanity, next-sanity.

**Prerequisites:** Phase 0 complete. Working branch `feat/frontend-app-26-02-2026` checked out. App builds with 0 errors.

**External accounts needed before starting:**
- Neon project created at https://console.neon.tech — have the connection string ready
- Sanity project created at https://sanity.io/manage — have the project ID and dataset name ready
- Google OAuth app created at https://console.cloud.google.com — have client ID + secret
- GitHub OAuth app created at https://github.com/settings/developers — have client ID + secret

---

## Task 2: Set Up next-intl (i18n)

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

## Task 3: Set Up Neon Postgres + Drizzle ORM

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

## Task 4: Set Up Better Auth

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

## Task 5: Set Up Solana Wallet Adapter

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

## Task 6: Set Up Sanity CMS

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

## Phase Gate — Must Pass Before Starting Phase 2

All of the following must be true before proceeding:

- [ ] `cd app && npx next build` exits with code 0, no errors
- [ ] `cd app && npx tsc --noEmit` exits with code 0, no type errors
- [ ] `npm run dev` → navigate to `http://localhost:3000` — page loads
- [ ] Navigate to `http://localhost:3000/pt-BR` — same page loads with Portuguese locale in URL
- [ ] Navigate to `http://localhost:3000/es` — same page loads with Spanish locale
- [ ] Check Neon console — tables exist: `user`, `session`, `account`, `verification`, `walletLink`, `userPreferences`
- [ ] `GET http://localhost:3000/api/auth/session` returns 200 (even if `{ session: null }`)
- [ ] Navigate to `/studio` — Sanity Studio loads (may take a moment on first load)
- [ ] `.env.local` exists and is gitignored — run `git status` to confirm it is not staged
- [ ] All 6 env var groups have real values (not placeholder `...`): DATABASE_URL, BETTER_AUTH_*, GOOGLE_*, GITHUB_*, NEXT_PUBLIC_SANITY_*, NEXT_PUBLIC_SOLANA_*

**Verification note:** Wallet connection is client-side; it cannot be tested with `next build`. Test it manually by running `npm run dev` and clicking the wallet button — the Phantom/Solflare modal should open.
