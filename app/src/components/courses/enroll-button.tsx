"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RocketIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";

type EnrollmentStatus = "unenrolled" | "enrolling" | "enrolled" | "completed";

interface EnrollButtonProps {
  status?: EnrollmentStatus;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  onEnroll?: () => void;
  onContinue?: () => void;
  onViewCredential?: () => void;
  className?: string;
}

export function EnrollButton({
  status: initialStatus = "unenrolled",
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  onEnroll,
  onContinue,
  onViewCredential,
  className,
}: EnrollButtonProps) {
  const t = useTranslations("Courses");
  const [status, setStatus] = useState<EnrollmentStatus>(initialStatus);

  async function handleEnroll() {
    setStatus("enrolling");
    onEnroll?.();
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("enrolled");
  }

  if (status === "completed") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <CheckCircle2Icon className="size-5 text-primary" />
          <span
            className="text-[14px] font-semibold text-primary"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("courseCompleted")}
          </span>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={onViewCredential}
          className="w-full"
        >
          {t("viewCredential")}
        </Button>
      </div>
    );
  }

  if (status === "enrolled") {
    return (
      <div className={cn("space-y-3", className)}>
        <ProgressBar
          value={progress}
          label={t("lessonsProgress", {
            completed: completedLessons,
            total: totalLessons,
          })}
        />
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          className="w-full"
        >
          {t("continueLearning")}
        </Button>
      </div>
    );
  }

  if (status === "enrolling") {
    return (
      <Button
        variant="primary"
        size="md"
        disabled
        className={cn("w-full", className)}
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span style={{ fontFamily: "var(--font-body)" }}>
          {t("signingTransaction")}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleEnroll}
      className={cn("w-full gap-2", className)}
    >
      <RocketIcon className="size-4" />
      <span style={{ fontFamily: "var(--font-body)" }}>{t("enrollNow")}</span>
    </Button>
  );
}
