"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpenIcon, Pencil, Eye, Rocket, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { EmptyState } from "@/components/admin/empty-state";
import {
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";

interface AdminCourse {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  difficulty: string;
  language: string;
  _createdAt: string;
  moduleCount: number;
  lessonCount: number;
}

interface CoursesListClientProps {
  courses: AdminCourse[];
}

export function CoursesListClient({ courses }: CoursesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchTerm = searchParams.get("search") ?? "";
  const filtered = searchTerm
    ? courses.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : courses;

  function handlePublish(id: string) {
    startTransition(async () => {
      await publishCourse(id);
      router.refresh();
    });
  }

  function handleUnpublish(id: string) {
    startTransition(async () => {
      await unpublishCourse(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this course and all its modules/lessons?")) return;
    startTransition(async () => {
      await deleteCourse(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        action={{ label: "New Course", href: "/admin/courses/new" }}
      />

      <Card>
        <div className="border-b border-border px-4 py-3">
          <SearchInput placeholder="Search courses..." />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Modules</TableHead>
              <TableHead className="text-center">Lessons</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48">
                  <EmptyState
                    icon={BookOpenIcon}
                    title="No courses found"
                    description="Create your first course to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((course) => (
                <TableRow
                  key={course._id}
                  className={isPending ? "opacity-60" : ""}
                >
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? "primary" : "neutral"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {course.moduleCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {course.lessonCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(course._createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/admin/courses/${course._id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/admin/courses/${course._id}/preview`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          course.isPublished
                            ? handleUnpublish(course._id)
                            : handlePublish(course._id)
                        }
                        disabled={isPending}
                      >
                        {course.isPublished ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Rocket className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(course._id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
