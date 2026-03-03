"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseTree } from "@/components/admin/course-builder";
import { createCourse, createModule, createLesson } from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/types/course";

const EMPTY_COURSE: Course = {
  id: "",
  title: "",
  description: "",
  language: "en",
  tags: [],
  modules: [],
};

export function NewCourseClient() {
  const router = useRouter();
  const [course, setCourse] = useState<Course>(EMPTY_COURSE);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!course.title.trim()) return;

    startTransition(async () => {
      const { _id: courseId } = await createCourse({
        title: course.title,
        description: course.description,
        language: course.language,
        tags: course.tags,
      });

      for (const mod of course.modules) {
        const { _id: moduleId } = await createModule(courseId, {
          title: mod.title,
          description: mod.description,
          type: mod.type,
        });

        for (const lesson of mod.lessons) {
          await createLesson(moduleId, {
            title: lesson.title,
            xp: lesson.xpReward,
            estimatedMinutes: lesson.estimatedMinutes,
            difficulty: lesson.difficulty,
          });
        }
      }

      router.push(`/admin/courses/${courseId}/edit`);
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
            New Course
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending || !course.title.trim()}
        >
          <Save className="size-4" />
          {isPending ? "Creating..." : "Create Course"}
        </Button>
      </div>
      <CourseTree course={course} onChange={setCourse} />
    </div>
  );
}
