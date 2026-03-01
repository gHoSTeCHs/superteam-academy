# Phase 0: Repository Setup & Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fork the upstream monorepo, create the working branch, and migrate the existing 88-file Next.js app into the `/app` folder so all subsequent phases build on a clean, committed baseline.

**Architecture:** Next.js App Router. Existing work lives in `~/Documents/Projects/Hackathons/superteam-academy/` on branch `feat/lms-components`. Target is `~/Documents/Projects/Hackathons/superteam-academy-fork/app/`.

**Tech Stack:** Next.js 16, TypeScript (strict), Tailwind CSS 4.

**Prerequisites:** None. This is the starting gate.

---

## Task 1: Fork Monorepo and Migrate Existing Work

**Files:**
- Clone: `github.com/solanabr/superteam-academy` (fork)
- Move: entire `superteam-academy/` content → `superteam-academy-fork/app/`

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

## Phase Gate — Must Pass Before Starting Phase 1

All of the following must be true before proceeding:

- [ ] `cd app && npx next build` exits with code 0, no errors
- [ ] `cd app && npx tsc --noEmit` exits with code 0, no type errors
- [ ] `git status` shows a clean working tree (nothing uncommitted)
- [ ] Confirm `app/.git` does not exist (the nested git repo was removed)
- [ ] Confirm `app/node_modules` is not committed (check `.gitignore` covers it)
- [ ] The fork exists on GitHub at `github.com/<your-username>/superteam-academy`
- [ ] The branch `feat/frontend-app-26-02-2026` is checked out

**Verification note:** There is no UI to test in this phase. The gate is a clean build only.
