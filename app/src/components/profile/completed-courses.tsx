import { CheckCircle2Icon, BookOpenIcon, ZapIcon, ClockIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import DifficultyBadge from '@/components/difficulty-badge';
import { cn } from '@/lib/utils';

export interface CompletedCourse {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessonsCompleted: number;
  totalLessons: number;
  xpEarned: number;
  completedAt: string;
}

interface CompletedCoursesProps {
  courses: CompletedCourse[];
  className?: string;
}

export function CompletedCourses({ courses, className }: CompletedCoursesProps) {
  return (
    <Card className={cn('px-6 py-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="size-4 text-primary" />
          <h3
            className="text-[14px] font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Completed Courses
          </h3>
        </div>
        <span
          className="text-[12px] text-muted-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {courses.length} completed
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="py-6 text-center">
          <BookOpenIcon className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p
            className="text-[13px] text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            No completed courses yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2Icon className="size-4 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className="truncate text-[13px] font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {course.title}
                  </p>
                  <DifficultyBadge level={course.difficulty} />
                </div>
                <div className="mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BookOpenIcon className="size-3" />
                    <span style={{ fontFamily: 'var(--font-body)' }}>
                      {course.lessonsCompleted}/{course.totalLessons}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: '#ffd23f' }}>
                    <ZapIcon className="size-3" />
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.xpEarned} XP
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ClockIcon className="size-3" />
                    <span style={{ fontFamily: 'var(--font-body)' }}>{course.completedAt}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
