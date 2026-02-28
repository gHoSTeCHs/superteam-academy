'use client';

import { FlameIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarDay } from '@/lib/streaks';

interface StreakCalendarProps {
  days: CalendarDay[];
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MILESTONES = [
  { days: 7, label: 'Week Warrior', icon: '🔥' },
  { days: 30, label: 'Monthly Master', icon: '⭐' },
  { days: 100, label: 'Century Scholar', icon: '🏆' },
];

export function StreakCalendar({
  days,
  currentStreak,
  longestStreak,
  className,
}: StreakCalendarProps) {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const months = getMonthLabels(days);

  return (
    <Card className={cn('px-6 py-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FlameIcon className="size-5" style={{ color: '#ffd23f' }} />
            <span
              className="text-[20px] font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {currentStreak}
            </span>
            <span
              className="text-[13px] text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              day streak
            </span>
          </div>
          <span className="text-border">|</span>
          <span
            className="text-[12px] text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Longest: <span className="font-semibold text-foreground">{longestStreak}</span>
          </span>
        </div>
        <div className="flex gap-1.5">
          {MILESTONES.map((m) => (
            <Badge
              key={m.days}
              variant={currentStreak >= m.days ? 'reward' : 'neutral'}
              className="text-[10px]"
            >
              {m.icon} {m.days}d
            </Badge>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-1 flex gap-[3px] pl-[28px]">
            {months.map((m) => (
              <span
                key={m.label + m.offset}
                className="text-[10px] text-muted-foreground"
                style={{
                  fontFamily: 'var(--font-body)',
                  marginLeft: m.offset === 0 ? 0 : undefined,
                  position: 'absolute' as const,
                  left: `${28 + m.offset * 15}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="relative mt-4 flex gap-[3px]">
            <div className="flex w-[25px] shrink-0 flex-col gap-[3px]">
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={`wl-${i}`}
                  className="flex h-[12px] items-center text-[9px] text-muted-foreground"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {i % 2 === 1 ? label : ''}
                </span>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={`w-${wi}`} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      'size-[12px] rounded-[2px] transition-colors',
                      day.active
                        ? 'bg-primary'
                        : 'bg-muted',
                      day.today && 'ring-1 ring-primary ring-offset-1 ring-offset-background',
                    )}
                    title={`${day.date}${day.active ? ' (active)' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span style={{ fontFamily: 'var(--font-body)' }}>Less</span>
        <div className="flex gap-[2px]">
          <div className="size-[10px] rounded-[2px] bg-muted" />
          <div className="size-[10px] rounded-[2px] bg-primary/30" />
          <div className="size-[10px] rounded-[2px] bg-primary/60" />
          <div className="size-[10px] rounded-[2px] bg-primary" />
        </div>
        <span style={{ fontFamily: 'var(--font-body)' }}>More</span>
      </div>
    </Card>
  );
}

function getMonthLabels(days: CalendarDay[]): { label: string; offset: number }[] {
  const labels: { label: string; offset: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  for (let i = 0; i < days.length; i += 7) {
    const d = new Date(days[i]!.date);
    const month = d.getMonth();
    if (month !== lastMonth) {
      labels.push({ label: monthNames[month]!, offset: Math.floor(i / 7) });
      lastMonth = month;
    }
  }

  return labels;
}
