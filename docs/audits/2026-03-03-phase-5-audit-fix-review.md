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

### C1: `initialRef` never updated after save

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`, line 37

**Verified:** `const initialRef = useRef(initialCourse)` — no reassignment anywhere in the file. After `router.refresh()`, `useRef` value persists across re-renders. Second save diffs stale baseline, causing:
- Attempts to delete already-deleted modules (404/silent error)
- Re-creation of modules/lessons added in the first save (duplicates)
- Unnecessary reorder calls

**Fix:** Set `initialRef.current = course` at the end of `handleSave`, after `syncTree` and `updateCourse` complete.

---

### C2: `reorderLessons` excludes newly-created lessons

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`, lines 94–99

**Verified:** Line 95 `.filter((l) => initialLessonIds.has(l.id))` explicitly excludes new lessons. `reorderLessons` (mutations.ts:233) calls `.set({ lessons: refs })` which replaces the entire array, wiping newly-appended lessons. Triggered when user reorders existing lessons AND adds new ones in the same module in a single save.

**Fix:** Collect real `_id`s from all `createLesson` calls within the module, then build the full ordered list before calling `reorderLessons`:

```ts
const newLessonIdMap = new Map<string, string>();
for (const lesson of mod.lessons) {
  if (!initialLessonIds.has(lesson.id)) {
    const result = await createLesson(realModuleId, { ... }, courseId);
    newLessonIdMap.set(lesson.id, result._id);
  }
}
const allLessonIds = mod.lessons.map((l) => newLessonIdMap.get(l.id) ?? l.id);
const initialOrder = initialMod.lessons.map((l) => l.id);
if (JSON.stringify(allLessonIds) !== JSON.stringify(initialOrder)) {
  await reorderLessons(realModuleId, allLessonIds, courseId);
}
```

---

### C3: All non-MCQ `responseConfig` silently dropped on save

**Files:** `app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/lesson-editor-client.tsx` (blocksToSanity, lines 48–54), `app/src/sanity/schemas/content-block.ts`

**Verified:** The `if (cfg && Array.isArray(cfg.options))` guard on line 49 skips all non-MCQ types. `TrueFalseConfig` has `correct_answer`, `FillBlankConfig` has `blanks`, `MatchingConfig` has `pairs`, etc. — none have an `options` array. No Sanity schema field exists to store serialized non-MCQ configs. Additionally, `mapBlock` (page.tsx lines 109–120) only reconstructs `responseConfig` for MCQ/multi-select; all other types always load as `null`.

**Fix:** Add a `responseConfigJson` text field to the Sanity `contentBlock` schema. In `blocksToSanity`, serialize non-MCQ configs as `JSON.stringify(cfg)`. In `mapBlock`, parse it back with `JSON.parse(raw.responseConfigJson)`. Update `adminLessonByIdQuery` to fetch the new field.

---

### C4: `multi_select_mcq` loses all but first correct answer

**Files:** `lesson-editor-client.tsx` (blocksToSanity, line 52), `page.tsx` (mapBlock, line 117)

**Verified:** `blocksToSanity` line 52: `opts.findIndex((o) => o.is_correct)` returns only the first matching index. Sanity `correctAnswer` is a single `number`. `mapBlock` line 117: `raw.correctAnswer === i` — only one index matches. For a multi-select question with correct answers at indices 1 and 3, index 3 is permanently lost after one save/load cycle.

**Fix:** Add a `correctAnswers` (number array) field to the Sanity schema. Write all correct indices for multi-select. Read them back in `mapBlock` to set `is_correct` on multiple options.

---

### C5: Student quiz GROQ emits `options` as `string[]`

**File:** `app/src/sanity/queries.ts` (lessonBySlugQuery, lines 96–99)

**Verified:** `"options": coalesce(quizOptions, [])` returns `string[]` since `quizOptions` is `string[]` in Sanity. `McqConfig.options` expects `{ label: string; text: string; is_correct: boolean }[]`. Any student renderer calling `option.text` or `option.is_correct` gets `undefined`.

**Fix:** Either reconstruct `McqConfig`-shaped objects in the GROQ projection, or define a student-facing response type and map it in the quiz renderer component.

---

## HIGH — Broken UX or Silent Failures

### H1: `writeClient`/`previewClient` still exported from `client.ts`

**Files:** `app/src/sanity/client.ts` (lines 14–29), `app/src/sanity/server.ts`

**Verified:** `client.ts` has `export const writeClient` and `export const previewClient` with no `server-only` guard. `server.ts` re-exports them with `import "server-only"` but the originals are directly importable via `@/sanity/client`.

**Fix:** Move `writeClient`/`previewClient` declarations into `server.ts`. Remove them from `client.ts`. Keep only `client`, `safeFetch` in `client.ts`.

---

### H2: `LessonViewClient` hardcodes student route for prev/next navigation

**Files:** `app/src/app/[locale]/(main)/courses/[slug]/lessons/[lessonSlug]/lesson-view-client.tsx` (line 31), `app/src/app/[locale]/(admin)/admin/courses/[id]/preview/lessons/[lessonSlug]/page.tsx`

**Verified:** Line 31: `router.push(`/courses/${courseSlug}/lessons/${lessonSlug}`)` — no `lessonBasePath` prop exists. The preview lesson page reuses this component, so prev/next navigation sends users to the public student route.

**Fix:** Add optional `lessonBasePath` prop to `LessonViewClient` (matching the pattern already used in `CourseDetailClient`). Pass it from the preview lesson page.

---

### H3: `CourseTree` used without `courseId` in `new-course-client.tsx`

**File:** `app/src/app/[locale]/(admin)/admin/courses/new/new-course-client.tsx` (line 82)

**Verified:** `<CourseTree course={course} onChange={setCourse} />` — no `courseId` prop. `EMPTY_COURSE` has `id: ""` (line 13). `CourseTree` falls back to `courseId ?? course.id` = `""`. `LessonNode` renders `href="/admin/courses//lessons/..."` (broken URL). Also affects `showcase/page.tsx` line 2248 (same pattern).

**Fix:** Hide the edit button in `LessonNode` when `courseId` is falsy:

```tsx
{courseId && (
  <Button type="button" variant="ghost" size="icon" ... asChild>
    <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}>...</Link>
  </Button>
)}
```

---

### H4: `handlePublishToggle` reads stale `initialCourse.isPublished`

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`, lines 144, 168, 185, 190

**Verified:** Toggle logic (line 144) and badge rendering (lines 168, 185, 190) all read `initialCourse.isPublished`. `router.refresh()` on line 149 is not awaited — `isPending` can go false before the refresh re-render delivers updated props. Badge shows stale state during the gap.

**Fix:** Use `course.isPublished` (state) for all display and toggle logic. Update state optimistically after the mutation completes:

```ts
if (course.isPublished) {
  await unpublishCourse(courseId);
  setCourse((prev) => ({ ...prev, isPublished: false }));
} else {
  await publishCourse(courseId);
  setCourse((prev) => ({ ...prev, isPublished: true }));
}
```

---

### H5: Language select emits `"pt"` instead of `"pt-BR"`

**File:** `app/src/components/admin/course-builder/course-tree.tsx`, line 144

**Verified:** `<SelectItem value="pt">Portuguese</SelectItem>`. `Course["language"]` is `"pt-BR" | "es" | "en"`. The `as Course["language"]` cast on line 137 hides the mismatch. `"pt"` gets saved to Sanity, mismatching the type and breaking i18n routing.

**Fix:** Change to `<SelectItem value="pt-BR">Portuguese</SelectItem>`.

---

### H6: `testCases`/`validationRules` written without Sanity `_key`

**File:** `app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/lesson-editor-client.tsx`, lines 41–42

**Verified:** `base.testCases = block.data.testCases` — objects go to Sanity without `_key`. The schema defines these as `array of [{ type: "object", fields: [...] }]`. Sanity Content Lake requires `_key` on every object array item.

**Fix:** Map both arrays to add `_key`:

```ts
base.testCases = (block.data.testCases ?? []).map((tc, i) => ({ _key: `tc-${i}`, ...tc }));
base.validationRules = (block.data.validationRules ?? []).map((vr, i) => ({ _key: `vr-${i}`, ...vr }));
```

---

### H7: `validationRules` absent from student-facing GROQ

**File:** `app/src/sanity/queries.ts` (lessonBySlugQuery, code_challenge projection, lines 83–90)

**Verified:** The `code_challenge` block projects `testCases`, `hints`, `maxAttempts` but NOT `validationRules`. The field exists in the Sanity schema and is written by `blocksToSanity`, but students never receive it. Structural validation via `structural-validator.ts` is always disabled on the student path.

**Fix:** Add `"validationRules": coalesce(validationRules, [])` to the `code_challenge` projection.

---

### H8: `updateLessonContentBlocks` never revalidates student lesson page

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

### Phase 1 — Data Integrity (C1–C5)

Fix before any manual testing.

1. **C1:** Update `initialRef.current` after successful save
2. **C2:** Collect real `_id`s from `createLesson` returns, build full ordered list for `reorderLessons`
3. **C3+C4:** Add `responseConfigJson` + `correctAnswers` fields to Sanity schema; update `blocksToSanity` and `mapBlock`
4. **C5:** Fix student GROQ quiz projection or add mapping in renderer

### Phase 2 — Broken UX (H1–H8)

Fix before deploying admin.

1. **H1:** Move write/preview clients into `server.ts`
2. **H2:** Add `lessonBasePath` to `LessonViewClient`
3. **H3:** Hide edit button when `courseId` is falsy
4. **H4:** Use `course.isPublished` state instead of `initialCourse` prop
5. **H5:** Change `"pt"` → `"pt-BR"`
6. **H6:** Add `_key` to testCase/validationRule objects
7. **H7:** Add `validationRules` to student GROQ
8. **H8:** Revalidate student lesson pages on content save

### Phase 3 — Polish (M1–M5)

Can ship without, but should fix soon.

1. **M1:** Add difficulty selector to course edit UI
2. **M2:** Add `isPublished`/`difficulty` to `Course` type
3. **M3:** Fix or remove broken reorder optimization
4. **M4:** Clean up dead `QuestionType` variants
5. **M5:** Add `publishedAt` to `SanityCourse`
