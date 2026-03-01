# Phase 8: Deploy & Final PR

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the app to Vercel, verify the full end-to-end flow on the live URL, write documentation, and submit the PR to `solanabr/superteam-academy`.

**Architecture:** Vercel deployment with root directory set to `app/`. All environment variables replicated from `.env.local`. Solana program running on devnet (either the existing public instance or a freshly deployed one using `DEPLOY-PROGRAM.md`).

**Tech Stack:** Vercel CLI / dashboard, gh CLI, Next.js production build.

**Prerequisites:** Phases 0–7 complete. All Lighthouse scores ≥ 90. Sample course seeded in Sanity. On-chain course PDA exists on devnet. All env vars documented.

---

## Task 31: Deploy to Vercel

**Files:**
- Create: `app/vercel.json` (if needed)
- Modify: root `.gitignore`

**Step 1: Push branch to GitHub fork**

Run:
```bash
git push origin feat/frontend-app-26-02-2026
```

**Step 2: Connect to Vercel**

1. Go to https://vercel.com/new
2. Import from GitHub — select your fork `<your-username>/superteam-academy`
3. Set **Root Directory** to `app`
4. Framework: Next.js (auto-detected)
5. Add all environment variables from `.env.local` (copy each key/value)
6. Click Deploy

**Step 3: Configure preview deployments**

Vercel auto-creates preview deploys per commit. After deploy completes, open the preview URL and verify the page loads.

**Step 4: Deploy own Solana program instance (if using a fresh program)**

Follow `docs/DEPLOY-PROGRAM.md`:
1. Generate keypairs in `wallets/`
2. `anchor build && anchor deploy --provider.cluster devnet`
3. Run `scripts/initialize.ts`
4. Run `scripts/create-mock-course.ts`
5. Update env vars in Vercel dashboard with new program ID and XP mint
6. Trigger a redeploy

**Step 5: Verify full flow on deployed URL**

Walk through the complete student journey on the live Vercel URL:
1. Visit deployed URL
2. Connect wallet (Phantom or Solflare)
3. Browse courses — sample course visible
4. Enroll in sample course — `enroll` transaction signed
5. Complete first lesson — XP minted, XP burst animation plays
6. Check dashboard — XP balance updated, streak day marked
7. Check leaderboard — wallet appears with XP balance
8. Complete remaining lessons
9. Finalize course — `finalizeCourse` transaction signed
10. Credential issued — NFT minted
11. View certificate page — NFT metadata visible with Solana Explorer link

**Step 6: Commit vercel.json if created**

```bash
git add -A && git commit -m "feat: add Vercel deployment config"
git push origin feat/frontend-app-26-02-2026
```

---

## Task 32: Documentation and PR

**Files:**
- Create: `app/README.md`
- Create: `app/docs/SETUP.md`

**Step 1: Write app README**

Cover: project overview, tech stack, setup instructions, environment variables table, architecture diagram (text-based is fine), deployment guide, Lighthouse scores.

**Step 2: Write setup guide**

Step-by-step for a new developer: clone, install, create Sanity project, create Neon database, set up auth providers, deploy Solana program, seed content, run dev server.

**Step 3: Clean up**

- Remove any unused files, debug logs, `console.log` statements, TODO comments
- Run `npx next build` — verify 0 errors
- Run `npx tsc --noEmit` — verify 0 type errors
- Check all pages render correctly in production build (`npm run start`)
- Verify dark mode works on every page
- Test all 3 locales (`/`, `/pt-BR/`, `/es/`)

**Step 4: Create PR**

```bash
git push origin feat/frontend-app-26-02-2026
gh pr create --repo solanabr/superteam-academy --title "feat: Superteam Academy frontend application" --body "$(cat <<'EOF'
## Summary

- Complete Next.js App Router frontend for Superteam Academy LMS
- 10 student pages: landing, courses, lesson view, dashboard, profile, leaderboard, settings, certificate, sign-in
- 4 admin pages: dashboard, course CRUD, content editor, preview mode
- Solana integration: on-chain enrollment, XP minting, credential NFTs (Metaplex Core)
- Auth: Google, GitHub, Sign-In With Solana (SIWS) via Better Auth
- i18n: English, Português, Español via next-intl
- Gamification: streak calendar, achievement badges, XP level system

## Tech Stack

Next.js 16, TypeScript (strict), Tailwind CSS 4, Sanity CMS, Neon Postgres + Drizzle, Better Auth, Solana Wallet Adapter, @coral-xyz/anchor, Helius DAS, next-intl, Tiptap v3, Monaco Editor, GA4, PostHog, Sentry

## Demo

[Vercel URL]

## Lighthouse Scores

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Landing | [score] | [score] | [score] | [score] |
| Courses | [score] | [score] | [score] | [score] |
| Lesson View | [score] | [score] | [score] | [score] |

## Setup

See `app/docs/SETUP.md` for complete setup instructions.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Step 5: Share PR URL**

Copy the PR URL from the `gh pr create` output and share it.

---

## Phase Gate — Submission Complete

All of the following must be true before considering the project done:

- [ ] `cd app && npx next build` exits with code 0 with no errors or warnings
- [ ] `cd app && npx tsc --noEmit` exits with code 0
- [ ] Vercel deployment is live and accessible at a public URL
- [ ] **Full E2E flow verified on live URL**: connect wallet → enroll → complete lesson → XP minted → dashboard shows XP → leaderboard shows wallet → complete all lessons → credential minted → certificate page renders
- [ ] All 3 locales work on live URL (`/`, `/pt-BR/`, `/es/`)
- [ ] Dark mode works on live URL
- [ ] Admin flow works on live URL: sign in as admin → create/edit course → publish → appears in student catalog
- [ ] Lighthouse scores ≥ 90 Performance on live URL (run against Vercel URL, not localhost)
- [ ] PR is open at `github.com/solanabr/superteam-academy/pulls`
- [ ] PR body contains: demo URL, Lighthouse scores table, tech stack list, setup instructions link
- [ ] `app/README.md` exists with performance scores documented
- [ ] `app/docs/SETUP.md` exists with complete developer setup steps
