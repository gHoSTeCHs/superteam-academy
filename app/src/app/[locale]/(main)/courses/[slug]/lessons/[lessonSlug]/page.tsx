import { notFound } from "next/navigation";
import { safeFetch } from "@/sanity/client";
import { lessonBySlugQuery, courseBySlugQuery } from "@/sanity/queries";
import { LessonViewClient } from "./lesson-view-client";
import type { Lesson, Course } from "@/types/course";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug: courseSlug, lessonSlug } = await params;

  const [lesson, course] = await Promise.all([
    safeFetch<Lesson | null>(lessonBySlugQuery, { slug: lessonSlug }),
    safeFetch<Course | null>(courseBySlugQuery, { slug: courseSlug }),
  ]);

  if (!lesson || !course) notFound();

  const allLessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const currentIndex = allLessons.findIndex(
    (l) => l.slug === lessonSlug || l.id === lesson.id,
  );
  const currentModule = course.modules?.find((m) =>
    m.lessons.some((l) => l.slug === lessonSlug || l.id === lesson.id),
  );

  return (
    <LessonViewClient
      lesson={lesson}
      courseSlug={courseSlug}
      moduleName={currentModule?.title ?? "Module"}
      currentLesson={currentIndex + 1}
      totalLessons={allLessons.length}
      previousLessonSlug={allLessons[currentIndex - 1]?.slug}
      nextLessonSlug={allLessons[currentIndex + 1]?.slug}
    />
  );
}
