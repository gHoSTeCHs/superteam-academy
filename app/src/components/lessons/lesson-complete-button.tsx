"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2Icon,
  Loader2Icon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { XpBurst } from "@/components/ui/xp-burst";
import { cn } from "@/lib/utils";
import { useStreak } from "@/hooks/use-streak";
import {
  getNewStreakAchievements,
  getAchievementById,
} from "@/lib/achievements";
import { showAchievementToast } from "@/lib/achievement-toast";

interface LessonCompleteButtonProps {
  xpReward: number;
  isCompleted?: boolean;
  isLastLesson?: boolean;
  isFirstLesson?: boolean;
  walletAddress?: string;
  onComplete?: () => Promise<void> | void;
  onFinalizeCourse?: () => Promise<void> | void;
  className?: string;
}

export function LessonCompleteButton({
  xpReward,
  isCompleted: initialCompleted = false,
  isLastLesson = false,
  isFirstLesson = false,
  walletAddress,
  onComplete,
  onFinalizeCourse,
  className,
}: LessonCompleteButtonProps) {
  const t = useTranslations("Lessons");
  const { recordActivity } = useStreak(walletAddress ?? "");
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [showXpBurst, setShowXpBurst] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);

  const handleComplete = useCallback(async () => {
    setLoading(true);
    try {
      await onComplete?.();
      setIsCompleted(true);
      setShowXpBurst(true);

      if (walletAddress) {
        const { previousStreak, newStreak } = recordActivity();
        const crossed = getNewStreakAchievements(previousStreak, newStreak);
        crossed.forEach(showAchievementToast);
      }

      if (isFirstLesson) {
        const firstSteps = getAchievementById("first-steps");
        if (firstSteps) showAchievementToast(firstSteps);
      }

      if (isLastLesson) {
        const completer = getAchievementById("course-completer");
        if (completer) showAchievementToast(completer);
        setShowFinalize(true);
      }
    } finally {
      setLoading(false);
    }
  }, [onComplete, isLastLesson, isFirstLesson, walletAddress, recordActivity]);

  const handleFinalize = useCallback(async () => {
    setLoading(true);
    try {
      await onFinalizeCourse?.();
    } finally {
      setLoading(false);
    }
  }, [onFinalizeCourse]);

  if (showFinalize) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3">
          <TrophyIcon className="size-5 text-primary" />
          <span
            className="text-[14px] font-semibold text-primary"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("allLessonsCompleted")}
          </span>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleFinalize}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <TrophyIcon className="size-4" />
          )}
          <span style={{ fontFamily: "var(--font-body)" }}>
            {loading ? t("finalizing") : t("claimCourseCredential")}
          </span>
        </Button>
        <XpBurst
          xp={xpReward}
          visible={showXpBurst}
          onComplete={() => setShowXpBurst(false)}
        />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <CheckCircle2Icon className="size-5 text-primary" />
        <span
          className="text-[14px] font-medium text-primary"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("lessonCompleted")}
        </span>
        <span
          className="ml-auto flex items-center gap-1 text-[13px] font-semibold"
          style={{ color: "#ffd23f" }}
        >
          <ZapIcon className="size-3.5" />+{xpReward} XP
        </span>
        <XpBurst
          xp={xpReward}
          visible={showXpBurst}
          onComplete={() => setShowXpBurst(false)}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        variant="primary"
        size="lg"
        onClick={handleComplete}
        disabled={loading}
        className="w-full gap-2"
      >
        {loading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <CheckCircle2Icon className="size-4" />
        )}
        <span style={{ fontFamily: "var(--font-body)" }}>
          {loading ? t("completing") : t("markAsComplete")}
        </span>
        <span className="ml-1 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
          <ZapIcon className="size-3" />
          {xpReward} XP
        </span>
      </Button>
      <XpBurst
        xp={xpReward}
        visible={showXpBurst}
        onComplete={() => setShowXpBurst(false)}
      />
    </div>
  );
}
