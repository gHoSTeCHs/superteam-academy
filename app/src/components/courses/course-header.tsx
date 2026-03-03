import {
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  ZapIcon,
  LayersIcon,
} from "lucide-react";
import DifficultyBadge from "@/components/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseHeaderProps {
  course: Course;
  difficulty?: "beginner" | "intermediate" | "advanced";
  enrollmentCount?: number;
  className?: string;
}

export function CourseHeader({
  course,
  difficulty = "beginner",
  enrollmentCount = 0,
  className,
}: CourseHeaderProps) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const totalXp = lessons.reduce((sum, l) => sum + l.xpReward, 0);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0);

  return (
    <div className={cn("space-y-6", className)}>
      <div
        className="rounded-2xl px-8 py-10"
        style={{
          background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={difficulty} />
          {course.tags.map((tag) => (
            <Badge
              key={tag}
              variant="neutral"
              className="border-0 bg-white/15 text-[10px] text-white backdrop-blur-sm"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <h1
          className="mt-4 text-[32px] font-bold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
            color: "#f7eacb",
          }}
        >
          {course.title}
        </h1>
        <p
          className="mt-2 max-w-2xl text-[15px] leading-relaxed"
          style={{ color: "rgba(247, 234, 203, 0.8)" }}
        >
          {course.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard
          icon={LayersIcon}
          value={course.modules.length}
          label="Modules"
        />
        <StatCard icon={BookOpenIcon} value={lessons.length} label="Lessons" />
        <StatCard
          icon={ClockIcon}
          value={`${totalMinutes}m`}
          label="Total Time"
        />
        <StatCard icon={ZapIcon} value={totalXp} label="Total XP" />
        <StatCard icon={UsersIcon} value={enrollmentCount} label="Enrolled" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3">
      <Icon className="mb-1 size-4 text-muted-foreground" />
      <span
        className="text-[16px] font-bold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
      <span
        className="text-[11px] text-muted-foreground"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
    </div>
  );
}
