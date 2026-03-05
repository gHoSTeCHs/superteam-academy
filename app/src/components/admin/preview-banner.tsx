"use client";

import { EyeIcon, XIcon, RocketIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewBannerProps {
  courseName?: string;
  onExitPreview?: () => void;
  onPublish?: () => void;
  className?: string;
}

export function PreviewBanner({
  courseName,
  onExitPreview,
  onPublish,
  className,
}: PreviewBannerProps) {
  const t = useTranslations("AdminCommon");

  return (
    <div
      className={cn("flex items-center justify-between px-4 py-2.5", className)}
      style={{ background: "linear-gradient(90deg, #ffd23f 0%, #f7eacb 100%)" }}
    >
      <div className="flex items-center gap-2">
        <EyeIcon className="size-4" style={{ color: "#1b231d" }} />
        <span
          className="text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-body)", color: "#1b231d" }}
        >
          {t("previewMode")}
        </span>
        <span
          className="text-[12px]"
          style={{ color: "rgba(27, 35, 29, 0.6)" }}
        >
          {t("viewingDraft", { name: courseName ?? "Untitled Course" })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-[#1b231d]/20 bg-white/50 text-[11px] text-[#1b231d] hover:bg-white/70"
          onClick={onExitPreview}
        >
          <XIcon className="size-3" />
          {t("exitPreview")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5 bg-[#1b231d] text-[11px] text-white hover:bg-[#1b231d]/90"
          onClick={onPublish}
        >
          <RocketIcon className="size-3" />
          {t("publishCourse")}
        </Button>
      </div>
    </div>
  );
}
