"use client";

import { useState, useCallback } from "react";
import {
  Trophy,
  SkipForward,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CodeChallenge } from "@/components/code-challenge";
import type { VideoCheckpoint } from "@/types/video";
import type { McqConfig } from "@/types/questions";

interface VideoCheckpointOverlayProps {
  checkpoint: VideoCheckpoint;
  onComplete: (passed: boolean) => void;
  onSkip: () => void;
}

type AnswerStatus = "idle" | "correct" | "incorrect";

export function VideoCheckpointOverlay({
  checkpoint,
  onComplete,
  onSkip,
}: VideoCheckpointOverlayProps) {
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("idle");

  const exhaustedAttempts = attempts >= checkpoint.maxAttempts;

  const handleOptionSelect = useCallback(
    (label: string, isCorrect: boolean) => {
      if (answerStatus === "correct" || exhaustedAttempts) return;

      setSelectedOption(label);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (isCorrect) {
        setAnswerStatus("correct");
        setTimeout(() => onComplete(true), 1200);
        return;
      }

      setAnswerStatus("incorrect");

      if (newAttempts >= checkpoint.maxAttempts) {
        if (checkpoint.hint) {
          setShowHint(true);
        }
        return;
      }

      setTimeout(() => {
        setSelectedOption(null);
        setAnswerStatus("idle");
      }, 800);
    },
    [attempts, answerStatus, exhaustedAttempts, checkpoint, onComplete],
  );

  const mcqConfig = checkpoint.questionData?.responseConfig as
    | McqConfig
    | undefined;
  const options = mcqConfig?.options;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="max-w-2xl w-full mx-4 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="primary">
              {checkpoint.type === "quiz" ? "Quiz" : "Code Challenge"}
            </Badge>
            <Badge variant="reward">
              <Trophy className="h-3 w-3" />+{checkpoint.xpReward} XP
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            Attempt {attempts} of {checkpoint.maxAttempts}
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          {checkpoint.type === "quiz" && checkpoint.questionData && (
            <div className="space-y-4">
              <p className="text-sm text-foreground leading-relaxed">
                {checkpoint.questionData.content}
              </p>

              {options && (
                <div className="space-y-2">
                  {options.map((option) => {
                    const isSelected = selectedOption === option.label;
                    const showCorrect =
                      isSelected && answerStatus === "correct";
                    const showIncorrect =
                      isSelected && answerStatus === "incorrect";

                    return (
                      <button
                        key={option.label}
                        type="button"
                        disabled={
                          answerStatus === "correct" || exhaustedAttempts
                        }
                        onClick={() =>
                          handleOptionSelect(option.label, option.is_correct)
                        }
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                          "hover:bg-muted/50 disabled:opacity-60 disabled:cursor-not-allowed",
                          showCorrect &&
                            "border-green-500 bg-green-500/10 text-green-400",
                          showIncorrect &&
                            "border-red-500 bg-red-500/10 text-red-400",
                          !isSelected && "border-border text-foreground",
                        )}
                      >
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full border border-current text-xs font-semibold">
                          {option.label}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {showCorrect && (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
                        )}
                        {showIncorrect && (
                          <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {showHint && checkpoint.hint && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{checkpoint.hint}</span>
                </div>
              )}
            </div>
          )}

          {checkpoint.type === "code_challenge" && checkpoint.challengeData && (
            <CodeChallenge
              challenge={checkpoint.challengeData}
              onComplete={(passed) => onComplete(passed)}
            />
          )}
        </CardContent>

        {checkpoint.skippable && (
          <div className="px-6 pb-4 flex items-center justify-end">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
