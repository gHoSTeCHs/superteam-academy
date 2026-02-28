interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activityDays: string[];
}

function defaultStreak(): StreakData {
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: '', activityDays: [] };
}

function storageKey(walletAddress: string): string {
  return `streak_${walletAddress}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getStreak(walletAddress: string): StreakData {
  if (typeof window === 'undefined') return defaultStreak();
  try {
    const raw = localStorage.getItem(storageKey(walletAddress));
    if (!raw) return defaultStreak();
    return JSON.parse(raw) as StreakData;
  } catch {
    return defaultStreak();
  }
}

export function recordActivity(walletAddress: string): StreakData {
  const data = getStreak(walletAddress);
  const today = todayISO();

  if (data.lastActivityDate === today) return data;

  const isConsecutive = data.lastActivityDate === yesterdayISO();

  const updated: StreakData = {
    currentStreak: isConsecutive ? data.currentStreak + 1 : 1,
    longestStreak: 0,
    lastActivityDate: today,
    activityDays: [...new Set([...data.activityDays, today])],
  };
  updated.longestStreak = Math.max(data.longestStreak, updated.currentStreak);

  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey(walletAddress), JSON.stringify(updated));
  }

  return updated;
}

export interface CalendarDay {
  date: string;
  active: boolean;
  today: boolean;
}

export function getCalendarData(
  walletAddress: string,
  weeks: number = 13,
): CalendarDay[] {
  const data = getStreak(walletAddress);
  const activitySet = new Set(data.activityDays);
  const today = todayISO();
  const days: CalendarDay[] = [];

  const end = new Date();
  const dayOfWeek = end.getDay();
  end.setDate(end.getDate() + (6 - dayOfWeek));

  const totalDays = weeks * 7;
  const start = new Date(end);
  start.setDate(start.getDate() - totalDays + 1);

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      active: activitySet.has(iso),
      today: iso === today,
    });
  }

  return days;
}

export function getXpLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  const level = Math.floor(Math.sqrt(xp / 100));
  const currentLevelXp = level * level * 100;
  const nextLevelXp = (level + 1) * (level + 1) * 100;
  const progress = nextLevelXp > currentLevelXp
    ? Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    : 0;

  return { level, currentXp: xp, nextLevelXp, progress };
}
