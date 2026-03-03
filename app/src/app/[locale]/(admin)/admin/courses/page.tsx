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
