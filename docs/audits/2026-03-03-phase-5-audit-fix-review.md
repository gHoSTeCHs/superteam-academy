# Phase 5 Audit Fix Review — 2026-03-03

## Context

Phase 5 (Admin Pages) audit fixes were implemented, then a 5-agent code review was run to validate the fixes. A second pass manually verified every finding against the actual source code to eliminate false positives. This document captures all confirmed findings.

## Methodology

5 parallel `feature-dev:code-reviewer` agents scanned the implementation across:
1. Content block round-trip (Sanity → mapBlock → state → blocksToSanity → Sanity)
2. CourseTree edit persistence (syncTree diff logic, race conditions, edge cases)
3. Mutations and revalidation (call sites, server-only guard, stale imports)
4. Component props propagation (new props, route correctness, usage completeness)
5. Type safety and schema alignment (type assertions, Course/CourseState consistency)

**Raw findings: 28 total.** After deduplication: 19 candidates. After manual verification: **18 confirmed, 1 false positive removed.**

### False Positive Removed

**~~C3: Lessons in new modules not reordered after creation~~** — The `for` loop in `syncTree` iterates `mod.lessons` in visual order (CourseTree state reflects drag reordering). Each sequential `await createLesson()` calls `.append()`, so Sanity receives references in visual order. No separate `reorderLessons` call is needed for new modules.

---

## CRITICAL — Data Loss or Corruption

### ~~C1: `initialRef` never updated after save~~ ✅ FIXED

**Commit:** `7093d36`

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`

**Resolution:** Added `initialRef.current = course` at the end of `handleSave`, after `syncTree` and `updateCourse` complete.

---

### ~~C2: `reorderLessons` excludes newly-created lessons~~ ✅ FIXED

**Commit:** `7093d36`

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`

**Resolution:** `allLessonIds` maps through `newLessonIdMap` to include real `_id`s from `createLesson` calls. The full ordered list (existing + new) is sent to `reorderLessons`.

---

### ~~C3: All non-MCQ `responseConfig` silently dropped on save~~ ✅ FIXED

**Commit:** `7093d36`

**Files:** `lesson-editor-client.tsx`, `content-block.ts`, `page.tsx` (lesson edit), `queries.ts`

**Resolution:** Added `responseConfigJson` text field to Sanity `contentBlock` schema. `blocksToSanity` serializes non-MCQ configs via `JSON.stringify(cfg)`. `mapBlock` parses them back via `JSON.parse(raw.responseConfigJson)`. `adminLessonByIdQuery` fetches the new field.

---

### ~~C4: `multi_select_mcq` loses all but first correct answer~~ ✅ FIXED

**Commit:** `7093d36`

**Files:** `lesson-editor-client.tsx`, `content-block.ts`, `page.tsx` (lesson edit)

**Resolution:** Added `correctAnswers` (number array) field to Sanity schema. `blocksToSanity` writes all correct indices for multi-select. `mapBlock` reconstructs `is_correct` on multiple options using a `Set` from `correctAnswers`.

---

### ~~C5: Student quiz GROQ emits `options` as `string[]`~~ ✅ FIXED

**Commit:** `7093d36`

**Files:** `queries.ts`, `lib/quiz-transform.ts`

**Resolution:** Student GROQ now returns `correctAnswer`, `correctAnswers`, and `responseConfigJson` inside the `responseConfig` object. `quiz-transform.ts` reconstructs `McqConfig`-shaped objects from `string[]` options + correct indices, and parses `responseConfigJson` for non-MCQ types.

---

## HIGH — Broken UX or Silent Failures

### ~~H1: `writeClient`/`previewClient` still exported from `client.ts`~~ ✅ FIXED

**Commit:** `7093d36`

**Files:** `sanity/client.ts`, `sanity/server.ts`

**Resolution:** Moved `writeClient`/`previewClient` declarations into `server.ts` (with `import "server-only"` guard). Removed from `client.ts`. Only `client` and `safeFetch` remain in `client.ts`.

---

### ~~H2: `LessonViewClient` hardcodes student route for prev/next navigation~~ ✅ FIXED

**Commit:** `7093d36`

**Files:** `lesson-view-client.tsx`, preview lesson `page.tsx`

**Resolution:** Added optional `lessonBasePath` prop to `LessonViewClient`. Preview lesson page passes `lessonBasePath={`/admin/courses/${courseId}/preview/lessons`}`. Student page uses default (`/courses/${courseSlug}/lessons`).

---

### ~~H3: `CourseTree` used without `courseId` in `new-course-client.tsx`~~ ✅ FIXED

**Commit:** `7093d36`

**File:** `lesson-node.tsx`

**Resolution:** Wrapped edit `Button` in `{courseId && (...)}` guard. When `courseId` is falsy (new-course page, showcase), the edit button is hidden. Delete button remains visible.

---

### ~~H4: `handlePublishToggle` reads stale `initialCourse.isPublished`~~ ✅ FIXED

**Commit:** `7093d36`

**File:** `edit-course-client.tsx`

**Resolution:** Replaced all `initialCourse.isPublished` references with `course.isPublished` (state). Added optimistic `setCourse` updates after publish/unpublish mutations.

---

### ~~H5: Language select emits `"pt"` instead of `"pt-BR"`~~ ✅ FIXED

**Commit:** `7093d36`

**File:** `course-tree.tsx`

**Resolution:** Changed `<SelectItem value="pt">` to `<SelectItem value="pt-BR">`.

---

### ~~H6: `testCases`/`validationRules` written without Sanity `_key`~~ ✅ FIXED

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/lesson-editor-client.tsx`, lines 41–42

**Verified:** `base.testCases = block.data.testCases` — objects go to Sanity without `_key`. The schema defines these as `array of [{ type: "object", fields: [...] }]`. Sanity Content Lake requires `_key` on every object array item.

**Fix:** Map both arrays to add `_key`:

```ts
base.testCases = (block.data.testCases ?? []).map((tc, i) => ({ _key: `tc-${i}`, ...tc }));
base.validationRules = (block.data.validationRules ?? []).map((vr, i) => ({ _key: `vr-${i}`, ...vr }));
```

---

### ~~H7: `validationRules` absent from student-facing GROQ~~ ✅ FIXED

**File:** `app/src/sanity/queries.ts` (lessonBySlugQuery, code_challenge projection, lines 83–90)

**Verified:** The `code_challenge` block projects `testCases`, `hints`, `maxAttempts` but NOT `validationRules`. The field exists in the Sanity schema and is written by `blocksToSanity`, but students never receive it. Structural validation via `structural-validator.ts` is always disabled on the student path.

**Fix:** Add `"validationRules": coalesce(validationRules, [])` to the `code_challenge` projection.

---

### ~~H8: `updateLessonContentBlocks` never revalidates student lesson page~~ ✅ FIXED

**File:** `app/src/sanity/mutations.ts`, lines 205–208

**Verified:** Revalidates `admin/courses/${courseId}/edit` and `admin/courses/${courseId}/lessons/${lessonId}/edit`. No student path like `/courses/...`. Published lessons serve stale cached content after admin edits.

**Fix:** Add `revalidatePath("/courses", "layout")` to `updateLessonContentBlocks`.

---

## MEDIUM — Correctness Gaps and Fragile Patterns

### M1: `difficulty` field not editable after course creation

**Files:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`, `app/src/components/admin/course-builder/course-tree.tsx`

**Verified:** No difficulty selector exists in `CourseTree`. The value is loaded from Sanity, preserved through state, and written back unchanged. An admin has no way to change course difficulty after creation.

**Fix:** Add a difficulty selector to `CourseTree` (alongside the language/tags fields) or expose it separately in `EditCourseClient`.

---

### M2: `Course` type lacks `isPublished`/`difficulty`

**Files:** `app/src/types/course.ts`, `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`

**Verified:** `Course` interface has no `isPublished` or `difficulty`. They're bolted on via intersection type `Course & { isPublished: boolean; difficulty?: string }` with manual re-spreading in `onChange` (lines 201–206). If any consumer of `CourseTree` forgets the merge pattern, fields are silently dropped.

**Fix:** Add `isPublished` and `difficulty` as optional fields on `Course` type, or create a dedicated `AdminCourse` type.

---

### M3: `reorderModules` short-circuit check broken

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`, lines 117–125

**Verified:** `finalModuleIds` includes new modules (resolved to real IDs); `initialOrder` only includes surviving initial modules. Arrays always differ in length when new modules exist, so `reorderModules` fires unconditionally. The call itself is correct (needed to position new modules properly), but the optimization intent of the check is broken.

**Fix:** Remove the equality check — always call `reorderModules` when there are any modules. Or simplify to only check when no modules were added or removed.

---

### M4: `QuestionType` union includes 4 dead types

**File:** `app/src/types/questions.ts`, lines 3–19

**Verified:** `theory`, `short_answer`, `essay`, `group` are in the union. None have builders in `quiz-block-editor.tsx`, no Sanity schema fields support them, and `ResponseConfigEditor` returns `null` for them. `question-type-badge.tsx` still renders labels for them.

**Fix:** Either remove from the union or add explicit "unsupported type" UI in `ResponseConfigEditor`'s default branch.

---

### M5: `SanityCourse` omits `publishedAt`

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/page.tsx`, lines 11–38

**Verified:** `adminCourseByIdQuery` returns `publishedAt` (queries.ts line 148) but `SanityCourse` interface doesn't declare it. The value is silently discarded by TypeScript structural typing.

**Fix:** Add `publishedAt: string | null` to `SanityCourse` and thread through if needed.

---

## Prioritized Fix Order

### ~~Phase 1 — Data Integrity (C1–C5)~~ ✅ ALL FIXED

All 5 critical issues resolved in commit `7093d36`.

### ~~Phase 2 — Broken UX (H1–H8)~~ ✅ ALL FIXED

1. ~~**H1:** Move write/preview clients into `server.ts`~~ ✅
2. ~~**H2:** Add `lessonBasePath` to `LessonViewClient`~~ ✅
3. ~~**H3:** Hide edit button when `courseId` is falsy~~ ✅
4. ~~**H4:** Use `course.isPublished` state instead of `initialCourse` prop~~ ✅
5. ~~**H5:** Change `"pt"` → `"pt-BR"`~~ ✅
6. ~~**H6:** Add `_key` to testCase/validationRule objects~~ ✅
7. ~~**H7:** Add `validationRules` to student GROQ~~ ✅
8. ~~**H8:** Revalidate student lesson pages on content save~~ ✅

### Phase 3 — Polish (M1–M5) — OPEN

Can ship without, but should fix soon.

1. **M1:** Add difficulty selector to course edit UI
2. **M2:** Add `isPublished`/`difficulty` to `Course` type
3. **M3:** Fix or remove broken reorder optimization
4. **M4:** Clean up dead `QuestionType` variants
5. **M5:** Add `publishedAt` to `SanityCourse`
