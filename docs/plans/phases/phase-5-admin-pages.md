# Phase 5: Admin Pages

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the 4 admin-facing pages — dashboard stats, course CRUD with publish workflow, lesson content editor (using existing BlockList component), and preview mode that shows draft Sanity content as a student would see it.

**Architecture:** All admin pages live under `[locale]/admin/` and use the admin layout from Phase 3. Content mutations go through Sanity's write API. Preview mode uses the Sanity preview client (no CDN, with `SANITY_API_TOKEN`). Admin access is gated by Better Auth session.

**Tech Stack:** Sanity write API (`sanityClient.createOrReplace`, patch), existing `CourseTree` and `BlockList` components from the migrated 88-file codebase, Drizzle for user counts, @coral-xyz/anchor for enrollment counts.

**Prerequisites:** Phases 0–4 complete. Admin layout renders and auth gate works. At least one course in Sanity. `SANITY_API_TOKEN` set in `.env.local`.

---

## Task 22: Admin Dashboard

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

## Task 23: Admin Course Management

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

## Task 24: Admin Content Editor

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

## Task 25: Admin Preview Mode

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

## Phase Gate — Must Pass Before Starting Phase 6

All of the following must be true before proceeding:

- [ ] `cd app && npx next build` exits with code 0
- [ ] **Admin dashboard** (`/admin`): stat cards render with real counts (courses, users, enrollments)
- [ ] **Course list** (`/admin/courses`): existing test course appears in table with correct status
- [ ] **Create course** (`/admin/courses/new`): form submits, new course appears in Sanity (verify in Sanity Studio or console)
- [ ] **Edit course** (`/admin/courses/[id]/edit`): changes saved to Sanity persist after page reload
- [ ] **Publish workflow**: unpublished course does not appear at `/courses`; after publish, it does
- [ ] **Content editor** (`/admin/courses/[id]/lessons/[lessonId]/edit`): existing lesson blocks load; saving a text block change persists to Sanity
- [ ] **Preview mode** (`/admin/courses/[id]/preview`): draft content (not yet published) is visible with "Preview Mode" banner
- [ ] **Preview mode lesson** (`/admin/courses/[id]/preview/lessons/[lessonSlug]`): lesson renders using the same ContentBlockRenderer as the student view; no on-chain calls made (check network tab)
- [ ] Navigating away from preview returns to admin (no stuck state)
- [ ] Unauthenticated access to any `/admin/*` route redirects to sign-in
