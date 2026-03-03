"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "./server";
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
  const slug = input.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const doc = await writeClient.create({
    _type: "course",
    title: input.title,
    slug: { _type: "slug", current: slug },
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
  const course = await writeClient.fetch<{
    modules: { _ref: string }[] | null;
  }>(`*[_type == "course" && _id == $id][0]{ "modules": modules[]{ _ref } }`, {
    id,
  });
  if (course?.modules) {
    for (const mod of course.modules) {
      const moduleDoc = await writeClient.fetch<{
        lessons: { _ref: string }[] | null;
      }>(
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

export async function updateModule(
  id: string,
  patch: Record<string, unknown>,
  courseId?: string,
) {
  await requireAuth();
  await writeClient.patch(id).set(patch).commit();
  if (courseId) revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAuth();
  const moduleDoc = await writeClient.fetch<{
    lessons: { _ref: string }[] | null;
  }>(`*[_type == "module" && _id == $id][0]{ "lessons": lessons[]{ _ref } }`, {
    id: moduleId,
  });
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

export async function createLesson(
  moduleId: string,
  input: CreateLessonInput,
  courseId?: string,
) {
  await requireAuth();
  const slug = input.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const doc = await writeClient.create({
    _type: "lesson",
    title: input.title,
    slug: { _type: "slug", current: slug },
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
  if (courseId) revalidatePath(`/admin/courses/${courseId}/edit`);
  return { _id: doc._id };
}

export async function deleteLesson(
  moduleId: string,
  lessonId: string,
  courseId?: string,
) {
  await requireAuth();
  await writeClient
    .patch(moduleId)
    .unset([`lessons[_ref == "${lessonId}"]`])
    .commit();
  await writeClient.delete(lessonId);
  if (courseId) revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateLessonContentBlocks(
  lessonId: string,
  contentBlocks: Record<string, unknown>[],
  courseId?: string,
) {
  await requireAuth();
  await writeClient.patch(lessonId).set({ contentBlocks }).commit();
  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}/edit`);
    revalidatePath("/courses", "layout");
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  await requireAuth();
  const refs = moduleIds.map((id) => ({
    _type: "reference" as const,
    _ref: id,
    _key: id,
  }));
  await writeClient.patch(courseId).set({ modules: refs }).commit();
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function reorderLessons(
  moduleId: string,
  lessonIds: string[],
  courseId?: string,
) {
  await requireAuth();
  const refs = lessonIds.map((id) => ({
    _type: "reference" as const,
    _ref: id,
    _key: id,
  }));
  await writeClient.patch(moduleId).set({ lessons: refs }).commit();
  if (courseId) revalidatePath(`/admin/courses/${courseId}/edit`);
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
