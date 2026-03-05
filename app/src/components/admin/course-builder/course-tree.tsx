"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ModuleNode } from "./module-node";
import { AddModuleDialog } from "./add-module-dialog";
import type { Course, Module } from "@/types/course";

interface CourseTreeProps {
  course: Course;
  courseId?: string;
  onChange: (course: Course) => void;
}

export function CourseTree({ course, courseId, onChange }: CourseTreeProps) {
  const t = useTranslations("AdminCourse");
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
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    updateField("tags", tags);
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

    updateField("modules", reordered);
  }

  function handleAddModule(data: Omit<Module, "id" | "sortOrder" | "lessons">) {
    const newModule: Module = {
      ...data,
      id: crypto.randomUUID(),
      sortOrder: course.modules.length,
      lessons: [],
    };
    updateField("modules", [...course.modules, newModule]);
  }

  function handleModuleChange(updated: Module) {
    const modules = course.modules.map((m) =>
      m.id === updated.id ? updated : m,
    );
    updateField("modules", modules);
  }

  function handleModuleDelete(moduleId: string) {
    const modules = course.modules
      .filter((m) => m.id !== moduleId)
      .map((m, idx) => ({ ...m, sortOrder: idx }));
    updateField("modules", modules);
  }

  const moduleIds = course.modules.map((m) => m.id);

  return (
    <div className="space-y-8">
      <section className="space-y-5 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">
          {t("courseDetails")}
        </h2>

        <div className="space-y-2">
          <Label className="text-muted-foreground">{t("fieldTitle")}</Label>
          <Input
            value={course.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder={t("titlePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">
            {t("fieldDescription")}
          </Label>
          <Textarea
            value={course.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("fieldLanguage")}
            </Label>
            <Select
              value={course.language}
              onValueChange={(val: string) =>
                updateField("language", val as Course["language"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">{t("langPortuguese")}</SelectItem>
                <SelectItem value="es">{t("langSpanish")}</SelectItem>
                <SelectItem value="en">{t("langEnglish")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("fieldDifficulty")}
            </Label>
            <Select
              value={course.difficulty ?? "beginner"}
              onValueChange={(val: string) =>
                updateField("difficulty", val as Course["difficulty"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectDifficulty")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t("diffBeginner")}</SelectItem>
                <SelectItem value="intermediate">
                  {t("diffIntermediate")}
                </SelectItem>
                <SelectItem value="advanced">{t("diffAdvanced")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">{t("fieldTags")}</Label>
            <Input
              value={course.tags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder={t("tagsPlaceholder")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">
          {t("modulesSection")}
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
                  courseId={courseId ?? course.id}
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
              {t("noModulesYet")}
            </p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => setModuleDialogOpen(true)}
        >
          <Plus className="size-4" />
          {t("addModule")}
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
