"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Rocket, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseTree } from "@/components/admin/course-builder";
import {
  updateCourse,
  publishCourse,
  unpublishCourse,
} from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/types/course";

interface EditCourseClientProps {
  initialCourse: Course & { isPublished: boolean };
  courseId: string;
}

export function EditCourseClient({
  initialCourse,
  courseId,
}: EditCourseClientProps) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateCourse(courseId, {
        title: course.title,
        description: course.description,
        language: course.language,
        tags: course.tags,
      });
      router.refresh();
    });
  }

  function handlePublishToggle() {
    startTransition(async () => {
      if (initialCourse.isPublished) {
        await unpublishCourse(courseId);
      } else {
        await publishCourse(courseId);
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
          <Badge variant={initialCourse.isPublished ? "primary" : "neutral"}>
            {initialCourse.isPublished ? "Published" : "Draft"}
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
            {initialCourse.isPublished ? (
              <X className="size-4" />
            ) : (
              <Rocket className="size-4" />
            )}
            {initialCourse.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <CourseTree
        course={course}
        onChange={(updated) =>
          setCourse({ ...updated, isPublished: course.isPublished })
        }
      />
    </div>
  );
}
