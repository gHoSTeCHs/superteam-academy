import { notFound } from "next/navigation";
import { previewClient } from "@/sanity/server";
import { groq } from "next-sanity";
import { PreviewBannerWrapper } from "./preview-banner-wrapper";
import { CourseDetailClient } from "@/app/[locale]/(main)/courses/[slug]/course-detail-client";
import type { Course } from "@/types/course";

interface PreviewPageProps {
  params: Promise<{ id: string; locale: string }>;
}

const previewCourseQuery = groq`
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

export default async function CoursePreviewPage({ params }: PreviewPageProps) {
  const { id, locale } = await params;

  let course: Course | null = null;
  try {
    course = await previewClient.fetch<Course | null>(previewCourseQuery, {
      id,
    });
  } catch {
    course = null;
  }

  if (!course) notFound();

  return (
    <div className="-m-6">
      <PreviewBannerWrapper
        courseId={id}
        courseName={course.title}
        locale={locale}
      />
      <div className="p-6">
        <CourseDetailClient
          course={course}
          lessonBasePath={`/admin/courses/${id}/preview/lessons`}
        />
      </div>
    </div>
  );
}
