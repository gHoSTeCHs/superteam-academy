"use client";

import { Link } from "@/i18n/navigation";
import { BookOpenIcon, ClockIcon, UsersIcon, ZapIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import DifficultyBadge from "@/components/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  slug?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  enrollmentCount?: number;
  progress?: number;
  className?: string;
}

function computeStats(course: Course) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  return {
    moduleCount: course.modules.length,
    lessonCount: lessons.length,
    totalXp: lessons.reduce((sum, l) => sum + l.xpReward, 0),
    totalMinutes: lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0),
  };
}

export function CourseCard({
  course,
  slug,
  difficulty,
  enrollmentCount = 0,
  progress,
  className,
}: CourseCardProps) {
  const stats = computeStats(course);
  const href = slug ? `/courses/${slug}` : "#";
  const resolvedDifficulty =
    difficulty ?? course.modules[0]?.lessons[0]?.difficulty ?? "beginner";

  return (
    <Link href={href} className={cn("group block", className)}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <div
          className="relative flex flex-col justify-end px-5 py-6"
          style={{
            background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
            minHeight: "140px",
          }}
        >
          {course.thumbnail && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${course.thumbnail})` }}
            />
          )}
          <div className="relative z-10 flex items-center gap-2">
            <DifficultyBadge level={resolvedDifficulty} />
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
            className="relative z-10 mt-3 text-[18px] font-bold leading-tight text-cream"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
              color: "#f7eacb",
            }}
          >
            {course.title}
          </h3>
        </div>

        <div className="px-5 py-4">
          <p
            className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {course.description}
          </p>

          {typeof progress === "number" && (
            <div className="mb-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className="font-medium text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Progress
                </span>
                <span
                  className="font-semibold text-primary"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #2f6b3f, #008c4c)",
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 border-t border-border pt-3">
            <Stat
              icon={BookOpenIcon}
              value={stats.lessonCount}
              label="Lessons"
            />
            <Stat
              icon={ClockIcon}
              value={`${stats.totalMinutes}m`}
              label="Time"
            />
            <Stat icon={ZapIcon} value={stats.totalXp} label="XP" />
            <Stat icon={UsersIcon} value={enrollmentCount} label="Enrolled" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        <Icon className="size-3 text-muted-foreground" />
        <span
          className="text-[12px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {value}
        </span>
      </div>
      <p
        className="text-[10px] text-muted-foreground"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </p>
    </div>
  );
}
