"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  PlayCircleIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  CheckCircle2Icon,
  CircleIcon,
  ZapIcon,
  ClockIcon,
} from "lucide-react";
import DifficultyBadge from "@/components/difficulty-badge";
import { cn } from "@/lib/utils";
import type { Module, ModuleType } from "@/types/course";

const moduleTypeIcons: Record<
  ModuleType,
  React.ComponentType<{ className?: string }>
> = {
  text: FileTextIcon,
  video: PlayCircleIcon,
  assessment: ClipboardCheckIcon,
};

interface ModuleListProps {
  modules: Module[];
  completedLessons?: Set<string>;
  onLessonClick?: (moduleId: string, lessonId: string) => void;
  className?: string;
}

export function ModuleList({
  modules,
  completedLessons = new Set(),
  onLessonClick,
  className,
}: ModuleListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const first = modules[0]?.id;
    return first ? new Set([first]) : new Set();
  });

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      {modules.map((mod, index) => {
        const isExpanded = expandedModules.has(mod.id);
        const ModIcon = moduleTypeIcons[mod.type] ?? FileTextIcon;
        const completedCount = mod.lessons.filter((l) =>
          completedLessons.has(l.id),
        ).length;
        const allComplete = completedCount === mod.lessons.length;

        return (
          <div
            key={mod.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <button
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  allComplete
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <ModIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Module {index + 1}
                  </span>
                  {allComplete && (
                    <CheckCircle2Icon className="size-3.5 text-primary" />
                  )}
                </div>
                <h4
                  className="truncate text-[14px] font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {mod.title}
                </h4>
              </div>
              <span
                className="shrink-0 text-[12px] text-muted-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {completedCount}/{mod.lessons.length}
              </span>
              <ChevronDownIcon
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            </button>

            {isExpanded && (
              <div className="border-t border-border">
                {mod.description && (
                  <p
                    className="px-5 pt-3 text-[13px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {mod.description}
                  </p>
                )}
                <ul className="px-3 py-2">
                  {mod.lessons.map((lesson, lessonIndex) => {
                    const isComplete = completedLessons.has(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => onLessonClick?.(mod.id, lesson.id)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                        >
                          {isComplete ? (
                            <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                          ) : (
                            <CircleIcon className="size-4 shrink-0 text-border" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "truncate text-[13px] font-medium",
                                isComplete
                                  ? "text-muted-foreground"
                                  : "text-foreground",
                              )}
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <DifficultyBadge level={lesson.difficulty} />
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <ClockIcon className="size-3" />
                              {lesson.estimatedMinutes}m
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <ZapIcon className="size-3" />
                              {lesson.xpReward}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
