"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageBlockData } from "@/types/content";

interface ImageBlockEditorProps {
  data: ImageBlockData;
  onChange: (data: ImageBlockData) => void;
}

export function ImageBlockEditor({ data, onChange }: ImageBlockEditorProps) {
  const t = useTranslations("AdminContent");

  function handleSrcChange(src: string) {
    onChange({ ...data, src });
  }

  function handleAltChange(alt: string) {
    onChange({ ...data, alt });
  }

  function handleCaptionChange(caption: string) {
    onChange({ ...data, caption: caption || undefined });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("fieldImageUrl")}</Label>
        <Input
          value={data.src}
          onChange={(e) => handleSrcChange(e.target.value)}
          placeholder={t("imageUrlPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("fieldAltText")}</Label>
        <Input
          value={data.alt}
          onChange={(e) => handleAltChange(e.target.value)}
          placeholder={t("altTextPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("fieldCaption")}</Label>
        <Input
          value={data.caption ?? ""}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder={t("captionPlaceholder")}
        />
      </div>

      {data.src && (
        <div className="overflow-hidden rounded-lg border border-border">
          <img
            src={data.src}
            alt={data.alt || "Preview"}
            className="max-h-48 w-full object-contain bg-muted/20 p-2"
          />
        </div>
      )}
    </div>
  );
}
