# Phase 5: Admin Pages — Design Document

**Date:** 2026-03-03
**Branch:** `feat/frontend-app-26-02-2026`
**Status:** Approved

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page architecture | Server-first with client islands | Matches Phase 4 pattern, keeps tokens server-side |
| Mutations | Server Actions (`"use server"`) | Type-safe, no API route boilerplate, CSRF handled by Next.js |
| Mutations file path | `app/src/sanity/mutations.ts` | Colocated with existing Sanity code |
| Route group | `(admin)` route group (existing) | Phase 3 already set this up |
| Dashboard data | Real fetchers with graceful fallbacks | Try/catch each source, fallback to 0 |
| Schema gaps | Fix as part of Phase 5 | Admin CRUD depends on these fields |

## Section 1: Schema Fixes

### `course.ts` — add 3 fields

- `isPublished` (boolean, default false)
- `publishedAt` (datetime, read-only — set by Server Action)
- `difficulty` (string: beginner/intermediate/advanced, default beginner)

### `module.ts` — add 1 field

- `description` (text) — already expected by `ModuleNode` component

### QuizBlockEditor integration

Wire the 13 existing question builders (`app/src/components/admin/question-builders/`) into `QuizBlockEditor` so it renders the correct `ResponseConfig` editor based on the selected question type.

## Section 2: Sanity Write Client + Mutations

### Write client

Add `writeSanityClient` to `app/src/sanity/client.ts` using `SANITY_API_TOKEN` (server-only).

### Server Actions — `app/src/sanity/mutations.ts`

| Function | Operation |
|----------|-----------|
| `createCourse(data)` | `client.create({ _type: 'course', ...data })` |
| `updateCourse(id, patch)` | `client.patch(id).set(patch).commit()` |
| `publishCourse(id)` | Patch `isPublished: true, publishedAt: now` |
| `unpublishCourse(id)` | Patch `isPublished: false` |
| `deleteCourse(id)` | `client.delete(id)` |
| `createModule(courseId, data)` | Create module + append ref to course.modules |
| `updateModule(id, patch)` | Patch module fields |
| `deleteModule(courseId, moduleId)` | Delete module + remove ref from course |
| `createLesson(moduleId, data)` | Create lesson + append ref to module.lessons |
| `updateLesson(id, patch)` | Patch lesson fields (including contentBlocks) |
| `deleteLesson(moduleId, lessonId)` | Delete lesson + remove ref from module |
| `uploadAsset(file)` | `client.assets.upload('image', file)` |

Each Server Action validates the session first.

### Admin GROQ queries — `app/src/sanity/queries.ts`

- `adminCoursesQuery` — all courses with module/lesson counts (drafts included)
- `adminCourseByIdQuery` — full course → modules → lessons for CourseTree
- `adminLessonByIdQuery` — lesson with contentBlocks for BlockList

## Section 3: Admin Pages

### Task 22: Admin Dashboard (`/admin`)

Update existing `app/src/app/[locale]/(admin)/admin/page.tsx`:
- Server component fetches real stats: course count + published/draft (Sanity), user count (Drizzle), enrollment count (Helius)
- Each fetch in try/catch → fallback to 0
- Recent activity: latest 5 courses by `_createdAt`
- Props passed to existing `AdminDashboard` component

### Task 23: Course Management

**`/admin/courses`** — server page + client component
- `DataTable` with columns: title, status badge, module count, lesson count, created date, row actions
- `SearchInput` for client-side filtering
- Row actions → Server Actions (publish, unpublish, delete) with `revalidatePath`

**`/admin/courses/new`** — server page + client component
- `CourseTree` in create mode (empty initial state)
- Save → `createCourse` → redirect to `/admin/courses/[id]/edit`

**`/admin/courses/[id]/edit`** — server page + client component
- Fetch full course via `adminCourseByIdQuery`
- `CourseTree` with existing data
- Save → `updateCourse`
- Module/lesson CRUD via corresponding Server Actions

### Task 24: Content Editor

**`/admin/courses/[id]/lessons/[lessonId]/edit`** — server page + client component
- Fetch lesson via `adminLessonByIdQuery`
- `BlockList` with existing blocks
- Save → `updateLesson` with updated contentBlocks
- Image upload → `uploadAsset` Server Action
- Quiz blocks → question builders (newly integrated)

### Task 25: Preview Mode

**`/admin/courses/[id]/preview`** — server page
- Student course view rendering with Sanity preview client (no CDN, sees drafts)
- `PreviewBanner` at top: "Exit Preview" → back to edit, "Publish Course" → `publishCourse`

**`/admin/courses/[id]/preview/lessons/[lessonSlug]`** — server page
- Student lesson view rendering with preview client
- No on-chain calls (progress/completion disabled)
- `PreviewBanner` persists

## File Map

```
app/src/sanity/
├── client.ts                          ← ADD writeSanityClient
├── mutations.ts                       ← NEW (Server Actions)
├── queries.ts                         ← ADD admin queries
└── schemas/
    ├── course.ts                      ← ADD isPublished, publishedAt, difficulty
    └── module.ts                      ← ADD description

app/src/app/[locale]/(admin)/admin/
├── layout.tsx                         ← EXISTS (no changes)
├── page.tsx                           ← UPDATE (wire real stats)
└── courses/
    ├── page.tsx                       ← NEW (course list)
    ├── courses-list-client.tsx        ← NEW (DataTable client)
    ├── new/
    │   ├── page.tsx                   ← NEW (create course)
    │   └── new-course-client.tsx      ← NEW (CourseTree client)
    └── [id]/
        ├── edit/
        │   ├── page.tsx              ← NEW (edit course)
        │   └── edit-course-client.tsx ← NEW (CourseTree client)
        ├── lessons/
        │   └── [lessonId]/
        │       └── edit/
        │           ├── page.tsx      ← NEW (lesson editor)
        │           └── lesson-editor-client.tsx ← NEW (BlockList client)
        └── preview/
            ├── page.tsx              ← NEW (course preview)
            └── lessons/
                └── [lessonSlug]/
                    └── page.tsx      ← NEW (lesson preview)

app/src/components/admin/content-editor/editors/
└── quiz-block-editor.tsx              ← UPDATE (wire question builders)
```

## Phase Gate

- [ ] `cd app && npx next build` exits 0
- [ ] Admin dashboard renders with real stat counts (fallback to 0 if unconfigured)
- [ ] Course list shows courses with correct status
- [ ] Create course form submits; new course appears in Sanity
- [ ] Edit course changes persist after reload
- [ ] Publish/unpublish toggles visibility at `/courses`
- [ ] Content editor loads/saves lesson blocks
- [ ] Preview mode shows draft content with banner
- [ ] Preview lesson renders same as student view, no on-chain calls
- [ ] Unauthenticated `/admin/*` redirects to sign-in
