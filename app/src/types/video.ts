import type { CodeChallengeData } from "./content";
import type { QuestionType, ResponseConfig } from "./questions";

export interface VideoCheckpoint {
  id: string;
  timestamp: number;
  type: "quiz" | "code_challenge";
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
