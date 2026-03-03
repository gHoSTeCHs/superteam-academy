"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageBlockData } from "@/types/content";

interface ImageBlockEditorProps {
  data: ImageBlockData;
  onChange: (data: ImageBlockData) => void;
}

export function ImageBlockEditor({ data, onChange }: ImageBlockEditorProps) {
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
        <Label className="text-muted-foreground">Image URL</Label>
        <Input
          value={data.src}
          onChange={(e) => handleSrcChange(e.target.value)}
          placeholder="https://example.com/image.png"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Alt Text</Label>
        <Input
          value={data.alt}
          onChange={(e) => handleAltChange(e.target.value)}
          placeholder="Describe the image for accessibility"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Caption (optional)</Label>
        <Input
          value={data.caption ?? ""}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder="Optional image caption"
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
