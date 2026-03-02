"use client";

import Image from "next/image";
import { InfoIcon, AlertTriangleIcon, LightbulbIcon } from "lucide-react";
import { PortableTextRenderer } from "@/components/portable-text-renderer";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { CodeEditor } from "@/components/code-editor";
import { CodeChallenge } from "@/components/code-challenge";
import { VideoPlayer } from "@/components/video-player";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/types/content";

type PaneTarget = "left" | "right";

interface ContentBlockRendererProps {
  block: ContentBlock;
  onCodeBlockActivate?: (blockId: string) => void;
  onChallengeComplete?: (blockId: string, passed: boolean) => void;
}

const calloutConfig = {
  info: {
    icon: InfoIcon,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangleIcon,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-500",
  },
  tip: {
    icon: LightbulbIcon,
    bg: "bg-primary/10",
    border: "border-primary/30",
    iconColor: "text-primary",
  },
};

export function getPaneTarget(block: ContentBlock): PaneTarget {
  if (
    block.data.type === "code_example" ||
    block.data.type === "code_challenge"
  ) {
    return "right";
  }
  return "left";
}

export function ContentBlockRenderer({
  block,
  onChallengeComplete,
}: ContentBlockRendererProps) {
  const { data } = block;

  switch (data.type) {
    case "text":
      if (!data.content) return null;
      return (
        <div className="prose-sm max-w-none">
          {Array.isArray(data.content) ? (
            <PortableTextRenderer content={data.content} />
          ) : (
            <TiptapRenderer content={data.content} />
          )}
        </div>
      );

    case "code_example":
      return (
        <div className="space-y-2">
          {data.filename && (
            <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-muted px-3 py-1.5">
              <span
                className="text-[12px] font-medium text-muted-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {data.filename}
              </span>
            </div>
          )}
          <CodeEditor
            value={data.code}
            onChange={() => {}}
            language={data.language}
            readOnly
            height="280px"
            className={cn(
              "rounded-lg border border-border",
              data.filename && "rounded-t-none",
            )}
          />
        </div>
      );

    case "code_challenge":
      return (
        <CodeChallenge
          challenge={data}
          onComplete={(passed) => onChallengeComplete?.(block.id, passed)}
        />
      );

    case "quiz":
      return (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Quiz
            </span>
            <span
              className="text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {data.questionType.replace(/_/g, " ")}
            </span>
          </div>
          <p
            className="text-[14px] text-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {data.content}
          </p>
          {data.responseConfig &&
            "options" in data.responseConfig &&
            Array.isArray(data.responseConfig.options) && (
              <ul className="mt-3 space-y-2">
                {(
                  data.responseConfig.options as Array<{
                    label: string;
                    text: string;
                  }>
                ).map((opt) => (
                  <li key={opt.label}>
                    <button className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-left transition-colors hover:bg-muted">
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {opt.label}
                      </span>
                      <span
                        className="text-[13px] text-foreground"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {opt.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </Card>
      );

    case "callout": {
      const config = calloutConfig[data.calloutType] ?? calloutConfig.info;
      const CalloutIcon = config.icon;
      return (
        <div
          className={cn(
            "flex gap-3 rounded-xl border p-4",
            config.bg,
            config.border,
          )}
        >
          <CalloutIcon
            className={cn("mt-0.5 size-5 shrink-0", config.iconColor)}
          />
          <div className="min-w-0">
            {data.title && (
              <p
                className="mb-1 text-[13px] font-semibold text-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {data.title}
              </p>
            )}
            <p
              className="text-[13px] leading-relaxed text-foreground/80"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {data.content}
            </p>
          </div>
        </div>
      );
    }

    case "image":
      return (
        <figure className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <Image
              src={data.src}
              alt={data.alt}
              width={800}
              height={450}
              className="w-full object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
          {data.caption && (
            <figcaption
              className="text-center text-[12px] text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {data.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video_embed":
      return (
        <div className="space-y-2">
          {data.title && (
            <p
              className="text-[13px] font-medium text-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {data.title}
            </p>
          )}
          <VideoPlayer url={data.url} />
        </div>
      );

    default:
      return null;
  }
}
