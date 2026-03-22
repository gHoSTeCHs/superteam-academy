"use client";

import { useState, useCallback, useMemo } from "react";
import {
  getStreak,
  recordActivity as recordActivityInStorage,
  getCalendarData as getCalendarDataFromStorage,
  type CalendarDay,
} from "@/lib/streaks";

interface StreakMilestones {
  week: boolean;
  month: boolean;
  century: boolean;
}

interface UseStreakReturn {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activityDays: string[];
  calendarDays: CalendarDay[];
  milestones: StreakMilestones;
  recordActivity: () => { previousStreak: number; newStreak: number };
}

export function useStreak(walletAddress: string): UseStreakReturn {
  const [streakData, setStreakData] = useState(() => getStreak(walletAddress));

  const calendarDays = useMemo(
    () => getCalendarDataFromStorage(walletAddress),
    [walletAddress, streakData.lastActivityDate],
  );

  const milestones = useMemo<StreakMilestones>(
    () => ({
      week: streakData.currentStreak >= 7,
      month: streakData.currentStreak >= 30,
      century: streakData.currentStreak >= 100,
    }),
    [streakData.currentStreak],
  );

  const recordActivity = useCallback(() => {
    const previousStreak = streakData.currentStreak;
    const updated = recordActivityInStorage(walletAddress);
    setStreakData(updated);
    return { previousStreak, newStreak: updated.currentStreak };
  }, [walletAddress, streakData.currentStreak]);

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    lastActivityDate: streakData.lastActivityDate,
    activityDays: streakData.activityDays,
    calendarDays,
    milestones,
    recordActivity,
  };
}
