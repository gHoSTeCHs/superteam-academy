'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { ModuleNode } from './module-node';
import { AddModuleDialog } from './add-module-dialog';
import type { Course, Module } from '@/types/course';

interface CourseTreeProps {
  course: Course;
  onChange: (course: Course) => void;
}

export function CourseTree({ course, onChange }: CourseTreeProps) {
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function updateField<K extends keyof Course>(key: K, value: Course[K]) {
    onChange({ ...course, [key]: value });
  }

  function handleTagsChange(raw: string) {
    const tags = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    updateField('tags', tags);
  }

  function handleModuleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(course.modules, oldIndex, newIndex).map(
      (mod, idx) => ({ ...mod, sortOrder: idx }),
    );

    updateField('modules', reordered);
  }

  function handleAddModule(data: Omit<Module, 'id' | 'sortOrder' | 'lessons'>) {
    const newModule: Module = {
      ...data,
      id: crypto.randomUUID(),
      sortOrder: course.modules.length,
      lessons: [],
    };
    updateField('modules', [...course.modules, newModule]);
  }

  function handleModuleChange(updated: Module) {
    const modules = course.modules.map((m) =>
      m.id === updated.id ? updated : m,
    );
    updateField('modules', modules);
  }

  function handleModuleDelete(moduleId: string) {
    const modules = course.modules
      .filter((m) => m.id !== moduleId)
      .map((m, idx) => ({ ...m, sortOrder: idx }));
    updateField('modules', modules);
  }

  const moduleIds = course.modules.map((m) => m.id);

  return (
    <div className="space-y-8">
      <section className="space-y-5 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">
          Course Details
        </h2>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Title</Label>
          <Input
            value={course.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Course title"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Description</Label>
          <Textarea
            value={course.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="What will students learn?"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Language</Label>
            <Select
              value={course.language}
              onValueChange={(val: string) =>
                updateField('language', val as Course['language'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Tags</Label>
            <Input
              value={course.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="solana, web3, defi"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">
          Modules
        </h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext
            items={moduleIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {course.modules.map((mod) => (
                <ModuleNode
                  key={mod.id}
                  module={mod}
                  onChange={handleModuleChange}
                  onDelete={() => handleModuleDelete(mod.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {course.modules.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
            <p className="text-[14px] text-muted-foreground font-[family-name:var(--font-body)]">
              No modules yet. Add one to get started.
            </p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => setModuleDialogOpen(true)}
        >
          <Plus className="size-4" />
          Add Module
        </Button>

        <AddModuleDialog
          open={moduleDialogOpen}
          onOpenChange={setModuleDialogOpen}
          onAdd={handleAddModule}
        />
      </section>
    </div>
  );
}
