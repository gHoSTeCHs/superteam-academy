"use client";

import {
  BookOpenIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminCourseRow {
  id: string;
  title: string;
  status: "published" | "draft";
  modules: number;
  lessons: number;
  enrollments: number;
  createdAt: string;
}

interface CourseTableProps {
  courses: AdminCourseRow[];
  className?: string;
}

export function CourseTable({ courses, className }: CourseTableProps) {
  const t = useTranslations("AdminCourse");
  const tCommon = useTranslations("AdminCommon");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {[
                t("colTitle"),
                t("colStatus"),
                t("colModules"),
                t("colLessons"),
                t("colEnrolled"),
                t("colCreated"),
                "",
              ].map((h, idx) => (
                <th
                  key={h || `actions-${String(idx)}`}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpenIcon className="size-4 text-primary" />
                    </div>
                    <span
                      className="text-[13px] font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {course.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      course.status === "published" ? "primary" : "neutral"
                    }
                    className="text-[10px]"
                  >
                    {course.status === "published"
                      ? tCommon("statusPublished")
                      : tCommon("statusDraft")}
                  </Badge>
                </td>
                <td
                  className="px-4 py-3 text-[13px] text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {course.modules}
                </td>
                <td
                  className="px-4 py-3 text-[13px] text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {course.lessons}
                </td>
                <td
                  className="px-4 py-3 text-[13px] text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {course.enrollments}
                </td>
                <td
                  className="px-4 py-3 text-[13px] text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {course.createdAt}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title={t("actionEdit")}
                    >
                      <EditIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title={t("actionPreview")}
                    >
                      <EyeIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title={
                        course.status === "published"
                          ? t("actionUnpublish")
                          : t("actionPublish")
                      }
                    >
                      {course.status === "published" ? (
                        <ArrowDownCircleIcon className="size-3.5" />
                      ) : (
                        <ArrowUpCircleIcon className="size-3.5 text-primary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-500 hover:text-red-600"
                      title={t("actionDelete")}
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
