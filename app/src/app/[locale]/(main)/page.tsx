import { safeFetch } from "@/sanity/client";
import { allCoursesQuery } from "@/sanity/queries";
import { LandingClient } from "./landing-client";
import type { Course } from "@/types/course";

export default async function Home() {
  const courses = await safeFetch<Course[]>(allCoursesQuery);

  const previewCourses = (courses ?? []).slice(0, 3).map((c) => {
    const lessons = c.modules?.flatMap((m) => m.lessons) ?? [];
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      difficulty:
        (c.modules?.[0]?.lessons?.[0]?.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced") ?? "beginner",
      lessonCount: lessons.length,
      totalXp: lessons.reduce((sum, l) => sum + (l.xpReward ?? 0), 0),
      tags: c.tags ?? [],
    };
  });

  return <LandingClient courses={previewCourses} />;
}
