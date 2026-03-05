"use client";

import { useEffect, useRef } from "react";
import {
  Type,
  Code,
  Terminal,
  HelpCircle,
  AlertCircle,
  ImageIcon,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ContentBlockType } from "@/types/content";
import type { LucideIcon } from "lucide-react";

interface BlockTypePickerProps {
  onSelect: (type: ContentBlockType) => void;
  onClose: () => void;
}

interface BlockTypeOption {
  type: ContentBlockType;
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
}

const BLOCK_TYPE_OPTIONS: BlockTypeOption[] = [
  {
    type: "text",
    icon: Type,
    labelKey: "blockTypeText",
    descKey: "blockTypeTextDesc",
  },
  {
    type: "code_example",
    icon: Code,
    labelKey: "blockTypeCodeExample",
    descKey: "blockTypeCodeExampleDesc",
  },
  {
    type: "code_challenge",
    icon: Terminal,
    labelKey: "blockTypeCodeChallenge",
    descKey: "blockTypeCodeChallengeDesc",
  },
  {
    type: "quiz",
    icon: HelpCircle,
    labelKey: "blockTypeQuiz",
    descKey: "blockTypeQuizDesc",
  },
  {
    type: "callout",
    icon: AlertCircle,
    labelKey: "blockTypeCallout",
    descKey: "blockTypeCalloutDesc",
  },
  {
    type: "image",
    icon: ImageIcon,
    labelKey: "blockTypeImage",
    descKey: "blockTypeImageDesc",
  },
  {
    type: "video_embed",
    icon: Video,
    labelKey: "blockTypeVideo",
    descKey: "blockTypeVideoDesc",
  },
];

export function BlockTypePicker({ onSelect, onClose }: BlockTypePickerProps) {
  const t = useTranslations("AdminContent");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleSelect(type: ContentBlockType) {
    onSelect(type);
    onClose();
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-72 overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
      )}
    >
      <div className="px-3 py-2.5 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("addBlock")}
        </p>
      </div>

      <div className="p-1.5">
        {BLOCK_TYPE_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => handleSelect(option.type)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
              "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
              <option.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {t(option.labelKey as Parameters<typeof t>[0])}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {t(option.descKey as Parameters<typeof t>[0])}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
