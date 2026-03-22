"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { XpLevelCard } from "@/components/dashboard/xp-level-card";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { ActiveCourses } from "@/components/dashboard/active-courses";
import { RecentAchievements } from "@/components/dashboard/recent-achievements";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useStreak } from "@/hooks/use-streak";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type {
  ActiveCourse,
  ActivityItem,
} from "@/lib/services/learning-progress";

interface DashboardClientProps {
  userId: string;
  displayName?: string;
  xp: number;
  courses: ActiveCourse[];
  activities: ActivityItem[];
}

export function DashboardClient({
  userId,
  displayName,
  xp,
  courses,
  activities,
}: DashboardClientProps) {
  const t = useTranslations("Dashboard");
  const { walletAddress } = useAuth();
  const wallet = walletAddress ?? userId;
  const { currentStreak, longestStreak, calendarDays } = useStreak(wallet);

  const achievementDisplay = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        category: a.category,
        xpReward: a.xpReward,
        earned: false,
      })),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1
          className="text-[28px] font-bold tracking-tight text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          {displayName
            ? t("welcomeBack", { name: displayName })
            : t("dashboardTitle")}
        </h1>
        <p
          className="mt-1 text-[15px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("dashboardDescription")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <XpLevelCard xp={xp} />
        <StreakCalendar
          days={calendarDays}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />
      </div>

      <div className="mt-6">
        <ActiveCourses courses={courses} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentAchievements achievements={achievementDisplay} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
