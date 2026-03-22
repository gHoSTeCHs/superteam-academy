"use client";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useStreak } from "@/hooks/use-streak";
import { LessonContent } from "@/components/lessons/lesson-content";
import { LessonNavigation } from "@/components/lessons/lesson-navigation";
import { LessonCompleteButton } from "@/components/lessons/lesson-complete-button";
import type { Lesson } from "@/types/course";

interface LessonViewClientProps {
  lesson: Lesson;
  courseSlug: string;
  courseId: string;
  moduleName: string;
  currentLesson: number;
  totalLessons: number;
  previousLessonSlug?: string;
  nextLessonSlug?: string;
  lessonBasePath?: string;
}

export function LessonViewClient({
  lesson,
  courseSlug,
  courseId,
  moduleName,
  currentLesson,
  totalLessons,
  previousLessonSlug,
  nextLessonSlug,
  lessonBasePath,
}: LessonViewClientProps) {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const { recordActivity } = useStreak(walletAddress ?? "");

  const isFirstLesson = currentLesson === 1 && !previousLessonSlug;

  function handleChallengeComplete(_blockId: string, passed: boolean) {
    if (passed && walletAddress) {
      recordActivity();
    }
  }

  function navigateLesson(lessonSlug: string) {
    const basePath = lessonBasePath ?? `/courses/${courseSlug}/lessons`;
    router.push(`${basePath}/${lessonSlug}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <LessonNavigation
        moduleName={moduleName}
        currentLesson={currentLesson}
        totalLessons={totalLessons}
        lessonTitle={lesson.title}
        hasPrevious={!!previousLessonSlug}
        hasNext={!!nextLessonSlug}
        onPrevious={() =>
          previousLessonSlug && navigateLesson(previousLessonSlug)
        }
        onNext={() => nextLessonSlug && navigateLesson(nextLessonSlug)}
      />

      <LessonContent
        blocks={lesson.contentBlocks ?? []}
        lessonSlug={lesson.slug}
        onChallengeComplete={handleChallengeComplete}
        className="mt-6"
      />

      <div className="mt-8 border-t border-border pt-6">
        <LessonCompleteButton
          xpReward={lesson.xpReward}
          isLastLesson={currentLesson === totalLessons}
          isFirstLesson={isFirstLesson}
          walletAddress={walletAddress ?? undefined}
          onComplete={async () => {
            const res = await fetch("/api/solana/complete-lesson", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                courseId,
                lessonIndex: currentLesson - 1,
              }),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error ?? "Failed to complete lesson");
            }
          }}
          onFinalizeCourse={async () => {
            const res = await fetch("/api/solana/finalize-course", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ courseId }),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error ?? "Failed to finalize course");
            }
          }}
        />
      </div>
    </div>
  );
}
