"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VideoEmbedData } from "@/types/content";

interface VideoEmbedEditorProps {
  data: VideoEmbedData;
  onChange: (data: VideoEmbedData) => void;
}

export function VideoEmbedEditor({ data, onChange }: VideoEmbedEditorProps) {
  const t = useTranslations("AdminContent");

  function handleUrlChange(url: string) {
    onChange({ ...data, url });
  }

  function handleTitleChange(title: string) {
    onChange({ ...data, title: title || undefined });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("fieldVideoUrl")}</Label>
        <Input
          value={data.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={t("videoUrlPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("fieldVideoTitle")}</Label>
        <Input
          value={data.title ?? ""}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t("videoTitlePlaceholder")}
        />
      </div>
    </div>
  );
}
