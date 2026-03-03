import { notFound } from "next/navigation";
import { safeFetch } from "@/sanity/client";
import { adminLessonByIdQuery } from "@/sanity/queries";
import { LessonEditorClient } from "./lesson-editor-client";
import type {
  ContentBlock,
  ContentBlockType,
  TextBlockData,
} from "@/types/content";

interface LessonEditorPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

interface RawBlock {
  _key: string;
  blockType: string;
  textContent?: unknown;
  language?: string;
  code?: string;
  filename?: string;
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
  testCases?: {
    name: string;
    input?: string;
    expectedOutput?: string;
    assertionCode?: string;
  }[];
  validationRules?: { pattern: string; message: string }[];
  maxAttempts?: number;
  quizQuestion?: string;
  quizOptions?: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  responseConfigJson?: string;
  questionType?: string;
  calloutType?: string;
  calloutTitle?: string;
  calloutContent?: string;
  imageUrl?: string;
  imageAssetId?: string;
  alt?: string;
  caption?: string;
  videoUrl?: string;
  videoTitle?: string;
}

interface RawLesson {
  _id: string;
  title: string;
  slug: string;
  xp: number;
  estimatedMinutes: number;
  difficulty: string;
  contentBlocks: RawBlock[] | null;
}

function mapBlock(raw: RawBlock, index: number): ContentBlock {
  const type = raw.blockType as ContentBlockType;

  switch (type) {
    case "text":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "text",
          content: (raw.textContent ?? null) as TextBlockData["content"],
        },
      };
    case "code_example":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "code_example",
          language: raw.language ?? "typescript",
          code: raw.code ?? "",
          filename: raw.filename,
        },
      };
    case "code_challenge":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "code_challenge",
          language: raw.language === "rust" ? "rust" : "typescript",
          starterCode: raw.starterCode ?? "",
          solutionCode: raw.solutionCode ?? "",
          testCases: (raw.testCases ?? []).map((tc) => ({
            name: tc.name ?? "",
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            assertionCode: tc.assertionCode,
          })),
          validationRules: raw.validationRules,
          hints: raw.hints ?? [],
          maxAttempts: raw.maxAttempts,
        },
      };
    case "quiz": {
      const questionType = (raw.questionType ??
        "mcq") as import("@/types/questions").QuestionType;
      let responseConfig: import("@/types/questions").ResponseConfig = null;

      if (raw.responseConfigJson) {
        try {
          responseConfig = JSON.parse(raw.responseConfigJson);
        } catch {
          /* fallback to MCQ reconstruction below */
        }
      }

      if (
        !responseConfig &&
        (questionType === "mcq" || questionType === "multi_select_mcq") &&
        raw.quizOptions?.length
      ) {
        const correctSet = new Set(
          questionType === "multi_select_mcq" && raw.correctAnswers?.length
            ? raw.correctAnswers
            : raw.correctAnswer != null
              ? [raw.correctAnswer]
              : [],
        );
        responseConfig = {
          options: raw.quizOptions.map((text, i) => ({
            label: String.fromCharCode(65 + i),
            text,
            is_correct: correctSet.has(i),
          })),
        };
      }

      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "quiz",
          questionType,
          content: raw.quizQuestion ?? "",
          responseConfig,
        },
      };
    }
    case "callout":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "callout",
          calloutType:
            (raw.calloutType as "info" | "warning" | "tip") ?? "info",
          title: raw.calloutTitle,
          content: raw.calloutContent ?? "",
        },
      };
    case "image":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "image",
          src: raw.imageUrl ?? "",
          alt: raw.alt ?? "",
          caption: raw.caption,
          assetId: raw.imageAssetId,
        },
      };
    case "video_embed":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "video_embed",
          url: raw.videoUrl ?? "",
          title: raw.videoTitle,
        },
      };
    default:
      return {
        id: raw._key,
        type: "text",
        sortOrder: index,
        data: { type: "text", content: null },
      };
  }
}

export default async function LessonEditorPage({
  params,
}: LessonEditorPageProps) {
  const { id: courseId, lessonId } = await params;
  const raw = await safeFetch<RawLesson | null>(adminLessonByIdQuery, {
    id: lessonId,
  });
  if (!raw) notFound();

  const blocks = (raw.contentBlocks ?? []).map(mapBlock);

  return (
    <LessonEditorClient
      courseId={courseId}
      lessonId={raw._id}
      lessonTitle={raw.title}
      initialBlocks={blocks}
    />
  );
}
