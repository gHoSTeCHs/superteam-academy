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
  quizQuestion?: string;
  quizOptions?: string[];
  calloutType?: string;
  calloutTitle?: string;
  calloutContent?: string;
  imageUrl?: string;
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
          language: (raw.language as "typescript" | "rust") ?? "typescript",
          starterCode: raw.starterCode ?? "",
          solutionCode: raw.solutionCode ?? "",
          testCases: [],
          hints: raw.hints ?? [],
        },
      };
    case "quiz":
      return {
        id: raw._key,
        type,
        sortOrder: index,
        data: {
          type: "quiz",
          questionType: "mcq",
          content: raw.quizQuestion ?? "",
          responseConfig: null,
        },
      };
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
