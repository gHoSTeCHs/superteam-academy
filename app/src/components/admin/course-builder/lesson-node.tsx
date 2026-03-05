"use client";

import { GripVertical, Trash2, Clock, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DifficultyBadge from "@/components/difficulty-badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/course";

interface LessonNodeProps {
  lesson: Lesson;
  courseId: string;
  onDelete: () => void;
}

export function LessonNode({ lesson, courseId, onDelete }: LessonNodeProps) {
  const t = useTranslations("AdminCourse");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2",
        "font-[family-name:var(--font-body)]",
        isDragging && "z-50 opacity-50 shadow-lg",
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
        {lesson.title}
      </span>

      <Badge variant="reward" className="shrink-0">
        {t("lessonXpBadge", { n: lesson.xpReward })}
      </Badge>

      <DifficultyBadge level={lesson.difficulty} />

      <span className="flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
        <Clock className="size-3.5" />
        {t("lessonTimeBadge", { n: lesson.estimatedMinutes })}
      </span>

      {courseId && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-primary"
          asChild
        >
          <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}>
            <Pencil className="size-4" />
            <span className="sr-only">
              {t("editLesson", { title: lesson.title })}
            </span>
          </Link>
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
        <span className="sr-only">
          {t("deleteLesson", { title: lesson.title })}
        </span>
      </Button>
    </div>
  );
}
