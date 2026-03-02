"use client";

import { useRouter } from "@/i18n/navigation";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CoursePreview } from "@/components/landing/course-preview";
import { Cta } from "@/components/landing/cta";

interface PreviewCourse {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessonCount: number;
  totalXp: number;
  tags: string[];
}

interface LandingClientProps {
  courses: PreviewCourse[];
}

export function LandingClient({ courses }: LandingClientProps) {
  const router = useRouter();

  return (
    <>
      <Hero
        onBrowseCourses={() => router.push("/courses")}
        onConnectWallet={() => router.push("/sign-in")}
      />
      <Features />
      <CoursePreview
        courses={courses}
        onViewAll={() => router.push("/courses")}
      />
      <Cta onGetStarted={() => router.push("/sign-in")} />
    </>
  );
}
