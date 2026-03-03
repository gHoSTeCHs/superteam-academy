"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockList } from "@/components/admin/content-editor";
import { updateLessonContentBlocks } from "@/sanity/mutations";
import { Link } from "@/i18n/navigation";
import type { ContentBlock } from "@/types/content";

interface LessonEditorClientProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  initialBlocks: ContentBlock[];
}

function blocksToSanity(blocks: ContentBlock[]): Record<string, unknown>[] {
  return blocks.map((block) => {
    const base: Record<string, unknown> = {
      _key: block.id,
      _type: "contentBlock",
      blockType: block.type,
    };

    switch (block.data.type) {
      case "text":
        base.textContent = block.data.content;
        break;
      case "code_example":
        base.language = block.data.language;
        base.code = block.data.code;
        base.filename = block.data.filename;
        break;
      case "code_challenge":
        base.language = block.data.language;
        base.starterCode = block.data.starterCode;
        base.solutionCode = block.data.solutionCode;
        base.hints = block.data.hints;
        break;
      case "quiz":
        base.quizQuestion = block.data.content;
        break;
      case "callout":
        base.calloutType = block.data.calloutType;
        base.calloutTitle = block.data.title;
        base.calloutContent = block.data.content;
        break;
      case "image":
        base.alt = block.data.alt;
        base.caption = block.data.caption;
        break;
      case "video_embed":
        base.videoUrl = block.data.url;
        base.videoTitle = block.data.title;
        break;
    }

    return base;
  });
}

export function LessonEditorClient({
  courseId,
  lessonId,
  lessonTitle,
  initialBlocks,
}: LessonEditorClientProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateLessonContentBlocks(lessonId, blocksToSanity(blocks));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/admin/courses/${courseId}/edit`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {lessonTitle}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          <Save className="size-4" />
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      <BlockList blocks={blocks} onChange={setBlocks} />
    </div>
  );
}
