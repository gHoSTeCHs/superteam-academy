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

export function PreviewBannerWrapper({
  courseId,
  courseName,
  locale,
}: PreviewBannerWrapperProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <PreviewBanner
      courseName={courseName}
      onExitPreview={() =>
        router.push(`/${locale}/admin/courses/${courseId}/edit`)
      }
      onPublish={() => {
        startTransition(async () => {
          await publishCourse(courseId);
          router.push(`/${locale}/admin/courses/${courseId}/edit`);
        });
      }}
    />
  );
}
