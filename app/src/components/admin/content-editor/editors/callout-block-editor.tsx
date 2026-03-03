"use client";

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

const CALLOUT_TYPE_OPTIONS: { label: string; value: CalloutType }[] = [
  { label: "Info", value: "info" },
  { label: "Warning", value: "warning" },
  { label: "Tip", value: "tip" },
];

export function CalloutBlockEditor({
  data,
  onChange,
}: CalloutBlockEditorProps) {
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
          <Label className="text-muted-foreground">Callout Type</Label>
          <Select value={data.calloutType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CALLOUT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Title (optional)</Label>
          <Input
            value={data.title ?? ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Important Note"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Content</Label>
        <Textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter callout content..."
          rows={4}
        />
      </div>
    </div>
  );
}
