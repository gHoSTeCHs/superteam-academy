"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Rocket, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseTree } from "@/components/admin/course-builder";
import {
  updateCourse,
  publishCourse,
  unpublishCourse,
  createModule,
  deleteModule,
  createLesson,
  deleteLesson,
  reorderModules,
  reorderLessons,
} from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";
import type { Course, Module } from "@/types/course";

interface EditCourseClientProps {
  initialCourse: Course & { isPublished: boolean; difficulty?: string };
  courseId: string;
}

type CourseState = Course & { isPublished: boolean; difficulty?: string };

export function EditCourseClient({
  initialCourse,
  courseId,
}: EditCourseClientProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseState>(initialCourse);
  const [isPending, startTransition] = useTransition();
  const initialRef = useRef(initialCourse);

  async function syncTree(current: typeof initialCourse) {
    const initial = initialRef.current;
    const initialModuleIds = new Set(initial.modules.map((m) => m.id));
    const currentModuleIds = new Set(current.modules.map((m) => m.id));

    const deletedModules = initial.modules.filter(
      (m) => !currentModuleIds.has(m.id),
    );
    for (const mod of deletedModules) {
      await deleteModule(courseId, mod.id);
    }

    const newModuleIdMap = new Map<string, string>();
    for (const mod of current.modules) {
      if (!initialModuleIds.has(mod.id)) {
        const result = await createModule(courseId, {
          title: mod.title,
          description: mod.description,
          type: mod.type,
        });
        newModuleIdMap.set(mod.id, result._id);
      }
    }

    for (const mod of current.modules) {
      const realModuleId = newModuleIdMap.get(mod.id) ?? mod.id;
      if (initialModuleIds.has(mod.id)) {
        const initialMod = initial.modules.find(
          (m) => m.id === mod.id,
        ) as Module;
        const initialLessonIds = new Set(initialMod.lessons.map((l) => l.id));
        const currentLessonIds = new Set(mod.lessons.map((l) => l.id));

        const deletedLessons = initialMod.lessons.filter(
          (l) => !currentLessonIds.has(l.id),
        );
        for (const lesson of deletedLessons) {
          await deleteLesson(realModuleId, lesson.id, courseId);
        }

        const newLessonIdMap = new Map<string, string>();
        for (const lesson of mod.lessons) {
          if (!initialLessonIds.has(lesson.id)) {
            const result = await createLesson(
              realModuleId,
              {
                title: lesson.title,
                xp: lesson.xpReward,
                estimatedMinutes: lesson.estimatedMinutes,
                difficulty: lesson.difficulty,
              },
              courseId,
            );
            newLessonIdMap.set(lesson.id, result._id);
          }
        }

        const allLessonIds = mod.lessons.map(
          (l) => newLessonIdMap.get(l.id) ?? l.id,
        );
        const initialOrder = initialMod.lessons
          .filter((l) => currentLessonIds.has(l.id))
          .map((l) => l.id);
        if (JSON.stringify(allLessonIds) !== JSON.stringify(initialOrder)) {
          await reorderLessons(realModuleId, allLessonIds, courseId);
        }
      } else {
        for (const lesson of mod.lessons) {
          await createLesson(
            realModuleId,
            {
              title: lesson.title,
              xp: lesson.xpReward,
              estimatedMinutes: lesson.estimatedMinutes,
              difficulty: lesson.difficulty,
            },
            courseId,
          );
        }
      }
    }

    const finalModuleIds = current.modules.map(
      (m) => newModuleIdMap.get(m.id) ?? m.id,
    );
    if (finalModuleIds.length > 0) {
      await reorderModules(courseId, finalModuleIds);
    }
  }

  function handleSave() {
    startTransition(async () => {
      await syncTree(course);
      await updateCourse(courseId, {
        title: course.title,
        description: course.description,
        language: course.language,
        tags: course.tags,
        difficulty: course.difficulty ?? initialCourse.difficulty,
      });
      initialRef.current = course;
      router.refresh();
    });
  }

  function handlePublishToggle() {
    startTransition(async () => {
      if (course.isPublished) {
        await unpublishCourse(courseId);
        setCourse((prev) => ({ ...prev, isPublished: false }));
      } else {
        await publishCourse(courseId);
        setCourse((prev) => ({ ...prev, isPublished: true }));
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Edit Course
          </h1>
          <Badge variant={course.isPublished ? "primary" : "neutral"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${courseId}/preview`}>
              <Eye className="size-4" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublishToggle}
            disabled={isPending}
          >
            {course.isPublished ? (
              <X className="size-4" />
            ) : (
              <Rocket className="size-4" />
            )}
            {course.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <CourseTree
        course={course}
        courseId={courseId}
        onChange={(updated) =>
          setCourse({
            ...updated,
            isPublished: course.isPublished,
            difficulty: course.difficulty,
          })
        }
      />
    </div>
  );
}
