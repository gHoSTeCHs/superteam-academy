'use client';

import { CalendarIcon, BookOpenIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type Timeframe = 'weekly' | 'monthly' | 'all-time';

interface LeaderboardFiltersProps {
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  courseFilter: string;
  onCourseFilterChange: (courseId: string) => void;
  courses?: { id: string; title: string }[];
  className?: string;
}

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'all-time', label: 'All Time' },
];

export function LeaderboardFilters({
  timeframe,
  onTimeframeChange,
  courseFilter,
  onCourseFilterChange,
  courses = [],
  className,
}: LeaderboardFiltersProps) {
  return (
    <Card className={cn('flex flex-wrap items-center gap-4 px-5 py-3', className)}>
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span
          className="text-[12px] font-semibold text-muted-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Timeframe
        </span>
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              type="button"
              onClick={() => onTimeframeChange(tf.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
                timeframe === tf.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {courses.length > 0 && (
        <div className="flex items-center gap-2">
          <BookOpenIcon className="size-4 text-muted-foreground" />
          <span
            className="text-[12px] font-semibold text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Course
          </span>
          <select
            value={courseFilter}
            onChange={(e) => onCourseFilterChange(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      )}
    </Card>
  );
}
