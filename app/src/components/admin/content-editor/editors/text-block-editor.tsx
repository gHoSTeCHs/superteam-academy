"use client";

import { TiptapEditor } from "@/components/tiptap-editor";
import type { TextBlockData } from "@/types/content";
import type { TiptapJSON } from "@/types/tiptap";

interface TextBlockEditorProps {
  data: TextBlockData;
  onChange: (data: TextBlockData) => void;
}

export function TextBlockEditor({ data, onChange }: TextBlockEditorProps) {
  function handleChange(json: TiptapJSON, _plainText: string) {
    onChange({ ...data, content: json });
  }

  return (
    <div className="space-y-2">
      <TiptapEditor
        value={Array.isArray(data.content) ? null : data.content}
        onChange={handleChange}
        placeholder="Start writing content..."
      />
    </div>
  );
}
