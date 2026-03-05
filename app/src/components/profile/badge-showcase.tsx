"use client";

import {
  TrophyIcon,
  FlameIcon,
  RocketIcon,
  CodeIcon,
  StarIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  category: "progress" | "streaks" | "skills" | "special";
  earnedAt: string;
}

interface BadgeShowcaseProps {
  badges: ProfileBadge[];
  className?: string;
}

const categoryConfig: Record<
  ProfileBadge["category"],
  { icon: LucideIcon; color: string; bg: string }
> = {
  progress: { icon: RocketIcon, color: "text-primary", bg: "bg-primary/10" },
  streaks: {
    icon: FlameIcon,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  skills: {
    icon: CodeIcon,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  special: {
    icon: StarIcon,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
};

export function BadgeShowcase({ badges, className }: BadgeShowcaseProps) {
  const t = useTranslations("Profile");
  return (
    <Card className={cn("px-6 py-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("badges")}
        </h3>
        <span
          className="text-[12px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("credentialsEarnedCount", { n: badges.length })}
        </span>
      </div>

      {badges.length === 0 ? (
        <div className="py-6 text-center">
          <TrophyIcon className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p
            className="text-[13px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("noBadgesYet")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {badges.map((badge) => {
            const config = categoryConfig[badge.category];
            const Icon = config.icon;
            return (
              <div
                key={badge.id}
                className="group flex flex-col items-center gap-1.5"
                title={`${badge.name}: ${badge.description}`}
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                    config.bg,
                  )}
                >
                  <Icon className={cn("size-5", config.color)} />
                </div>
                <p
                  className="line-clamp-1 text-center text-[10px] font-medium text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {badge.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
