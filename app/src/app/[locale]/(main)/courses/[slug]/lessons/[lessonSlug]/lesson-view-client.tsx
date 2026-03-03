"use client";

import { useRouter } from "@/i18n/navigation";
import { LessonContent } from "@/components/lessons/lesson-content";
import { LessonNavigation } from "@/components/lessons/lesson-navigation";
import { LessonCompleteButton } from "@/components/lessons/lesson-complete-button";
import type { Lesson } from "@/types/course";

interface LessonViewClientProps {
  lesson: Lesson;
  courseSlug: string;
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
  moduleName,
  currentLesson,
  totalLessons,
  previousLessonSlug,
  nextLessonSlug,
  lessonBasePath,
}: LessonViewClientProps) {
  const router = useRouter();

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
        className="mt-6"
      />

      <div className="mt-8 border-t border-border pt-6">
        <LessonCompleteButton
          xpReward={lesson.xpReward}
          isLastLesson={currentLesson === totalLessons}
        />
      </div>
    </div>
  );
}
