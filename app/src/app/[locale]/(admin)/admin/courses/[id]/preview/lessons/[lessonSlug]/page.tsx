import { notFound } from "next/navigation";
import { previewClient } from "@/sanity/server";
import { lessonBySlugQuery } from "@/sanity/queries";
import { transformQuizBlocks } from "@/lib/quiz-transform";
import { groq } from "next-sanity";
import { PreviewBannerWrapper } from "../../preview-banner-wrapper";
import { LessonViewClient } from "@/app/[locale]/(main)/courses/[slug]/lessons/[lessonSlug]/lesson-view-client";
import type { Lesson, Course } from "@/types/course";

interface LessonPreviewPageProps {
  params: Promise<{ id: string; lessonSlug: string; locale: string }>;
}

const previewCourseByIdQuery = groq`
  *[_type == "course" && _id == $id][0] {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "id": _id,
      title,
      "description": coalesce(description, ""),
      type,
      "sortOrder": order,
      lessons[]-> {
        "id": _id,
        title,
        "slug": slug.current,
        "xpReward": coalesce(xp, 0),
        estimatedMinutes,
        difficulty,
        "sortOrder": 0
      }
    }
  }
`;

export default async function LessonPreviewPage({
  params,
}: LessonPreviewPageProps) {
  const { id: courseId, lessonSlug, locale } = await params;

  let lesson: Lesson | null = null;
  let course: Course | null = null;

  try {
    [lesson, course] = await Promise.all([
      previewClient.fetch<Lesson | null>(lessonBySlugQuery, {
        slug: lessonSlug,
      }),
      previewClient.fetch<Course | null>(previewCourseByIdQuery, {
        id: courseId,
      }),
    ]);
  } catch {
    lesson = null;
    course = null;
  }

  if (!lesson || !course) notFound();

  lesson = transformQuizBlocks(lesson);

  const allLessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const currentIndex = allLessons.findIndex(
    (l) => l.slug === lessonSlug || l.id === lesson.id,
  );
  const currentModule = course.modules?.find((m) =>
    m.lessons.some((l) => l.slug === lessonSlug || l.id === lesson.id),
  );

  return (
    <div className="-m-6">
      <PreviewBannerWrapper
        courseId={courseId}
        courseName={course.title}
        locale={locale}
      />
      <div className="p-6">
        <LessonViewClient
          lesson={lesson}
          courseSlug={course.slug ?? ""}
          moduleName={currentModule?.title ?? "Module"}
          currentLesson={currentIndex + 1}
          totalLessons={allLessons.length}
          previousLessonSlug={allLessons[currentIndex - 1]?.slug}
          nextLessonSlug={allLessons[currentIndex + 1]?.slug}
          lessonBasePath={`/admin/courses/${courseId}/preview/lessons`}
        />
      </div>
    </div>
  );
}
