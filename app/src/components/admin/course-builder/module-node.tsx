'use client';

import { useState } from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LessonNode } from './lesson-node';
import { AddLessonDialog } from './add-lesson-dialog';
import type { Module, Lesson, ModuleType } from '@/types/course';

interface ModuleNodeProps {
  module: Module;
  onChange: (module: Module) => void;
  onDelete: () => void;
}

const MODULE_TYPE_VARIANT: Record<ModuleType, 'primary' | 'reward' | 'danger'> = {
  text: 'primary',
  video: 'reward',
  assessment: 'danger',
};

export function ModuleNode({ module, onChange, onDelete }: ModuleNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleLessonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
    const newIndex = module.lessons.findIndex((l) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(module.lessons, oldIndex, newIndex).map(
      (lesson, idx) => ({ ...lesson, sortOrder: idx }),
    );

    onChange({ ...module, lessons: reordered });
  }

  function handleAddLesson(data: Omit<Lesson, 'id' | 'sortOrder'>) {
    const newLesson: Lesson = {
      ...data,
      id: crypto.randomUUID(),
      sortOrder: module.lessons.length,
    };
    onChange({ ...module, lessons: [...module.lessons, newLesson] });
  }

  function handleDeleteLesson(lessonId: string) {
    const updated = module.lessons
      .filter((l) => l.id !== lessonId)
      .map((l, idx) => ({ ...l, sortOrder: idx }));
    onChange({ ...module, lessons: updated });
  }

  const lessonIds = module.lessons.map((l) => l.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border bg-card',
        isDragging && 'z-50 opacity-50 shadow-lg',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <Badge variant={MODULE_TYPE_VARIANT[module.type]} className="shrink-0 uppercase">
          {module.type}
        </Badge>

        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold font-[family-name:var(--font-display)]">
          {module.title}
        </span>

        <span className="shrink-0 text-[12px] text-muted-foreground">
          {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          <span className="sr-only">
            {expanded ? 'Collapse' : 'Expand'} module
          </span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete module {module.title}</span>
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border px-4 py-3">
          {module.description && (
            <p className="text-[13px] leading-relaxed text-muted-foreground font-[family-name:var(--font-body)]">
              {module.description}
            </p>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={lessonIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    onDelete={() => handleDeleteLesson(lesson.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLessonDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add Lesson
          </Button>

          <AddLessonDialog
            open={lessonDialogOpen}
            onOpenChange={setLessonDialogOpen}
            onAdd={handleAddLesson}
          />
        </div>
      )}
    </div>
  );
}
