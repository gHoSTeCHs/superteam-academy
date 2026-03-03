"use client";

import { FileTextIcon, CodeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "content" | "code";

interface MobileLessonTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasCodeBlock: boolean;
}

export function MobileLessonTabs({
  activeTab,
  onTabChange,
  hasCodeBlock,
}: MobileLessonTabsProps) {
  return (
    <div className="flex border-b border-border bg-card md:hidden">
      <button
        onClick={() => onTabChange("content")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors",
          activeTab === "content"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground",
        )}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <FileTextIcon className="size-4" />
        Content
      </button>
      <button
        onClick={() => onTabChange("code")}
        disabled={!hasCodeBlock}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors",
          activeTab === "code"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground",
          !hasCodeBlock && "cursor-not-allowed opacity-40",
        )}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <CodeIcon className="size-4" />
        Code
      </button>
    </div>
  );
}
