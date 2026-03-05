"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalloutBlockData, CalloutType } from "@/types/content";

interface CalloutBlockEditorProps {
  data: CalloutBlockData;
  onChange: (data: CalloutBlockData) => void;
}

export function CalloutBlockEditor({
  data,
  onChange,
}: CalloutBlockEditorProps) {
  const t = useTranslations("AdminContent");

  const calloutTypeOptions: { label: string; value: CalloutType }[] = [
    { label: t("calloutTypeInfo"), value: "info" },
    { label: t("calloutTypeWarning"), value: "warning" },
    { label: t("calloutTypeTip"), value: "tip" },
  ];
  function handleTypeChange(calloutType: string) {
    onChange({ ...data, calloutType: calloutType as CalloutType });
  }

  function handleTitleChange(title: string) {
    onChange({ ...data, title: title || undefined });
  }

  function handleContentChange(content: string) {
    onChange({ ...data, content });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">
            {t("fieldCalloutType")}
          </Label>
          <Select value={data.calloutType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {calloutTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">
            {t("fieldCalloutTitle")}
          </Label>
          <Input
            value={data.title ?? ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={t("calloutTitlePlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("fieldContent")}</Label>
        <Textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={t("calloutContentPlaceholder")}
          rows={4}
        />
      </div>
    </div>
  );
}
