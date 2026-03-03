import type { PortableTextBlock } from "@portabletext/react";
import type { TiptapJSON } from "./tiptap";
import type { ResponseConfig, QuestionType } from "./questions";

export type ContentBlockType =
  | "text"
  | "code_example"
  | "code_challenge"
  | "quiz"
  | "callout"
  | "image"
  | "video_embed";

export type CalloutType = "info" | "warning" | "tip";

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
  type: "text";
  content: PortableTextBlock[] | TiptapJSON | null;
}

export interface CodeExampleData {
  type: "code_example";
  language: string;
  code: string;
  filename?: string;
}

export interface CodeChallengeData {
  type: "code_challenge";
  language: "typescript" | "rust";
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
  type: "quiz";
  questionType: QuestionType;
  content: string;
  responseConfig: ResponseConfig;
}

export interface CalloutBlockData {
  type: "callout";
  calloutType: CalloutType;
  title?: string;
  content: string;
}

export interface ImageBlockData {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  assetId?: string;
}

export interface VideoEmbedData {
  type: "video_embed";
  url: string;
  title?: string;
}
