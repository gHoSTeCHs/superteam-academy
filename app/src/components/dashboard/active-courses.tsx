'use client';

import Link from 'next/link';
import { PlayIcon, BookOpenIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/courses/progress-bar';
import DifficultyBadge from '@/components/difficulty-badge';
import { cn } from '@/lib/utils';

interface ActiveCourse {
  id: string;
  title: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedLessons: number;
  totalLessons: number;
  nextLessonTitle: string;
  nextLessonSlug: string;
}

interface ActiveCoursesProps {
  courses: ActiveCourse[];
  className?: string;
}

export function ActiveCourses({ courses, className }: ActiveCoursesProps) {
  if (courses.length === 0) {
    return (
      <Card className={cn('px-6 py-8 text-center', className)}>
        <BookOpenIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p
          className="text-[14px] font-medium text-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          No active courses
        </p>
        <p
          className="mt-1 text-[13px] text-muted-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Enroll in a course to start learning
        </p>
        <Button variant="primary" size="sm" className="mt-4" asChild>
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {courses.map((course) => {
        const progress = Math.round(
          (course.completedLessons / course.totalLessons) * 100,
        );
        return (
          <Card key={course.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4
                    className="truncate text-[14px] font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {course.title}
                  </h4>
                  <DifficultyBadge level={course.difficulty} />
                </div>
                <ProgressBar
                  value={progress}
                  label={`${course.completedLessons} of ${course.totalLessons} lessons`}
                  size="sm"
                  className="mb-3"
                />
                <div className="flex items-center gap-2">
                  <span
                    className="text-[12px] text-muted-foreground"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Next: {course.nextLessonTitle}
                  </span>
                </div>
              </div>
              <Button variant="primary" size="sm" className="shrink-0 gap-1.5" asChild>
                <Link href={`/courses/${course.slug}/lessons/${course.nextLessonSlug}`}>
                  <PlayIcon className="size-3.5" />
                  Continue
                </Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
