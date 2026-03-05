"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
        base.testCases = (block.data.testCases ?? []).map((tc, i) => ({
          _key: `tc-${i}`,
          ...tc,
        }));
        base.validationRules = (block.data.validationRules ?? []).map(
          (vr, i) => ({ _key: `vr-${i}`, ...vr }),
        );
        base.maxAttempts = block.data.maxAttempts;
        break;
      case "quiz": {
        base.quizQuestion = block.data.content;
        base.questionType = block.data.questionType;
        const cfg = block.data.responseConfig as Record<string, unknown> | null;

        if (cfg && Array.isArray(cfg.options)) {
          const opts = cfg.options as { text: string; is_correct?: boolean }[];
          base.quizOptions = opts.map((o) => o.text);

          if (block.data.questionType === "multi_select_mcq") {
            const correctIndices = opts
              .map((o, i) => (o.is_correct ? i : -1))
              .filter((i) => i !== -1);
            base.correctAnswers = correctIndices;
            base.correctAnswer = correctIndices[0] ?? null;
          } else {
            const correctIdx = opts.findIndex((o) => o.is_correct);
            if (correctIdx !== -1) base.correctAnswer = correctIdx;
          }
          base.responseConfigJson = null;
        } else if (cfg) {
          base.responseConfigJson = JSON.stringify(cfg);
          base.quizOptions = null;
          base.correctAnswer = null;
          base.correctAnswers = null;
        }
        break;
      }
      case "callout":
        base.calloutType = block.data.calloutType;
        base.calloutTitle = block.data.title;
        base.calloutContent = block.data.content;
        break;
      case "image":
        base.alt = block.data.alt;
        base.caption = block.data.caption;
        if (block.data.assetId) {
          base.image = {
            _type: "image",
            asset: { _type: "reference", _ref: block.data.assetId },
          };
        }
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
  const t = useTranslations("AdminCourse");
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateLessonContentBlocks(
        lessonId,
        blocksToSanity(blocks),
        courseId,
      );
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
          {isPending ? t("saving") : t("actionEdit")}
        </Button>
      </div>
      <BlockList blocks={blocks} onChange={setBlocks} />
    </div>
  );
}
