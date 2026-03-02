"use client";

import { useState, useEffect, useMemo } from "react";
import { ContentBlockRenderer, getPaneTarget } from "./content-block-renderer";
import { MobileLessonTabs } from "./mobile-lesson-tabs";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/types/content";

interface LessonContentProps {
  blocks: ContentBlock[];
  lessonSlug?: string;
  onChallengeComplete?: (blockId: string, passed: boolean) => void;
  className?: string;
}

export function LessonContent({
  blocks,
  lessonSlug,
  onChallengeComplete,
  className,
}: LessonContentProps) {
  const [mobileTab, setMobileTab] = useState<"content" | "code">("content");
  const [activeCodeBlockId, setActiveCodeBlockId] = useState<string | null>(
    null,
  );

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks],
  );

  const leftBlocks = useMemo(
    () => sorted.filter((b) => getPaneTarget(b) === "left"),
    [sorted],
  );

  const rightBlocks = useMemo(
    () => sorted.filter((b) => getPaneTarget(b) === "right"),
    [sorted],
  );

  const hasCodeBlock = rightBlocks.length > 0;

  useEffect(() => {
    setMobileTab("content");
    setActiveCodeBlockId(null);
  }, [lessonSlug]);

  useEffect(() => {
    if (rightBlocks.length > 0 && !activeCodeBlockId) {
      setActiveCodeBlockId(rightBlocks[0]!.id);
    }
  }, [rightBlocks, activeCodeBlockId]);

  const activeCodeBlock =
    rightBlocks.find((b) => b.id === activeCodeBlockId) ?? rightBlocks[0];

  return (
    <div className={cn("space-y-0", className)}>
      <MobileLessonTabs
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        hasCodeBlock={hasCodeBlock}
      />

      <div
        className={cn(
          "grid gap-8",
          hasCodeBlock ? "md:grid-cols-[3fr_2fr]" : "grid-cols-1",
        )}
      >
        <div
          className={cn(
            "space-y-6 py-6",
            mobileTab !== "content" && "hidden md:block",
          )}
        >
          {leftBlocks.map((block) => (
            <ContentBlockRenderer
              key={block.id}
              block={block}
              onChallengeComplete={onChallengeComplete}
            />
          ))}
        </div>

        {hasCodeBlock && (
          <div
            className={cn(
              "py-6 md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto",
              mobileTab !== "code" && "hidden md:block",
            )}
          >
            {rightBlocks.length > 1 && (
              <div className="mb-4 flex gap-1.5 overflow-x-auto">
                {rightBlocks.map((block, i) => (
                  <button
                    key={block.id}
                    onClick={() => setActiveCodeBlockId(block.id)}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                      block.id === activeCodeBlockId
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {block.data.type === "code_challenge"
                      ? `Challenge ${i + 1}`
                      : `Example ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {activeCodeBlock && (
              <ContentBlockRenderer
                block={activeCodeBlock}
                onCodeBlockActivate={setActiveCodeBlockId}
                onChallengeComplete={onChallengeComplete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
