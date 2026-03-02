import { notFound } from "next/navigation";
import { safeFetch } from "@/sanity/client";
import { courseBySlugQuery } from "@/sanity/queries";
import { CourseDetailClient } from "./course-detail-client";
import type { Course } from "@/types/course";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await safeFetch<Course | null>(courseBySlugQuery, { slug });

  if (!course) notFound();

  return <CourseDetailClient course={course} />;
}
