import { safeFetch } from "@/sanity/client";
import { allCoursesQuery } from "@/sanity/queries";
import { CoursesClient } from "./courses-client";
import type { Course } from "@/types/course";

export default async function CoursesPage() {
  const courses = await safeFetch<Course[]>(allCoursesQuery);
  return <CoursesClient courses={courses ?? []} />;
}
