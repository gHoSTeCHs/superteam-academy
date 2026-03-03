# Phase 5: Admin Pages — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build admin dashboard, course CRUD, lesson content editor, and preview mode — all under `(admin)/admin/` with Sanity write API and Server Actions.

**Architecture:** Server-first pages fetch data via Sanity/Drizzle/Helius, pass to client components for interactivity. Mutations use Next.js Server Actions in `app/src/sanity/mutations.ts`. Auth gated by existing admin layout.

**Tech Stack:** Sanity write API (`@sanity/client`), existing admin components (DataTable, CourseTree, BlockList, question builders), Drizzle ORM, Helius RPC, Next.js Server Actions.

---

## Task 0: Schema Fixes

**Files:**
- Modify: `app/src/sanity/schemas/course.ts`
- Modify: `app/src/sanity/schemas/module.ts`

**Step 1: Add missing fields to course schema**

```typescript
/* app/src/sanity/schemas/course.ts */
import { defineType, defineField } from "sanity";

export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: { list: ["en", "pt-BR", "es"] },
      initialValue: "en",
    }),
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: { list: ["beginner", "intermediate", "advanced"] },
      initialValue: "beginner",
    }),
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "modules",
      title: "Modules",
      type: "array",
      of: [{ type: "reference", to: [{ type: "module" }] }],
    }),
  ],
});
```

**Step 2: Add description field to module schema**

```typescript
/* app/src/sanity/schemas/module.ts */
import { defineType, defineField } from "sanity";

export const module = defineType({
  name: "module",
  title: "Module",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: ["text", "video", "assessment"] },
      initialValue: "text",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "lessons",
      title: "Lessons",
      type: "array",
      of: [{ type: "reference", to: [{ type: "lesson" }] }],
    }),
  ],
});
```

**Step 3: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds (schema changes are runtime, not compile-time)

**Step 4: Commit**

```bash
git add app/src/sanity/schemas/course.ts app/src/sanity/schemas/module.ts
git commit -m "feat(admin): add isPublished, publishedAt, difficulty to course schema; description to module"
```

---

## Task 1: Sanity Write Client + Mutations

**Files:**
- Modify: `app/src/sanity/client.ts`
- Create: `app/src/sanity/mutations.ts`
- Modify: `app/src/sanity/queries.ts`

**Step 1: Add write client to `client.ts`**

Add a `writeClient` that uses the `SANITY_API_TOKEN` env var. This is server-only — it must never be imported from client components.

```typescript
/* app/src/sanity/client.ts — full file */
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: "previewDrafts",
});

export async function safeFetch<T>(
  query: string,
  params?: Record<string, string>,
): Promise<T | null> {
  if (!projectId || projectId === "placeholder") return null;
  try {
    return params
      ? await client.fetch<T>(query, params)
      : await client.fetch<T>(query);
  } catch {
    return null;
  }
}
```

**Step 2: Add admin GROQ queries to `queries.ts`**

Append these to the existing file:

```typescript
export const adminCoursesQuery = groq`
  *[_type == "course"] | order(_createdAt desc) {
    "_id": _id,
    title,
    "slug": slug.current,
    description,
    isPublished,
    publishedAt,
    difficulty,
    language,
    _createdAt,
    "moduleCount": count(modules),
    "lessonCount": count(modules[]->lessons[])
  }
`;

export const adminCourseByIdQuery = groq`
  *[_type == "course" && _id == $id][0] {
    "_id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    difficulty,
    isPublished,
    publishedAt,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "_id": _id,
      title,
      description,
      type,
      "order": order,
      lessons[]-> {
        "_id": _id,
        title,
        "slug": slug.current,
        "xp": coalesce(xp, 0),
        estimatedMinutes,
        difficulty
      }
    }
  }
`;

export const adminLessonByIdQuery = groq`
  *[_type == "lesson" && _id == $id][0] {
    "_id": _id,
    title,
    "slug": slug.current,
    "xp": coalesce(xp, 0),
    estimatedMinutes,
    difficulty,
    contentBlocks[] {
      _key,
      blockType,
      textContent,
      language,
      code,
      filename,
      starterCode,
      solutionCode,
      hints,
      quizQuestion,
      quizOptions,
      calloutType,
      calloutTitle,
      calloutContent,
      "imageUrl": image.asset->url,
      alt,
      caption,
      videoUrl,
      videoTitle
    }
  }
`;
```

**Step 3: Create mutations file with Server Actions**

```typescript
/* app/src/sanity/mutations.ts */
"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "./client";
import { getServerSession } from "@/lib/auth-server";

async function requireAuth() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  language?: string;
  difficulty?: string;
  tags?: string[];
}

export async function createCourse(input: CreateCourseInput) {
  await requireAuth();
  const doc = await writeClient.create({
    _type: "course",
    title: input.title,
    slug: { _type: "slug", current: input.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") },
    description: input.description ?? "",
    language: input.language ?? "en",
    difficulty: input.difficulty ?? "beginner",
    isPublished: false,
    tags: input.tags ?? [],
    modules: [],
  });
  revalidatePath("/admin/courses");
  return { _id: doc._id };
}

export async function updateCourse(id: string, patch: Record<string, unknown>) {
  await requireAuth();
  await writeClient.patch(id).set(patch).commit();
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}/edit`);
}

export async function publishCourse(id: string) {
  await requireAuth();
  await writeClient
    .patch(id)
    .set({ isPublished: true, publishedAt: new Date().toISOString() })
    .commit();
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function unpublishCourse(id: string) {
  await requireAuth();
  await writeClient.patch(id).set({ isPublished: false }).commit();
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function deleteCourse(id: string) {
  await requireAuth();
  const course = await writeClient.fetch<{ modules: { _ref: string }[] }>(
    `*[_type == "course" && _id == $id][0]{ "modules": modules[]{ _ref } }`,
    { id },
  );
  if (course?.modules) {
    for (const mod of course.modules) {
      const moduleDoc = await writeClient.fetch<{ lessons: { _ref: string }[] }>(
        `*[_type == "module" && _id == $ref][0]{ "lessons": lessons[]{ _ref } }`,
        { ref: mod._ref },
      );
      if (moduleDoc?.lessons) {
        for (const lesson of moduleDoc.lessons) {
          await writeClient.delete(lesson._ref);
        }
      }
      await writeClient.delete(mod._ref);
    }
  }
  await writeClient.delete(id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  type?: string;
}

export async function createModule(courseId: string, input: CreateModuleInput) {
  await requireAuth();
  const doc = await writeClient.create({
    _type: "module",
    title: input.title,
    description: input.description ?? "",
    type: input.type ?? "text",
    order: 0,
    lessons: [],
  });
  await writeClient
    .patch(courseId)
    .setIfMissing({ modules: [] })
    .append("modules", [{ _type: "reference", _ref: doc._id, _key: doc._id }])
    .commit();
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return { _id: doc._id };
}

export async function updateModule(id: string, patch: Record<string, unknown>) {
  await requireAuth();
  await writeClient.patch(id).set(patch).commit();
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAuth();
  const moduleDoc = await writeClient.fetch<{ lessons: { _ref: string }[] }>(
    `*[_type == "module" && _id == $id][0]{ "lessons": lessons[]{ _ref } }`,
    { id: moduleId },
  );
  if (moduleDoc?.lessons) {
    for (const lesson of moduleDoc.lessons) {
      await writeClient.delete(lesson._ref);
    }
  }
  await writeClient
    .patch(courseId)
    .unset([`modules[_ref == "${moduleId}"]`])
    .commit();
  await writeClient.delete(moduleId);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export interface CreateLessonInput {
  title: string;
  xp?: number;
  estimatedMinutes?: number;
  difficulty?: string;
}

export async function createLesson(moduleId: string, input: CreateLessonInput) {
  await requireAuth();
  const doc = await writeClient.create({
    _type: "lesson",
    title: input.title,
    slug: { _type: "slug", current: input.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") },
    xp: input.xp ?? 0,
    estimatedMinutes: input.estimatedMinutes ?? 10,
    difficulty: input.difficulty ?? "beginner",
    contentBlocks: [],
  });
  await writeClient
    .patch(moduleId)
    .setIfMissing({ lessons: [] })
    .append("lessons", [{ _type: "reference", _ref: doc._id, _key: doc._id }])
    .commit();
  return { _id: doc._id };
}

export async function deleteLesson(moduleId: string, lessonId: string) {
  await requireAuth();
  await writeClient
    .patch(moduleId)
    .unset([`lessons[_ref == "${lessonId}"]`])
    .commit();
  await writeClient.delete(lessonId);
}

export async function updateLessonContentBlocks(
  lessonId: string,
  contentBlocks: Record<string, unknown>[],
) {
  await requireAuth();
  await writeClient.patch(lessonId).set({ contentBlocks }).commit();
}

export async function uploadAsset(formData: FormData) {
  await requireAuth();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");
  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await writeClient.assets.upload("image", buffer, {
    filename: file.name,
    contentType: file.type,
  });
  return { url: asset.url, assetId: asset._id };
}
```

**Step 4: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add app/src/sanity/client.ts app/src/sanity/mutations.ts app/src/sanity/queries.ts
git commit -m "feat(admin): add Sanity write client, server action mutations, and admin GROQ queries"
```

---

## Task 2: Admin Dashboard (Task 22)

**Files:**
- Modify: `app/src/app/[locale]/(admin)/admin/page.tsx`

**Step 1: Wire real data into admin dashboard**

The `AdminDashboard` component already accepts `stats` and `recentActivity` props with sensible defaults. We just need the server page to fetch real data and pass it.

```typescript
/* app/src/app/[locale]/(admin)/admin/page.tsx */
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { safeFetch } from "@/sanity/client";
import { groq } from "next-sanity";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { count } from "drizzle-orm";

interface SanityStats {
  total: number;
  published: number;
  draft: number;
}

interface RecentCourse {
  _id: string;
  title: string;
  _createdAt: string;
  isPublished: boolean;
}

async function getCourseStats(): Promise<SanityStats> {
  try {
    const result = await safeFetch<SanityStats>(groq`{
      "total": count(*[_type == "course"]),
      "published": count(*[_type == "course" && isPublished == true]),
      "draft": count(*[_type == "course" && (isPublished == false || !defined(isPublished))])
    }`);
    return result ?? { total: 0, published: 0, draft: 0 };
  } catch {
    return { total: 0, published: 0, draft: 0 };
  }
}

async function getUserCount(): Promise<number> {
  try {
    const result = await db.select({ value: count() }).from(user);
    return result[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

async function getRecentActivity(): Promise<RecentCourse[]> {
  try {
    const result = await safeFetch<RecentCourse[]>(groq`
      *[_type == "course"] | order(_createdAt desc)[0...5] {
        "_id": _id,
        title,
        _createdAt,
        isPublished
      }
    `);
    return result ?? [];
  } catch {
    return [];
  }
}

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${String(hours)} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${String(days)} day${days === 1 ? "" : "s"} ago`;
}

export default async function AdminPage() {
  const [courseStats, userCount, recentCourses] = await Promise.all([
    getCourseStats(),
    getUserCount(),
    getRecentActivity(),
  ]);

  const stats = {
    totalCourses: courseStats.total,
    publishedCourses: courseStats.published,
    draftCourses: courseStats.draft,
    totalEnrollments: 0,
    totalUsers: userCount,
    totalXpAwarded: 0,
  };

  const recentActivity = recentCourses.map((c) => ({
    id: c._id,
    action: c.isPublished ? "Published" : "Created",
    target: c.title,
    timestamp: formatRelativeTime(c._createdAt),
  }));

  return <AdminDashboard stats={stats} recentActivity={recentActivity} />;
}
```

**Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds, `/admin` registered as dynamic route

**Step 3: Commit**

```bash
git add app/src/app/[locale]/(admin)/admin/page.tsx
git commit -m "feat(admin): wire real stats to admin dashboard"
```

---

## Task 3: Course List Page (Task 23a)

**Files:**
- Create: `app/src/app/[locale]/(admin)/admin/courses/page.tsx`
- Create: `app/src/app/[locale]/(admin)/admin/courses/courses-list-client.tsx`

**Step 1: Create server page**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/page.tsx */
import { safeFetch } from "@/sanity/client";
import { adminCoursesQuery } from "@/sanity/queries";
import { CoursesListClient } from "./courses-list-client";

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

export default async function AdminCoursesPage() {
  const courses = await safeFetch<AdminCourse[]>(adminCoursesQuery);
  return <CoursesListClient courses={courses ?? []} />;
}
```

**Step 2: Create client component**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/courses-list-client.tsx */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { RowActions } from "@/components/admin/row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/empty-state";
import { publishCourse, unpublishCourse, deleteCourse } from "@/sanity/mutations";
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
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

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
      <PageHeader title="Courses">
        <Link href="/admin/courses/new">
          <Button>
            <PlusIcon className="size-4" />
            New Course
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <div className="border-b border-border px-4 py-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search courses..."
          />
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
                <TableRow key={course._id} className={isPending ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? "primary" : "neutral"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{course.moduleCount}</TableCell>
                  <TableCell className="text-center">{course.lessonCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(course._createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      actions={[
                        { label: "Edit", href: `/admin/courses/${course._id}/edit` },
                        { label: "Preview", href: `/admin/courses/${course._id}/preview` },
                        {
                          label: course.isPublished ? "Unpublish" : "Publish",
                          onClick: () =>
                            course.isPublished
                              ? handleUnpublish(course._id)
                              : handlePublish(course._id),
                        },
                        {
                          label: "Delete",
                          onClick: () => handleDelete(course._id),
                          variant: "destructive",
                        },
                      ]}
                    />
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
```

**Important notes for the implementer:**
- Check `RowActions` props — it may use `actions` array with `{ label, href?, onClick?, icon?, variant? }`. Read `app/src/components/admin/row-actions.tsx` to confirm the exact interface and adapt accordingly.
- Check `SearchInput` props — it may use URL params instead of `value`/`onChange`. Read `app/src/components/admin/search-input.tsx` to confirm. If it syncs to `?search=` URL param, use a simpler approach with the server-side search param, or use the component as-is and filter client-side.
- Check `PageHeader` — it renders an optional `children` prop as the action area. Read `app/src/components/admin/page-header.tsx` to confirm.

**Step 3: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds, `/admin/courses` registered

**Step 4: Commit**

```bash
git add app/src/app/[locale]/(admin)/admin/courses/
git commit -m "feat(admin): add course list page with search, publish/delete actions"
```

---

## Task 4: New Course Page (Task 23b)

**Files:**
- Create: `app/src/app/[locale]/(admin)/admin/courses/new/page.tsx`
- Create: `app/src/app/[locale]/(admin)/admin/courses/new/new-course-client.tsx`

**Step 1: Create server page**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/new/page.tsx */
import { NewCourseClient } from "./new-course-client";

export default function NewCoursePage() {
  return <NewCourseClient />;
}
```

**Step 2: Create client component**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/new/new-course-client.tsx */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { CourseTree } from "@/components/admin/course-builder";
import { createCourse, createModule, createLesson } from "@/sanity/mutations";
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
      <PageHeader title="New Course">
        <Button onClick={handleSave} disabled={isPending || !course.title.trim()}>
          <Save className="size-4" />
          {isPending ? "Creating..." : "Create Course"}
        </Button>
      </PageHeader>
      <CourseTree course={course} onChange={setCourse} />
    </div>
  );
}
```

**Step 3: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/src/app/[locale]/(admin)/admin/courses/new/
git commit -m "feat(admin): add new course creation page with CourseTree"
```

---

## Task 5: Edit Course Page (Task 23c)

**Files:**
- Create: `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/page.tsx`
- Create: `app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx`

**Step 1: Create server page**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/edit/page.tsx */
import { notFound } from "next/navigation";
import { safeFetch } from "@/sanity/client";
import { adminCourseByIdQuery } from "@/sanity/queries";
import { EditCourseClient } from "./edit-course-client";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

interface SanityCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  difficulty: string;
  isPublished: boolean;
  thumbnail: string | null;
  tags: string[];
  modules: {
    _id: string;
    title: string;
    description: string;
    type: string;
    order: number;
    lessons: {
      _id: string;
      title: string;
      slug: string;
      xp: number;
      estimatedMinutes: number;
      difficulty: string;
    }[];
  }[];
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const raw = await safeFetch<SanityCourse | null>(adminCourseByIdQuery, { id });
  if (!raw) notFound();

  const course = {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description ?? "",
    language: raw.language as "en" | "pt-BR" | "es",
    thumbnail: raw.thumbnail ?? undefined,
    tags: raw.tags ?? [],
    isPublished: raw.isPublished ?? false,
    modules: (raw.modules ?? []).map((m, mi) => ({
      id: m._id,
      title: m.title,
      description: m.description ?? "",
      type: m.type as "text" | "video" | "assessment",
      sortOrder: m.order ?? mi,
      lessons: (m.lessons ?? []).map((l, li) => ({
        id: l._id,
        slug: l.slug,
        title: l.title,
        xpReward: l.xp ?? 0,
        estimatedMinutes: l.estimatedMinutes ?? 10,
        difficulty: l.difficulty as "beginner" | "intermediate" | "advanced",
        sortOrder: li,
      })),
    })),
  };

  return <EditCourseClient initialCourse={course} courseId={raw._id} />;
}
```

**Step 2: Create client component**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/edit/edit-course-client.tsx */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, RocketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { CourseTree } from "@/components/admin/course-builder";
import { updateCourse, publishCourse, unpublishCourse } from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/types/course";

interface EditCourseClientProps {
  initialCourse: Course & { isPublished?: boolean };
  courseId: string;
}

export function EditCourseClient({ initialCourse, courseId }: EditCourseClientProps) {
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
      <PageHeader title="Edit Course">
        <div className="flex items-center gap-2">
          <Badge variant={initialCourse.isPublished ? "primary" : "neutral"}>
            {initialCourse.isPublished ? "Published" : "Draft"}
          </Badge>
          <Link href={`/admin/courses/${courseId}/preview`}>
            <Button variant="outline" size="sm">
              <Eye className="size-4" />
              Preview
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handlePublishToggle} disabled={isPending}>
            <RocketIcon className="size-4" />
            {initialCourse.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </PageHeader>
      <CourseTree course={course} onChange={setCourse} />
    </div>
  );
}
```

**Important notes for the implementer:**
- The lesson rows in `CourseTree` → `ModuleNode` → `LessonNode` should link to the content editor: `/admin/courses/${courseId}/lessons/${lessonId}/edit`. Check if `LessonNode` already renders a link or if you need to add one. Read `app/src/components/admin/course-builder/lesson-node.tsx`.

**Step 3: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/src/app/[locale]/(admin)/admin/courses/[id]/
git commit -m "feat(admin): add edit course page with save and publish workflow"
```

---

## Task 6: Content Editor (Task 24)

**Files:**
- Create: `app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/page.tsx`
- Create: `app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/lesson-editor-client.tsx`

**Step 1: Create server page**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/page.tsx */
import { notFound } from "next/navigation";
import { safeFetch } from "@/sanity/client";
import { adminLessonByIdQuery } from "@/sanity/queries";
import { LessonEditorClient } from "./lesson-editor-client";
import type { ContentBlock, ContentBlockType, ContentBlockData } from "@/types/content";

interface LessonEditorPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

interface RawBlock {
  _key: string;
  blockType: string;
  textContent?: unknown;
  language?: string;
  code?: string;
  filename?: string;
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
  quizQuestion?: string;
  quizOptions?: string[];
  calloutType?: string;
  calloutTitle?: string;
  calloutContent?: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  videoUrl?: string;
  videoTitle?: string;
}

interface RawLesson {
  _id: string;
  title: string;
  slug: string;
  xp: number;
  estimatedMinutes: number;
  difficulty: string;
  contentBlocks: RawBlock[] | null;
}

function mapBlock(raw: RawBlock, index: number): ContentBlock {
  const type = raw.blockType as ContentBlockType;
  let data: ContentBlockData;

  switch (type) {
    case "text":
      data = { type: "text", content: raw.textContent as ContentBlockData & { type: "text" } extends { content: infer C } ? C : null };
      break;
    case "code_example":
      data = { type: "code_example", language: raw.language ?? "typescript", code: raw.code ?? "", filename: raw.filename };
      break;
    case "code_challenge":
      data = { type: "code_challenge", language: (raw.language as "typescript" | "rust") ?? "typescript", starterCode: raw.starterCode ?? "", solutionCode: raw.solutionCode ?? "", testCases: [], hints: raw.hints ?? [] };
      break;
    case "quiz":
      data = { type: "quiz", questionType: "mcq", content: raw.quizQuestion ?? "", responseConfig: null };
      break;
    case "callout":
      data = { type: "callout", calloutType: (raw.calloutType as "info" | "warning" | "tip") ?? "info", title: raw.calloutTitle, content: raw.calloutContent ?? "" };
      break;
    case "image":
      data = { type: "image", src: raw.imageUrl ?? "", alt: raw.alt ?? "", caption: raw.caption };
      break;
    case "video_embed":
      data = { type: "video_embed", url: raw.videoUrl ?? "", title: raw.videoTitle };
      break;
    default:
      data = { type: "text", content: null };
  }

  return { id: raw._key, type, sortOrder: index, data };
}

export default async function LessonEditorPage({ params }: LessonEditorPageProps) {
  const { id: courseId, lessonId } = await params;
  const raw = await safeFetch<RawLesson | null>(adminLessonByIdQuery, { id: lessonId });
  if (!raw) notFound();

  const blocks = (raw.contentBlocks ?? []).map(mapBlock);

  return (
    <LessonEditorClient
      courseId={courseId}
      lessonId={raw._id}
      lessonTitle={raw.title}
      initialBlocks={blocks}
    />
  );
}
```

**Important note:** The `mapBlock` function has a complex type assertion for `textContent`. Simplify this during implementation — just cast: `data = { type: "text", content: (raw.textContent ?? null) as TextBlockData["content"] }`. Import `TextBlockData` from `@/types/content`.

**Step 2: Create client component**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/[lessonId]/edit/lesson-editor-client.tsx */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { BlockList } from "@/components/admin/content-editor";
import { updateLessonContentBlocks } from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";
import type { ContentBlock } from "@/types/content";

interface LessonEditorClientProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  initialBlocks: ContentBlock[];
}

function blocksToSanity(blocks: ContentBlock[]): Record<string, unknown>[] {
  return blocks.map((block) => {
    const base: Record<string, unknown> = {
      _key: block.id,
      _type: "contentBlock",
      blockType: block.type,
    };

    switch (block.data.type) {
      case "text":
        base.textContent = block.data.content;
        break;
      case "code_example":
        base.language = block.data.language;
        base.code = block.data.code;
        base.filename = block.data.filename;
        break;
      case "code_challenge":
        base.language = block.data.language;
        base.starterCode = block.data.starterCode;
        base.solutionCode = block.data.solutionCode;
        base.hints = block.data.hints;
        break;
      case "quiz":
        base.quizQuestion = block.data.content;
        break;
      case "callout":
        base.calloutType = block.data.calloutType;
        base.calloutTitle = block.data.title;
        base.calloutContent = block.data.content;
        break;
      case "image":
        base.alt = block.data.alt;
        base.caption = block.data.caption;
        break;
      case "video_embed":
        base.videoUrl = block.data.url;
        base.videoTitle = block.data.title;
        break;
    }

    return base;
  });
}

export function LessonEditorClient({
  courseId,
  lessonId,
  lessonTitle,
  initialBlocks,
}: LessonEditorClientProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateLessonContentBlocks(lessonId, blocksToSanity(blocks));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit: ${lessonTitle}`}>
        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${courseId}/edit`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" />
              Back to Course
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </PageHeader>
      <BlockList blocks={blocks} onChange={setBlocks} />
    </div>
  );
}
```

**Step 3: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/src/app/[locale]/(admin)/admin/courses/[id]/lessons/
git commit -m "feat(admin): add lesson content editor with BlockList and Sanity persistence"
```

---

## Task 7: Wire Question Builders into QuizBlockEditor

**Files:**
- Modify: `app/src/components/admin/content-editor/editors/quiz-block-editor.tsx`

**Step 1: Integrate question builders**

The existing `QuizBlockEditor` only has a type selector + textarea. We need to add the corresponding `ResponseConfig` builder below the question content.

```typescript
/* app/src/components/admin/content-editor/editors/quiz-block-editor.tsx — full file */
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  McqBuilder,
  MultiSelectMcqBuilder,
  TrueFalseBuilder,
  FillBlankBuilder,
  ClozeBuilder,
  MatchingBuilder,
  MatrixMatchingBuilder,
  OrderingBuilder,
  DiagramLabelBuilder,
  CalculationBuilder,
  NumericEntryBuilder,
  AssertionReasonBuilder,
} from "@/components/admin/question-builders";
import type { QuizBlockData } from "@/types/content";
import type { QuestionType, ResponseConfig } from "@/types/questions";

interface QuizBlockEditorProps {
  data: QuizBlockData;
  onChange: (data: QuizBlockData) => void;
}

const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
  { label: "Multiple Choice", value: "mcq" },
  { label: "Multi-Select", value: "multi_select_mcq" },
  { label: "True / False", value: "true_false" },
  { label: "Short Answer", value: "short_answer" },
  { label: "Essay", value: "essay" },
  { label: "Fill in the Blank", value: "fill_blank" },
  { label: "Cloze", value: "cloze" },
  { label: "Matching", value: "matching" },
  { label: "Ordering", value: "ordering" },
  { label: "Theory", value: "theory" },
  { label: "Diagram Label", value: "diagram_label" },
  { label: "Calculation", value: "calculation" },
  { label: "Assertion & Reason", value: "assertion_reason" },
  { label: "Matrix Matching", value: "matrix_matching" },
  { label: "Numeric Entry", value: "numeric_entry" },
];

function ResponseConfigEditor({
  questionType,
  config,
  onChange,
}: {
  questionType: QuestionType;
  config: ResponseConfig;
  onChange: (config: ResponseConfig) => void;
}) {
  switch (questionType) {
    case "mcq":
      return <McqBuilder value={config as Parameters<typeof McqBuilder>[0]["value"]} onChange={onChange} />;
    case "multi_select_mcq":
      return <MultiSelectMcqBuilder value={config as Parameters<typeof MultiSelectMcqBuilder>[0]["value"]} onChange={onChange} />;
    case "true_false":
      return <TrueFalseBuilder value={config as Parameters<typeof TrueFalseBuilder>[0]["value"]} onChange={onChange} />;
    case "fill_blank":
      return <FillBlankBuilder value={config as Parameters<typeof FillBlankBuilder>[0]["value"]} onChange={onChange} />;
    case "cloze":
      return <ClozeBuilder value={config as Parameters<typeof ClozeBuilder>[0]["value"]} onChange={onChange} />;
    case "matching":
      return <MatchingBuilder value={config as Parameters<typeof MatchingBuilder>[0]["value"]} onChange={onChange} />;
    case "matrix_matching":
      return <MatrixMatchingBuilder value={config as Parameters<typeof MatrixMatchingBuilder>[0]["value"]} onChange={onChange} />;
    case "ordering":
      return <OrderingBuilder value={config as Parameters<typeof OrderingBuilder>[0]["value"]} onChange={onChange} />;
    case "diagram_label":
      return <DiagramLabelBuilder value={config as Parameters<typeof DiagramLabelBuilder>[0]["value"]} onChange={onChange} />;
    case "calculation":
      return <CalculationBuilder value={config as Parameters<typeof CalculationBuilder>[0]["value"]} onChange={onChange} />;
    case "numeric_entry":
      return <NumericEntryBuilder value={config as Parameters<typeof NumericEntryBuilder>[0]["value"]} onChange={onChange} />;
    case "assertion_reason":
      return <AssertionReasonBuilder value={config as Parameters<typeof AssertionReasonBuilder>[0]["value"]} onChange={onChange} />;
    default:
      return null;
  }
}

export function QuizBlockEditor({ data, onChange }: QuizBlockEditorProps) {
  function handleTypeChange(questionType: string) {
    onChange({ ...data, questionType: questionType as QuestionType, responseConfig: null });
  }

  function handleContentChange(content: string) {
    onChange({ ...data, content });
  }

  function handleConfigChange(responseConfig: ResponseConfig) {
    onChange({ ...data, responseConfig });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">Question Type</Label>
        <Select value={data.questionType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Question Content</Label>
        <Textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter the question text..."
          rows={4}
        />
      </div>

      <ResponseConfigEditor
        questionType={data.questionType}
        config={data.responseConfig}
        onChange={handleConfigChange}
      />
    </div>
  );
}
```

**Important note for implementer:** The `Parameters<typeof XBuilder>[0]["value"]` casts are a defensive pattern. Before using them, read each question builder file to confirm they all follow the same `{ value: Config | null; onChange: (config: Config) => void }` pattern that `McqBuilder` uses. If they don't, adapt the casts.

**Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/src/components/admin/content-editor/editors/quiz-block-editor.tsx
git commit -m "feat(admin): wire 12 question builders into QuizBlockEditor"
```

---

## Task 8: Preview Mode (Task 25)

**Files:**
- Create: `app/src/app/[locale]/(admin)/admin/courses/[id]/preview/page.tsx`
- Create: `app/src/app/[locale]/(admin)/admin/courses/[id]/preview/lessons/[lessonSlug]/page.tsx`

**Step 1: Create course preview page**

This page reuses the student course detail view but fetches from the Sanity preview client (sees drafts).

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/preview/page.tsx */
import { notFound } from "next/navigation";
import { previewClient } from "@/sanity/client";
import { PreviewBanner } from "@/components/admin/preview-banner";
import { CourseDetailClient } from "@/app/[locale]/(main)/courses/[slug]/course-detail-client";
import { publishCourse } from "@/sanity/mutations";
import { groq } from "next-sanity";
import { redirect } from "next/navigation";
import type { Course } from "@/types/course";

interface PreviewPageProps {
  params: Promise<{ id: string; locale: string }>;
}

const previewCourseQuery = groq`
  *[_type == "course" && _id == $id][0] {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "id": _id,
      title,
      "description": coalesce(description, ""),
      type,
      "sortOrder": order,
      lessons[]-> {
        "id": _id,
        title,
        "slug": slug.current,
        "xpReward": coalesce(xp, 0),
        estimatedMinutes,
        difficulty,
        "sortOrder": 0
      }
    }
  }
`;

export default async function CoursePreviewPage({ params }: PreviewPageProps) {
  const { id, locale } = await params;

  const course = await previewClient.fetch<Course | null>(previewCourseQuery, { id });
  if (!course) notFound();

  return (
    <div>
      <PreviewBannerWrapper courseId={id} courseName={course.title} locale={locale} />
      <div className="p-6">
        <CourseDetailClient course={course} isPreview />
      </div>
    </div>
  );
}
```

**Important notes for implementer:**
- The `PreviewBanner` component uses callback props (`onExitPreview`, `onPublish`). Since this is a server component, you need to either: (a) make a thin client wrapper for the banner, or (b) use `<Link>` for "Exit Preview" and a form action for "Publish".
- The simplest approach is a client wrapper component `PreviewBannerWrapper` that handles the callbacks:

```typescript
/* Inline in the same file or a separate client component */
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PreviewBanner } from "@/components/admin/preview-banner";
import { publishCourse } from "@/sanity/mutations";

function PreviewBannerWrapper({ courseId, courseName, locale }: { courseId: string; courseName: string; locale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <PreviewBanner
      courseName={courseName}
      onExitPreview={() => router.push(`/${locale}/admin/courses/${courseId}/edit`)}
      onPublish={() => {
        startTransition(async () => {
          await publishCourse(courseId);
          router.push(`/${locale}/admin/courses/${courseId}/edit`);
        });
      }}
    />
  );
}
```

Since both server and client components can't coexist in one file, split the `PreviewBannerWrapper` into `app/src/app/[locale]/(admin)/admin/courses/[id]/preview/preview-banner-wrapper.tsx` (client component) and import it in the server `page.tsx`.

**Step 2: Create lesson preview page**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/preview/lessons/[lessonSlug]/page.tsx */
import { notFound } from "next/navigation";
import { previewClient } from "@/sanity/client";
import { lessonBySlugQuery, courseBySlugQuery } from "@/sanity/queries";
import { groq } from "next-sanity";
import { PreviewBannerWrapper } from "../../preview-banner-wrapper";
import { LessonViewClient } from "@/app/[locale]/(main)/courses/[slug]/lessons/[lessonSlug]/lesson-view-client";
import type { Lesson, Course } from "@/types/course";

interface LessonPreviewPageProps {
  params: Promise<{ id: string; lessonSlug: string; locale: string }>;
}

const previewCourseByIdQuery = groq`
  *[_type == "course" && _id == $id][0] {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "id": _id,
      title,
      "description": coalesce(description, ""),
      type,
      "sortOrder": order,
      lessons[]-> {
        "id": _id,
        title,
        "slug": slug.current,
        "xpReward": coalesce(xp, 0),
        estimatedMinutes,
        difficulty,
        "sortOrder": 0
      }
    }
  }
`;

export default async function LessonPreviewPage({ params }: LessonPreviewPageProps) {
  const { id: courseId, lessonSlug, locale } = await params;

  const [lesson, course] = await Promise.all([
    previewClient.fetch<Lesson | null>(lessonBySlugQuery, { slug: lessonSlug }),
    previewClient.fetch<Course | null>(previewCourseByIdQuery, { id: courseId }),
  ]);

  if (!lesson || !course) notFound();

  const allLessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const currentIndex = allLessons.findIndex(
    (l) => l.slug === lessonSlug || l.id === lesson.id,
  );
  const currentModule = course.modules?.find((m) =>
    m.lessons.some((l) => l.slug === lessonSlug || l.id === lesson.id),
  );

  return (
    <div>
      <PreviewBannerWrapper courseId={courseId} courseName={course.title} locale={locale} />
      <div className="p-6">
        <LessonViewClient
          lesson={lesson}
          courseSlug={course.slug ?? ""}
          moduleName={currentModule?.title ?? "Module"}
          currentLesson={currentIndex + 1}
          totalLessons={allLessons.length}
          previousLessonSlug={allLessons[currentIndex - 1]?.slug}
          nextLessonSlug={allLessons[currentIndex + 1]?.slug}
          isPreview
        />
      </div>
    </div>
  );
}
```

**Important notes for implementer:**
- `CourseDetailClient` and `LessonViewClient` may not accept an `isPreview` prop yet. Check their interfaces. If they don't, either: (a) add `isPreview?: boolean` to suppress on-chain calls, or (b) skip the prop if the on-chain calls already gracefully fail (they should, given the try/catch pattern in Phase 4).
- Lesson navigation links in preview mode should point to preview routes (`/admin/courses/${courseId}/preview/lessons/${slug}`) instead of student routes. This may need an adapter in `LessonViewClient`. If the effort is high, skip internal lesson navigation in preview and just show the content.

**Step 3: Create the PreviewBannerWrapper client component**

```typescript
/* app/src/app/[locale]/(admin)/admin/courses/[id]/preview/preview-banner-wrapper.tsx */
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PreviewBanner } from "@/components/admin/preview-banner";
import { publishCourse } from "@/sanity/mutations";

interface PreviewBannerWrapperProps {
  courseId: string;
  courseName: string;
  locale: string;
}

export function PreviewBannerWrapper({ courseId, courseName, locale }: PreviewBannerWrapperProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <PreviewBanner
      courseName={courseName}
      onExitPreview={() => router.push(`/${locale}/admin/courses/${courseId}/edit`)}
      onPublish={() => {
        startTransition(async () => {
          await publishCourse(courseId);
          router.push(`/${locale}/admin/courses/${courseId}/edit`);
        });
      }}
    />
  );
}
```

**Step 4: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds, preview routes registered

**Step 5: Commit**

```bash
git add app/src/app/[locale]/(admin)/admin/courses/[id]/preview/
git commit -m "feat(admin): add preview mode for draft course and lesson content"
```

---

## Task 9: Final Build Verification

**Step 1: Full build check**

Run: `cd app && npx next build`
Expected: 0 errors, all admin routes registered as ƒ dynamic:
- `/[locale]/admin` (dashboard)
- `/[locale]/admin/courses` (list)
- `/[locale]/admin/courses/new` (create)
- `/[locale]/admin/courses/[id]/edit` (edit)
- `/[locale]/admin/courses/[id]/lessons/[lessonId]/edit` (content editor)
- `/[locale]/admin/courses/[id]/preview` (course preview)
- `/[locale]/admin/courses/[id]/preview/lessons/[lessonSlug]` (lesson preview)

**Step 2: Commit final state**

```bash
git add -A
git commit -m "feat(phase-5): admin pages — dashboard, course CRUD, content editor, preview mode"
```

---

## Adaptation Notes

These sections will likely need adjustment during implementation:

1. **Component prop interfaces** — `RowActions`, `SearchInput`, `PageHeader` may have slightly different APIs than assumed. Read each file before using.
2. **Client/server boundary** — some components may need `"use client"` added or moved. Watch for `useRouter`, `useState`, `useTransition` calls in server components.
3. **Image upload** — the `ImageBlockEditor` currently uses a URL input. To support file upload → Sanity assets, you'd need to add a file input and call `uploadAsset`. This can be deferred if URL input is sufficient.
4. **Student client components** (`CourseDetailClient`, `LessonViewClient`) may not import cleanly from preview pages due to path aliases or on-chain dependencies. If so, create thin wrapper components in the preview directory that re-render just the presentational parts.
5. **`ContentBlock` ↔ Sanity round-trip** — the `blocksToSanity` / `mapBlock` functions need testing with real Sanity data. The content-block schema stores fields flat (all on one level with conditional visibility), so the mapping must be exact.
