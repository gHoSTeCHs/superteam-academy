import { notFound } from "next/navigation";
import { safeFetch } from "@/sanity/client";
import { adminCourseByIdQuery } from "@/sanity/queries";
import { EditCourseClient } from "./edit-course-client";
import type { Course, Module, Lesson } from "@/types/course";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

interface SanityCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  difficulty: string;
  isPublished: boolean;
  thumbnail: string | null;
  tags: string[];
  modules:
    | {
        _id: string;
        title: string;
        description: string;
        type: string;
        order: number;
        lessons: {
          _id: string;
          title: string;
          slug: string;
          xp: number;
          estimatedMinutes: number;
          difficulty: string;
        }[];
      }[]
    | null;
}

function mapSanityCourse(raw: SanityCourse): Course & { isPublished: boolean } {
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description ?? "",
    language: (raw.language ?? "en") as Course["language"],
    thumbnail: raw.thumbnail ?? undefined,
    tags: raw.tags ?? [],
    isPublished: raw.isPublished ?? false,
    modules: (raw.modules ?? []).map(
      (m, mi): Module => ({
        id: m._id,
        title: m.title,
        description: m.description ?? "",
        type: (m.type ?? "text") as Module["type"],
        sortOrder: m.order ?? mi,
        lessons: (m.lessons ?? []).map(
          (l, li): Lesson => ({
            id: l._id,
            slug: l.slug,
            title: l.title,
            xpReward: l.xp ?? 0,
            estimatedMinutes: l.estimatedMinutes ?? 10,
            difficulty: (l.difficulty ?? "beginner") as Lesson["difficulty"],
            sortOrder: li,
          }),
        ),
      }),
    ),
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const raw = await safeFetch<SanityCourse | null>(adminCourseByIdQuery, {
    id,
  });
  if (!raw) notFound();

  const course = mapSanityCourse(raw);
  return <EditCourseClient initialCourse={course} courseId={raw._id} />;
}
