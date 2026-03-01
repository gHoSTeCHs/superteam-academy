# LMS Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all LMS UI components (question builders, rich text editor, code editor, video player, course builder, content editor) and showcase them on `/showcase` before app integration.

**Architecture:** Port 12 question type builders and TiptapEditor/Renderer from Skoolpad (adapting Inertia→Next.js router, Skoolpad types→local types). Build Monaco code editor wrapper, video checkpoint player, content block editor, and course builder tree from scratch. All components showcase on `/showcase` first.

**Tech Stack:** Next.js 16, React 19.2, TypeScript (strict), Tailwind CSS 4, Radix UI, Tiptap, Monaco Editor, @dnd-kit (drag-and-drop), react-player (video)

---

## Phase 1: Foundation Types & Dependencies

### Task 1: Install Tiptap, Monaco, dnd-kit, and react-player

**Files:**
- Modify: `package.json`

**Step 1: Install Tiptap dependencies**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/core @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-code-block-lowlight @tiptap/extension-placeholder @tiptap/extension-mathematics lowlight highlight.js katex
```

**Step 2: Install Monaco Editor**

```bash
npm install @monaco-editor/react monaco-editor
```

**Step 3: Install dnd-kit for drag-and-drop**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 4: Install react-player for video**

```bash
npm install react-player
```

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Tiptap, Monaco, dnd-kit, and react-player deps"
```

---

### Task 2: Create question type definitions

**Files:**
- Create: `src/types/questions.ts`
- Create: `src/types/tiptap.ts`

**Step 1: Create Tiptap JSON type**

Create `src/types/tiptap.ts`:
```ts
export interface TiptapJSON {
  type: string;
  content?: TiptapJSON[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}
```

Note: Skoolpad uses `Record<string, any>` — we use a proper typed interface since we enforce no `any`.

**Step 2: Create question types**

Create `src/types/questions.ts` — port from `C:\Users\hp\Herd\skoolpad\resources\js\types\questions.ts`.

Include these types (all are backend-agnostic):
- `QuestionType` (union of 16 string literals)
- `ContextType` (union of 9 string literals)
- All 12 config interfaces: `McqConfig`, `MultiSelectMcqConfig`, `TrueFalseConfig`, `FillBlankConfig`, `ClozeConfig`, `MatchingConfig`, `MatrixMatchingConfig`, `OrderingConfig`, `DiagramLabelConfig`, `CalculationConfig`, `NumericEntryConfig`, `AssertionReasonConfig`
- `ResponseConfig` (union type)
- `QuestionContextData`, `QuestionNode`, `QuestionSection`

Do NOT include Skoolpad-specific types: `QuestionFormData`, `QuestionData`, `QuestionEnumOptions`, `QuestionFilters`, `QuestionListItem`, `TopicLink`, `InstitutionOption`, `CourseOption`, `TopicSearchResult`, `AnswerDepthData`. These are tightly coupled to Skoolpad's Laravel backend.

Remove the import of `BaseFilters` from `@/hooks/use-filter-handlers` — that doesn't exist in our project.

**Step 3: Create content block types**

Add to `src/types/content.ts`:
```ts
import type { TiptapJSON } from './tiptap';
import type { ResponseConfig, QuestionType } from './questions';

export type ContentBlockType =
  | 'text' | 'code_example' | 'code_challenge'
  | 'quiz' | 'callout' | 'image' | 'video_embed';

export type CalloutType = 'info' | 'warning' | 'tip';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  sortOrder: number;
  data: ContentBlockData;
}

export type ContentBlockData =
  | TextBlockData
  | CodeExampleData
  | CodeChallengeData
  | QuizBlockData
  | CalloutBlockData
  | ImageBlockData
  | VideoEmbedData;

export interface TextBlockData {
  type: 'text';
  content: TiptapJSON | null;
}

export interface CodeExampleData {
  type: 'code_example';
  language: string;
  code: string;
  filename?: string;
}

export interface CodeChallengeData {
  type: 'code_challenge';
  language: 'typescript' | 'rust';
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  validationRules?: ValidationRule[];
  hints: string[];
  maxAttempts?: number;
}

export interface TestCase {
  name: string;
  input?: string;
  expectedOutput?: string;
  assertionCode?: string;
}

export interface ValidationRule {
  pattern: string;
  message: string;
}

export interface QuizBlockData {
  type: 'quiz';
  questionType: QuestionType;
  content: string;
  responseConfig: ResponseConfig;
}

export interface CalloutBlockData {
  type: 'callout';
  calloutType: CalloutType;
  title?: string;
  content: string;
}

export interface ImageBlockData {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface VideoEmbedData {
  type: 'video_embed';
  url: string;
  title?: string;
}
```

**Step 4: Create course/module types**

Add to `src/types/course.ts`:
```ts
export type ModuleType = 'text' | 'video' | 'assessment';

export interface Course {
  id: string;
  title: string;
  description: string;
  language: 'pt' | 'es' | 'en';
  thumbnail?: string;
  tags: string[];
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  sortOrder: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sortOrder: number;
}
```

**Step 5: Create video checkpoint types**

Add to `src/types/video.ts`:
```ts
import type { CodeChallengeData } from './content';
import type { QuestionType, ResponseConfig } from './questions';

export interface VideoCheckpoint {
  id: string;
  timestamp: number;
  type: 'quiz' | 'code_challenge';
  questionData?: CheckpointQuestionData;
  challengeData?: CodeChallengeData;
  maxAttempts: number;
  hint?: string;
  skippable: boolean;
  xpReward: number;
}

export interface CheckpointQuestionData {
  questionType: QuestionType;
  content: string;
  responseConfig: ResponseConfig;
}
```

**Step 6: Create code runner interface**

Add to `src/types/code-runner.ts`:
```ts
export interface RunResult {
  passed: boolean;
  results: TestResult[];
  error?: string;
  executionTimeMs?: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface CodeRunner {
  run(code: string, language: string, testCases: TestCaseInput[]): Promise<RunResult>;
  dispose?(): void;
}

export interface TestCaseInput {
  name: string;
  input?: string;
  expectedOutput?: string;
  assertionCode?: string;
}
```

**Step 7: Commit**

```bash
git add src/types/
git commit -m "feat: add question, content, course, video, and code runner type definitions"
```

---

## Phase 2: Port Question Type Builders from Skoolpad

### Task 3: Add missing UI primitives needed by builders

The question builders need `Textarea`, `Select`, `Label`, `FormField`, and `Dialog` components that we don't have yet.

**Files:**
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/tooltip.tsx`

**Step 1:** Create each using Radix UI primitives (same pattern as existing Switch/Checkbox). All styled with CSS variables from our theme.

- `Textarea`: simple styled `<textarea>` (like Input but multiline)
- `Label`: wrap `@radix-ui/react-label`
- `Select`: wrap `@radix-ui/react-select` with trigger, content, item, group
- `Dialog`: use Radix Dialog (overlay, content, header, footer, close)
- `DropdownMenu`: use Radix — but we don't have it installed. Install `@radix-ui/react-dropdown-menu` and `@radix-ui/react-dialog` first
- `Separator`: wrap `@radix-ui/react-separator`
- `Tooltip`: wrap `@radix-ui/react-tooltip`

**Step 2:** Install missing Radix primitives

```bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog
```

**Step 3: Commit**

```bash
git add src/components/ui/ package.json package-lock.json
git commit -m "feat: add Textarea, Label, Select, Dialog, DropdownMenu, Separator, Tooltip UI components"
```

---

### Task 4: Port all 12 question type builders

**Files:**
- Create: `src/components/admin/question-builders/mcq-builder.tsx`
- Create: `src/components/admin/question-builders/multi-select-mcq-builder.tsx`
- Create: `src/components/admin/question-builders/true-false-builder.tsx`
- Create: `src/components/admin/question-builders/fill-blank-builder.tsx`
- Create: `src/components/admin/question-builders/cloze-builder.tsx`
- Create: `src/components/admin/question-builders/matching-builder.tsx`
- Create: `src/components/admin/question-builders/matrix-matching-builder.tsx`
- Create: `src/components/admin/question-builders/ordering-builder.tsx`
- Create: `src/components/admin/question-builders/diagram-label-builder.tsx`
- Create: `src/components/admin/question-builders/calculation-builder.tsx`
- Create: `src/components/admin/question-builders/numeric-entry-builder.tsx`
- Create: `src/components/admin/question-builders/assertion-reason-builder.tsx`
- Create: `src/components/admin/question-builders/index.ts` (barrel export)

**Porting instructions for each builder:**

1. Copy the component from `C:\Users\hp\Herd\skoolpad\resources\js\components\admin\question-builder\type-specific\`
2. Update imports:
   - `@/types/questions` → `@/types/questions` (same path, but use our local types)
   - `@/components/ui/*` → `@/components/ui/*` (same, our local UI)
   - `@/lib/utils` → `@/lib/utils` (same)
   - `lucide-react` → install if needed: `npm install lucide-react`
3. Remove any `// single line comments` — replace with JSDoc if needed
4. Ensure no `any` types — the config types are already typed
5. Each builder is a pure controlled component: `{ value: Config | null; onChange: (config: Config) => void }`

All 12 builders are 100% portable — no Inertia/Laravel dependencies.

Also install lucide-react for icons:
```bash
npm install lucide-react
```

**Step: Commit**

```bash
git add src/components/admin/question-builders/ package.json package-lock.json
git commit -m "feat: port 12 question type builders from Skoolpad"
```

---

### Task 5: Port QuestionRenderer and supporting components

**Files:**
- Create: `src/components/question-renderer.tsx`
- Create: `src/components/context-card.tsx`
- Create: `src/components/question-type-badge.tsx`
- Create: `src/components/difficulty-badge.tsx`
- Create: `src/components/block-type-icon.tsx`

**Porting instructions:**

1. Port `QuestionRenderer` from `C:\Users\hp\Herd\skoolpad\resources\js\components\skoolpad\questions\question-renderer.tsx`
   - Replace `SpBadge` imports with our `Badge` component
   - Replace CSS variable references like `var(--font-body)` (these match our theme)
   - Replace `var(--bg-raised)` → `bg-bg-raised` Tailwind class
   - Replace `var(--opt-correct-border)` etc. with `[var(--opt-correct-border)]` Tailwind arbitrary values

2. Port `ContextCard` from `C:\Users\hp\Herd\skoolpad\resources\js\components\skoolpad\questions\context-card.tsx`
   - Same CSS variable adaptations

3. Port `QuestionTypeBadge` from `C:\Users\hp\Herd\skoolpad\resources\js\components\skoolpad\questions\question-type-badge.tsx`

4. Port `DifficultyBadge` from `C:\Users\hp\Herd\skoolpad\resources\js\components\skoolpad\block-tree\difficulty-badge.tsx`

5. Port `BlockTypeIcon` from `C:\Users\hp\Herd\skoolpad\resources\js\components\skoolpad\block-tree\block-type-icon.tsx`

**Step: Commit**

```bash
git add src/components/
git commit -m "feat: port QuestionRenderer, ContextCard, and display components from Skoolpad"
```

---

## Phase 3: Rich Text Editor

### Task 6: Port TiptapEditor and TiptapRenderer

**Files:**
- Create: `src/components/tiptap-editor.tsx`
- Create: `src/components/tiptap-renderer.tsx`
- Create: `src/styles/tiptap.css`

**Porting instructions:**

1. Port `TiptapEditor` from `C:\Users\hp\Herd\skoolpad\resources\js\components\shared\tiptap-editor.tsx`
   - Remove `i18next` translation calls — hardcode English strings (we'll add i18n later)
   - Replace `@/components/ui/*` imports with our local UI
   - The editor uses Dialog for link/image insertion — use our Dialog component
   - Keep all Tiptap extensions exactly as they are
   - The `onImageUpload` prop is optional — for now images can be URL-only

2. Port `TiptapRenderer` from `C:\Users\hp\Herd\skoolpad\resources\js\components\shared\tiptap-renderer.tsx`
   - Same import adaptations
   - Note: uses `generateHTML` from `@tiptap/core` — must register same extensions

3. Create `src/styles/tiptap.css` for editor-specific styles (code block syntax highlighting, table borders, etc.). Port from Skoolpad's tiptap styles or create fresh with our theme colors.

4. Import `tiptap.css` in `src/app/globals.css` or in the editor component itself.

**Step: Commit**

```bash
git add src/components/tiptap-editor.tsx src/components/tiptap-renderer.tsx src/styles/
git commit -m "feat: port TiptapEditor and TiptapRenderer with full extension support"
```

---

## Phase 4: Code Editor & Challenge System

### Task 7: Create Monaco Editor wrapper

**Files:**
- Create: `src/components/code-editor.tsx`

Build a themed Monaco Editor wrapper:
- Props: `{ value: string; onChange: (value: string) => void; language: string; readOnly?: boolean; height?: string; className?: string }`
- Use `@monaco-editor/react` — the `Editor` component
- Theme: Create a custom Monaco theme matching our design system (dark green accents on dark background, cream-on-dark for dark mode)
- Language selector dropdown (TypeScript, Rust, TOML, JSON, JavaScript)
- Line numbers, minimap off, word wrap on
- Must be a `'use client'` component

**Step: Commit**

```bash
git add src/components/code-editor.tsx
git commit -m "feat: add themed Monaco Editor wrapper component"
```

---

### Task 8: Create CodeChallenge component

**Files:**
- Create: `src/components/code-challenge.tsx`
- Create: `src/lib/code-runner/index.ts`
- Create: `src/lib/code-runner/typescript-runner.ts`
- Create: `src/lib/code-runner/structural-validator.ts`

**Step 1:** Create the `CodeRunner` interface implementation.

`src/lib/code-runner/typescript-runner.ts`:
- Creates a sandboxed iframe
- Injects the student's code + test assertion code
- Captures console output and assertion results via `postMessage`
- Returns `RunResult` with per-test pass/fail
- Timeout handling (5 seconds max)

`src/lib/code-runner/structural-validator.ts`:
- For Rust code: runs regex patterns against the code
- Each `ValidationRule` has a `pattern` (regex) and `message`
- Returns pass if all patterns match

`src/lib/code-runner/index.ts`:
- Factory function: `createCodeRunner(language: string): CodeRunner`
- Returns `TypeScriptRunner` for TS/JS, `StructuralValidator` for Rust

**Step 2:** Create the `CodeChallenge` component.

`src/components/code-challenge.tsx`:
- Props: `{ challenge: CodeChallengeData; onComplete?: (passed: boolean) => void }`
- Layout: Monaco editor (left/top) + test results panel (right/bottom)
- "Run" button that executes code through the runner
- Test results: list of test names with pass/fail icons and messages
- Hint system: after N failed attempts, show hints progressively
- "Reset" button to restore starter code
- "Show Solution" button (after max attempts)
- All styled with CSS variables

**Step: Commit**

```bash
git add src/components/code-challenge.tsx src/lib/code-runner/
git commit -m "feat: add CodeChallenge component with sandboxed TypeScript runner and Rust structural validator"
```

---

## Phase 5: Video Player with Checkpoints

### Task 9: Create VideoPlayer with checkpoint system

**Files:**
- Create: `src/components/video-player.tsx`
- Create: `src/components/video-checkpoint-overlay.tsx`

**Step 1:** Create `VideoPlayer` component.

`src/components/video-player.tsx`:
- Props: `{ url: string; checkpoints: VideoCheckpoint[]; onCheckpointComplete?: (id: string, passed: boolean) => void }`
- Uses `react-player` under the hood but wrapped in our styled container
- Custom controls bar (play/pause, progress bar, time display, volume, fullscreen)
- Progress bar shows checkpoint markers as colored dots at their timestamps
- On reaching a checkpoint timestamp: pause video, show overlay
- Track completed checkpoints in local state

**Step 2:** Create `VideoCheckpointOverlay` component.

`src/components/video-checkpoint-overlay.tsx`:
- Props: `{ checkpoint: VideoCheckpoint; onComplete: (passed: boolean) => void; onSkip: () => void }`
- Renders as a modal/overlay on top of the paused video
- If checkpoint type is `quiz`: render the question using QuestionRenderer with interactive answer submission
- If checkpoint type is `code_challenge`: render CodeChallenge component
- Attempt counter display
- After `maxAttempts` failed: show hint if available
- "Skip" button (if `skippable` is true)
- Styled with our theme (semi-transparent background, card overlay)

**Step: Commit**

```bash
git add src/components/video-player.tsx src/components/video-checkpoint-overlay.tsx
git commit -m "feat: add VideoPlayer with interactive checkpoint overlay system"
```

---

## Phase 6: Admin Components

### Task 10: Port admin utility components

**Files:**
- Create: `src/components/admin/data-table.tsx`
- Create: `src/components/admin/pagination.tsx`
- Create: `src/components/admin/page-header.tsx`
- Create: `src/components/admin/search-input.tsx`
- Create: `src/components/admin/status-badge.tsx`
- Create: `src/components/admin/row-actions.tsx`
- Create: `src/components/admin/empty-state.tsx`
- Create: `src/components/admin/stat-card.tsx`

**Porting instructions — Inertia → Next.js adaptations:**

1. `DataTable`: Replace `router` from `@inertiajs/react` with Next.js `useRouter` + `useSearchParams`. Sort navigation: `router.push(url)` instead of `router.get()`. Replace Inertia `Link` with Next.js `Link`.

2. `Pagination`: Replace Inertia `Link` with Next.js `Link`. URL construction stays the same (query param manipulation).

3. `PageHeader`: Replace Inertia `Link` with Next.js `Link`.

4. `SearchInput`: Replace `router.get()` with `useRouter().push()`. Keep the debounce pattern. Use `useSearchParams` to read current params.

5. `RowActions`: Replace Inertia `Link` with Next.js `Link`.

6. `StatusBadge`, `EmptyState`, `StatCard`: No Inertia dependencies — direct port with CSS variable updates.

**Step: Commit**

```bash
git add src/components/admin/
git commit -m "feat: port admin utility components (DataTable, Pagination, PageHeader, etc.) adapted for Next.js"
```

---

### Task 11: Build Content Block Editor

**Files:**
- Create: `src/components/admin/content-editor/block-list.tsx`
- Create: `src/components/admin/content-editor/block-editor.tsx`
- Create: `src/components/admin/content-editor/block-type-picker.tsx`
- Create: `src/components/admin/content-editor/editors/text-block-editor.tsx`
- Create: `src/components/admin/content-editor/editors/code-example-editor.tsx`
- Create: `src/components/admin/content-editor/editors/code-challenge-editor.tsx`
- Create: `src/components/admin/content-editor/editors/quiz-block-editor.tsx`
- Create: `src/components/admin/content-editor/editors/callout-block-editor.tsx`
- Create: `src/components/admin/content-editor/editors/image-block-editor.tsx`
- Create: `src/components/admin/content-editor/editors/video-embed-editor.tsx`
- Create: `src/components/admin/content-editor/index.ts`

**Component descriptions:**

- `BlockList`: The main content editor. Renders a sortable list of blocks using `@dnd-kit/sortable`. "Add block" button opens `BlockTypePicker`. Each block renders its type-specific editor via `BlockEditor`.

- `BlockEditor`: Switch component that renders the correct editor based on `block.type`.

- `BlockTypePicker`: Dropdown/popover showing the 7 block types with icons and descriptions. Clicking one adds a new block of that type with default data.

- Type-specific editors:
  - `TextBlockEditor`: Renders TiptapEditor
  - `CodeExampleEditor`: Monaco editor + language selector + optional filename input
  - `CodeChallengeEditor`: Two Monaco editors (starter + solution) + test case editor (list of name/assertion pairs) + hints editor (list of strings)
  - `QuizBlockEditor`: Question type selector dropdown + the corresponding question type builder
  - `CalloutBlockEditor`: Type selector (info/warning/tip) + optional title + text content
  - `ImageBlockEditor`: URL input + alt text + optional caption
  - `VideoEmbedEditor`: URL input + optional title

**Step: Commit**

```bash
git add src/components/admin/content-editor/
git commit -m "feat: add block-based content editor with 7 block type editors"
```

---

### Task 12: Build Course Builder Tree

**Files:**
- Create: `src/components/admin/course-builder/course-tree.tsx`
- Create: `src/components/admin/course-builder/module-node.tsx`
- Create: `src/components/admin/course-builder/lesson-node.tsx`
- Create: `src/components/admin/course-builder/add-module-dialog.tsx`
- Create: `src/components/admin/course-builder/add-lesson-dialog.tsx`
- Create: `src/components/admin/course-builder/index.ts`

**Component descriptions:**

- `CourseTree`: Top-level component. Props: `{ course: Course; onChange: (course: Course) => void }`. Renders course metadata fields (title, description, language, tags) + a sortable list of `ModuleNode` components using dnd-kit. "Add Module" button opens `AddModuleDialog`.

- `ModuleNode`: Renders a module card with type badge (text/video/assessment), title, description. Collapsible to show its lessons. Contains a sortable list of `LessonNode` components. "Add Lesson" button. Edit/delete actions.

- `LessonNode`: Renders a lesson row with title, XP, difficulty badge, estimated time. Click to open the content editor for that lesson. Edit/delete actions.

- `AddModuleDialog`: Dialog form with title, description, type selector (text/video/assessment).

- `AddLessonDialog`: Dialog form with title, XP reward, estimated time, difficulty selector.

**Step: Commit**

```bash
git add src/components/admin/course-builder/
git commit -m "feat: add course builder tree with drag-and-drop module and lesson management"
```

---

## Phase 7: Showcase Page Update

### Task 13: Update showcase page with all new components

**Files:**
- Modify: `src/app/showcase/page.tsx`

Add new showcase sections (after the existing 6):

7. **Rich Text Editor** — TiptapEditor with sample content, plus TiptapRenderer showing the same content read-only.

8. **Code Editor** — Monaco editor wrapper with TypeScript and Rust examples, showing language switching.

9. **Code Challenge** — Full interactive demo: a simple TypeScript challenge ("Write a function that adds two numbers") with starter code, test cases, and hints. The student can run code and see test results.

10. **Question Builders** — Tabbed interface showing all 12 question type builders. Each tab renders the builder with sample data. User can interact and see the config change in a JSON preview panel beside it.

11. **Question Renderer** — Render sample questions of various types (MCQ, matching, ordering, true/false, cloze, matrix matching) using the QuestionRenderer component. Use the demo data from Skoolpad's architecture-showcase.tsx.

12. **Video Player** — VideoPlayer component with a sample YouTube/public video URL and 2-3 sample checkpoints (one quiz, one code challenge).

13. **Content Block Editor** — Full content editor demo with a few pre-populated blocks (text, code example, quiz). User can add/reorder/delete blocks.

14. **Course Builder** — CourseTree demo with a sample course containing 2 modules and 3 lessons. User can drag to reorder, add modules/lessons.

Since this page is getting large, split it into sub-pages:

```
/showcase                  → overview + base UI (existing)
/showcase/editor           → TiptapEditor + Monaco
/showcase/questions        → question builders + renderer
/showcase/code-challenge   → interactive code challenge
/showcase/video            → video player with checkpoints
/showcase/admin            → content editor + course builder
```

Each sub-page shares the showcase layout (sticky header + logo + theme toggle). Add navigation links between them.

**Step: Commit**

```bash
git add src/app/showcase/
git commit -m "feat: expand showcase with editor, questions, code challenge, video, and admin demos"
```

---

### Task 14: Build verification

**Step 1:** Run production build

```bash
npm run build
```

Expected: zero TypeScript errors, all pages generate.

**Step 2:** Verify no `//` comments

```bash
grep -r "^\s*//" src/ --include="*.ts" --include="*.tsx" | grep -v "http://" | grep -v "https://"
```

Expected: no results.

**Step 3:** Verify no `any` types

```bash
grep -r ": any" src/ --include="*.ts" --include="*.tsx"
```

Expected: no results.

**Step 4: Commit if fixes needed**

```bash
git add -A
git commit -m "fix: resolve build errors for strict TypeScript compliance"
```
