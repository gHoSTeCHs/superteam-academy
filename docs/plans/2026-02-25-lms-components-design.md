# LMS Components Design

**Date:** 2026-02-25
**Status:** Approved
**Scope:** UI components for the Superteam Academy LMS — content editor, course builder, video module, assessment module, and code execution system

## Context

Superteam Brasil bounty to build a production-ready LMS for Solana developers. This document covers the UI component architecture for the three module types, the admin content/course editors, and the code execution system. All components will be showcased on `/showcase` before integration into the full app.

## Module Types

Three module types for the bounty submission:

### 1. Text Module
Block-based lessons (the Codecademy model). A lesson is a sequence of typed content blocks.

**Block types:**
| Block | Editor (Admin) | Renderer (Learner) |
|-------|---------------|-------------------|
| Text | TiptapEditor (ported from Skoolpad) | TiptapRenderer (ported) |
| Code Example | Monaco editor with language selector | Read-only syntax-highlighted code |
| Code Challenge | Monaco editor + test case editor + hints editor | Interactive Monaco + Run button + test results |
| Quiz | Question type builders (12 types ported from Skoolpad) | QuestionRenderer (ported) |
| Callout | Type selector (info/warning/tip) + text input | Styled callout box |
| Image | Upload/URL input + alt text | Responsive image |
| Video Embed | URL input (YouTube/Loom) | Embedded player |

### 2. Video Module
Video player with interactive checkpoints at timestamps.

**Checkpoint flow:**
```
Video playing → Hits timestamp → Pause → Show question/code overlay
  ├── Correct → Resume video, award XP
  ├── Wrong (attempt 1-N) → "Try again"
  ├── Wrong (after maxAttempts) → Show hint
  └── Still stuck → "Skip and continue" (if skippable)
```

**Admin editor:** Video URL input + timeline scrubber for placing checkpoints. Each checkpoint links to a question (from question builders) or a code challenge. Configurable: maxAttempts, hint content, skippable flag.

**Learner UI:** Custom video player (HTML5 video / react-player). At checkpoint timestamps, video pauses and an overlay slides up with the question/challenge. Attempt tracking with progression logic.

### 3. Assessment Module
Exams/quizzes using the ported question builders.

**Features:** Timed exams (countdown, auto-submit), question papers with sections, auto-grading for objective types (MCQ, true/false, numeric, matching, ordering), score breakdown, XP reward on completion.

## Course Builder (Admin)

Three-level hierarchy:
```
Course
  └── Module (typed: text | video | assessment)
       └── Lesson (content blocks)
```

**Admin UI:** Tree/outline view with drag-and-drop reordering (dnd-kit). CRUD for courses, modules, lessons. Per-entity metadata:
- Course: title, description, language (PT/ES/EN), thumbnail, tags
- Module: title, description, type, unlock conditions
- Lesson: title, XP reward, estimated time, difficulty, prerequisites

## Content Editor (Admin)

Block-based editor for composing lesson content.

**UI:** Vertical block list. Admin can:
- Add blocks via dropdown (pick type)
- Reorder blocks via drag-and-drop
- Edit each block inline (type-specific editor)
- Delete blocks
- Preview lesson as student sees it

**Data model per block:**
```
ContentBlock {
  id: string
  type: "text" | "code_example" | "code_challenge" | "quiz" | "callout" | "image" | "video_embed"
  sortOrder: number
  data: Record<string, unknown>  /* type-specific payload */
}
```

## Code Execution System

**Approach:** Client-side sandboxed execution (Option A). No backend infrastructure.

**TypeScript challenges:** Execute in a sandboxed iframe using Sandpack's runtime. Student writes code, predefined test assertions run against it, return pass/fail results.

**Rust/Anchor challenges:** Structural validation — regex/AST pattern matching against expected code structures. The admin defines validation rules when creating the challenge.

**Abstraction:** All execution goes through a `CodeRunner` interface so the engine is swappable:
```
interface CodeRunner {
  run(code: string, language: string, testCases: TestCase[]): Promise<RunResult>
}

interface TestCase {
  name: string
  input?: string
  expectedOutput?: string
  validationPattern?: string
  assertionCode?: string
}

interface RunResult {
  passed: boolean
  results: { name: string; passed: boolean; message: string }[]
  error?: string
}
```

**Editor:** Monaco editor wrapper, fully styled to Superteam Brasil design system. No default Sandpack chrome — we control all UI.

**Challenge data model:**
```
CodeChallenge {
  language: "typescript" | "rust"
  starterCode: string
  solutionCode: string
  testCases: TestCase[]
  validationRules: Rule[]    /* for structural validation (Rust) */
  hints: string[]
  maxAttempts?: number
}
```

## Video Checkpoint System

**Data model:**
```
VideoCheckpoint {
  id: string
  timestamp: number          /* seconds into video */
  type: "quiz" | "code_challenge"
  questionData?: QuestionData
  challengeData?: CodeChallenge
  maxAttempts: number
  hint?: string
  skippable: boolean
  xpReward: number
}
```

**Checkpoint storage is separate from the video** — the video URL is clean, checkpoints are a JSON array of the above. This means the same video can be reused with different checkpoint configurations.

## Components to Port from Skoolpad

**Direct ports (adapt CSS variables to our theme):**
- TiptapEditor + TiptapRenderer (rich text)
- 12 question type builders (McqBuilder, MultiSelectMcqBuilder, TrueFalseBuilder, FillBlankBuilder, ClozeBuilder, MatchingBuilder, MatrixMatchingBuilder, OrderingBuilder, DiagramLabelBuilder, CalculationBuilder, NumericEntryBuilder, AssertionReasonBuilder)
- QuestionRenderer (15+ question type display)
- ContextCard (passages, diagrams, tables, code contexts)
- QuestionTypeBadge
- DataTable + Pagination
- PageHeader, StatCard, StatusBadge, SearchInput, RowActions, EmptyState

## Components to Build from Scratch

- MonacoEditor wrapper (themed, language selector)
- CodeChallengeBlock (starter code, run button, test results, hints)
- CodeChallengeEditor (admin: starter/solution code, test cases, hints)
- VideoPlayer (custom, checkpoint-aware)
- VideoCheckpointEditor (admin: timeline + checkpoint placement)
- VideoCheckpointOverlay (learner: question/challenge overlay during video)
- CourseBuilderTree (admin: course → module → lesson tree with drag-and-drop)
- ContentBlockEditor (admin: block list with type-specific inline editors)
- ContentBlockRenderer (learner: renders block sequence)
- AssessmentRunner (learner: timed exam with question navigation)
- AssessmentBuilder (admin: question paper assembly)

## Showcase Strategy

All components will be built and previewed on the `/showcase` page before integration into the app routes. Showcase sections:
1. Color Palette + Typography (already done)
2. Base UI components (already done)
3. Rich Text (TiptapEditor + TiptapRenderer)
4. Code Editor (Monaco wrapper in our theme)
5. Code Challenge (full interactive demo)
6. Question Builders (all 12 types)
7. Question Renderer (all 15+ types)
8. Video Player with Checkpoints (demo with sample video)
9. Cards (course card, stat card, streak widget)
10. Admin Components (DataTable, PageHeader, etc.)

## Design System Compliance

All components use:
- CSS variables from `globals.css` (no hardcoded colors)
- `var(--font-display)` for headings, `var(--font-body)` for UI text
- `var(--card-radius)` for border radii
- Radix UI primitives for accessibility
- `cn()` utility for class merging
- Both light and dark mode support
