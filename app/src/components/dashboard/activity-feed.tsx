"use client";

import {
  CheckCircle2Icon,
  TrophyIcon,
  BookOpenIcon,
  ZapIcon,
  FlameIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ActivityType =
  | "lesson_complete"
  | "course_complete"
  | "achievement"
  | "xp_earned"
  | "streak_milestone";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  xp?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const activityConfig: Record<
  ActivityType,
  { icon: LucideIcon; color: string }
> = {
  lesson_complete: {
    icon: CheckCircle2Icon,
    color: "bg-primary/10 text-primary",
  },
  course_complete: {
    icon: TrophyIcon,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  achievement: {
    icon: TrophyIcon,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  xp_earned: {
    icon: ZapIcon,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  streak_milestone: {
    icon: FlameIcon,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");

  return (
    <Card className={cn("px-6 py-5", className)}>
      <h3
        className="mb-4 text-[14px] font-semibold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("recentActivity")}
      </h3>

      {activities.length === 0 ? (
        <div className="py-6 text-center">
          <BookOpenIcon className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p
            className="text-[13px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("noActivityYet")}
          </p>
        </div>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;
            return (
              <div
                key={activity.id}
                className="relative flex gap-3 pb-4 last:pb-0"
              >
                <div
                  className={cn(
                    "relative z-10 flex size-[38px] shrink-0 items-center justify-center rounded-full",
                    config.color,
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 pt-1">
                  <p
                    className="text-[13px] font-medium text-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {activity.title}
                  </p>
                  <p
                    className="text-[12px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="text-[11px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {activity.timestamp}
                    </span>
                    {activity.xp && (
                      <span
                        className="flex items-center gap-0.5 text-[11px] font-semibold"
                        style={{ color: "#ffd23f" }}
                      >
                        <ZapIcon className="size-3" />
                        {tCommon("xpGained", { n: activity.xp })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
