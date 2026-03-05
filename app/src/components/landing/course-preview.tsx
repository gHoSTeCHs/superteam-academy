"use client";

import { ArrowRightIcon, BookOpenIcon, ZapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import DifficultyBadge from "@/components/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewCourse {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessonCount: number;
  totalXp: number;
  tags: string[];
}

interface CoursePreviewProps {
  courses: PreviewCourse[];
  onViewAll?: () => void;
  className?: string;
}

export function CoursePreview({
  courses,
  onViewAll,
  className,
}: CoursePreviewProps) {
  const t = useTranslations("Landing");

  return (
    <section className={cn("px-6 py-16 md:px-12 md:py-20", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t("featuredCourses")}
            </p>
            <h2
              className="text-[28px] font-bold tracking-tight text-foreground md:text-[36px]"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              {t("startYourJourney")}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-1.5 md:inline-flex"
            onClick={onViewAll}
          >
            <span style={{ fontFamily: "var(--font-body)" }}>
              {t("viewAllCourses")}
            </span>
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="flex h-full flex-col transition-shadow hover:shadow-md"
            >
              <div
                className="flex flex-col justify-end px-5 py-5"
                style={{
                  background:
                    "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
                  minHeight: "120px",
                }}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <DifficultyBadge level={course.difficulty} />
                  {course.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="neutral"
                      className="border-0 bg-white/15 text-[9px] text-white backdrop-blur-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3
                  className="mt-2.5 text-[16px] font-bold leading-snug"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#f7eacb",
                  }}
                >
                  {course.title}
                </h3>
              </div>

              <div className="flex flex-1 flex-col px-5 py-4">
                <p
                  className="mb-4 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {course.description}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                      <BookOpenIcon className="size-3" />
                      <span style={{ fontFamily: "var(--font-body)" }}>
                        {t("nLessons", { n: course.lessonCount })}
                      </span>
                    </span>
                    <span
                      className="flex items-center gap-1 text-[12px]"
                      style={{ color: "#ffd23f" }}
                    >
                      <ZapIcon className="size-3" />
                      <span
                        className="font-semibold"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {course.totalXp} XP
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onViewAll}
          >
            <span style={{ fontFamily: "var(--font-body)" }}>
              {t("viewAllCourses")}
            </span>
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
