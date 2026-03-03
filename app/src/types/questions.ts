import type { TiptapJSON } from "./tiptap";

export type QuestionType =
  | "mcq"
  | "multi_select_mcq"
  | "fill_blank"
  | "cloze"
  | "matching"
  | "ordering"
  | "true_false"
  | "diagram_label"
  | "calculation"
  | "assertion_reason"
  | "matrix_matching"
  | "numeric_entry";

export type ContextType =
  | "passage"
  | "diagram"
  | "table"
  | "case_study"
  | "code_snippet"
  | "map"
  | "graph"
  | "word_bank"
  | "equation_set";

export type QuestionStatus = "draft" | "in_review" | "published" | "archived";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface McqConfig {
  options: { label: string; text: string; is_correct: boolean }[];
}

export interface MultiSelectMcqConfig extends McqConfig {
  min_correct?: number;
  max_correct?: number;
}

export interface TrueFalseConfig {
  correct_answer: boolean;
  requires_justification?: boolean;
}

export interface FillBlankConfig {
  blanks: { position: number; correct_answers: string[] }[];
  case_sensitive?: boolean;
}

export interface ClozeConfig {
  gaps: { position: number; options: string[]; correct: number }[];
}

export interface MatchingConfig {
  pairs: { left: string; right: string }[];
  distractors?: string[];
}

export interface MatrixMatchingConfig {
  left: string[];
  right: string[];
  mapping: Record<number, number[]>;
}

export interface OrderingConfig {
  items: string[];
  correct_order: number[];
}

export interface DiagramLabelConfig {
  labels: { label: string; answer: string; x?: number; y?: number }[];
}

export interface CalculationConfig {
  answer: string;
  unit?: string;
  tolerance?: number;
  requires_working?: boolean;
}

export interface NumericEntryConfig {
  answer: number;
  tolerance?: number;
  unit?: string;
}

export interface AssertionReasonConfig {
  assertion: string;
  reason: string;
  options: { label: string; text: string; is_correct: boolean }[];
}

export type ResponseConfig =
  | McqConfig
  | MultiSelectMcqConfig
  | TrueFalseConfig
  | FillBlankConfig
  | ClozeConfig
  | MatchingConfig
  | MatrixMatchingConfig
  | OrderingConfig
  | DiagramLabelConfig
  | CalculationConfig
  | NumericEntryConfig
  | AssertionReasonConfig
  | null;

export interface QuestionContextData {
  id: string;
  context_type: ContextType;
  title?: string;
  content?: string;
  media_url?: string;
  table_data?: { headers: string[]; rows: string[][] };
  word_bank?: string[];
  language?: string;
}

export interface QuestionNode {
  id: string;
  question_type: QuestionType;
  question_number?: string;
  display_label?: string;
  content: string;
  marks: number | null;
  sort_order: number;
  depth_level: number;
  response_config: ResponseConfig;
  choice_group?: { required: string[]; chooseN: number; optional: string[] };
  difficulty_level?: string;
  bloom_level?: string;
  status: string;
  context_links?: { context_id: string; sort_order: number; label?: string }[];
  question_context_links?: {
    question_context_id: string;
    sort_order: number;
    label?: string;
  }[];
  children: QuestionNode[];
}

export interface QuestionSection {
  id: string;
  label: string;
  instruction?: string;
  marks?: number;
  required_count?: number;
  sort_order: number;
  questions: QuestionNode[];
}

/**
 * Tiptap-based answer content at a specific depth level.
 * Used by the question renderer for displaying worked solutions.
 */
export interface AnswerDepthData {
  depth_level: "quick" | "standard" | "deep_dive";
  label: string;
  description: string;
  answer: {
    id: string;
    content: TiptapJSON;
    content_plain: string | null;
    is_published: boolean;
  } | null;
}
