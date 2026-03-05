"use client";

import { useTranslations } from "next-intl";
import { ZapIcon, TrendingUpIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getXpLevel } from "@/lib/streaks";
import { cn } from "@/lib/utils";

interface XpLevelCardProps {
  xp: number;
  className?: string;
}

export function XpLevelCard({ xp, className }: XpLevelCardProps) {
  const t = useTranslations("Dashboard");
  const { level, nextLevelXp, progress } = getXpLevel(xp);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div
        className="px-6 py-5"
        style={{
          background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "rgba(247, 234, 203, 0.6)" }}
            >
              {t("totalXp")}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="text-[36px] font-bold leading-none"
                style={{ fontFamily: "var(--font-display)", color: "#ffd23f" }}
              >
                {xp.toLocaleString()}
              </span>
              <ZapIcon className="size-6" style={{ color: "#ffd23f" }} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="reward"
              className="border-0 bg-white/15 text-[11px] text-white backdrop-blur-sm"
            >
              <TrendingUpIcon className="mr-1 size-3" />
              {t("levelLabel", { n: level })}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mb-2 flex items-center justify-between text-[12px]">
          <span
            className="font-medium text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("progressToLevel", { level: level + 1 })}
          </span>
          <span
            className="font-semibold text-primary"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {progress}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #2f6b3f, #008c4c)",
            }}
          />
        </div>
        <p
          className="mt-2 text-[11px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("xpToNextLevel", {
            xp: nextLevelXp - xp,
            total: nextLevelXp.toLocaleString(),
          })}
        </p>
      </div>
    </Card>
  );
}
