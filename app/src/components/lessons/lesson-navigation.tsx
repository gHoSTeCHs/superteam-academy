"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonNavigationProps {
  moduleName: string;
  currentLesson: number;
  totalLessons: number;
  lessonTitle: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  className?: string;
}

export function LessonNavigation({
  moduleName,
  currentLesson,
  totalLessons,
  lessonTitle,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  className,
}: LessonNavigationProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span style={{ fontFamily: "var(--font-body)" }}>{moduleName}</span>
        <ChevronRightIcon className="size-3" />
        <span
          className="font-medium text-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Lesson {currentLesson} of {totalLessons}
        </span>
      </div>

      <h1
        className="text-[24px] font-bold leading-tight text-foreground"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {lessonTitle}
      </h1>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="gap-1"
        >
          <ChevronLeftIcon className="size-4" />
          <span style={{ fontFamily: "var(--font-body)" }}>Previous</span>
        </Button>

        <span
          className="text-[12px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {currentLesson} / {totalLessons}
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={!hasNext}
          onClick={onNext}
          className="gap-1"
        >
          <span style={{ fontFamily: "var(--font-body)" }}>Next</span>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
