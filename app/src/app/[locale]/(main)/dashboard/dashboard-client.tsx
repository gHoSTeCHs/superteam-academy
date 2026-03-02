"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { XpLevelCard } from "@/components/dashboard/xp-level-card";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { ActiveCourses } from "@/components/dashboard/active-courses";
import { RecentAchievements } from "@/components/dashboard/recent-achievements";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { getStreak, getCalendarData } from "@/lib/streaks";

interface DashboardClientProps {
  userId: string;
  displayName?: string;
}

export function DashboardClient({ userId, displayName }: DashboardClientProps) {
  const { walletAddress } = useAuth();
  const wallet = walletAddress ?? userId;
  const streak = useMemo(() => getStreak(wallet), [wallet]);
  const calendarDays = useMemo(() => getCalendarData(wallet), [wallet]);

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
          {displayName ? `Welcome back, ${displayName}` : "Dashboard"}
        </h1>
        <p
          className="mt-1 text-[15px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Track your learning progress and achievements.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <XpLevelCard xp={0} />
        <StreakCalendar
          days={calendarDays}
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
        />
      </div>

      <div className="mt-6">
        <ActiveCourses courses={[]} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentAchievements achievements={[]} />
        <ActivityFeed activities={[]} />
      </div>
    </div>
  );
}
