"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import type { Course } from "@/types/course";

interface CoursesClientProps {
  courses: Course[];
}

export function CoursesClient({ courses }: CoursesClientProps) {
  const t = useTranslations("Courses");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [track, setTrack] = useState("all");

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      if (
        search &&
        !course.title.toLowerCase().includes(search.toLowerCase()) &&
        !course.description?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (difficulty !== "all") {
        const firstDifficulty = course.modules?.[0]?.lessons?.[0]?.difficulty;
        if (firstDifficulty && firstDifficulty !== difficulty) return false;
      }

      if (track !== "all") {
        const tags = (course.tags ?? []).map((t) => t.toLowerCase());
        if (!tags.includes(track)) return false;
      }

      return true;
    });
  }, [courses, search, difficulty, track]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1
          className="text-[32px] font-bold tracking-tight text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          {t("coursesTitle")}
        </h1>
        <p
          className="mt-1 text-[15px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("coursesDescription")}
        </p>
      </div>

      <CourseFilters
        onSearchChange={setSearch}
        onDifficultyChange={(d) => setDifficulty(d)}
        onTrackChange={(t) => setTrack(t)}
        className="mb-8"
      />

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p
            className="text-[15px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("noCoursesFound")}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              slug={course.slug ?? course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
