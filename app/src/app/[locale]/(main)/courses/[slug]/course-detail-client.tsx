"use client";

import { useRouter } from "@/i18n/navigation";
import { CourseHeader } from "@/components/courses/course-header";
import { ModuleList } from "@/components/courses/module-list";
import { EnrollButton } from "@/components/courses/enroll-button";
import type { Course } from "@/types/course";

interface CourseDetailClientProps {
  course: Course;
}

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter();

  const firstLesson = course.modules?.[0]?.lessons?.[0];
  const courseSlug = course.slug ?? course.id;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <CourseHeader course={course} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <ModuleList
          modules={course.modules ?? []}
          onLessonClick={(_moduleId, lessonId) => {
            const lesson = course.modules
              .flatMap((m) => m.lessons)
              .find((l) => l.id === lessonId);
            if (lesson?.slug) {
              router.push(`/courses/${courseSlug}/lessons/${lesson.slug}`);
            }
          }}
        />

        <div className="space-y-6">
          <EnrollButton
            onContinue={() => {
              if (firstLesson?.slug) {
                router.push(
                  `/courses/${courseSlug}/lessons/${firstLesson.slug}`,
                );
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
