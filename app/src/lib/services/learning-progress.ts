import "server-only";
import { PublicKey } from "@solana/web3.js";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  enrollment,
  lessonCompletion,
  courseCompletion,
} from "@/db/schema/custom";
import { getXpBalance } from "@/lib/solana/helius";
import { safeFetch } from "@/sanity/client";
import { allCoursesQuery } from "@/sanity/queries";

export interface ActiveCourse {
  id: string;
  title: string;
  slug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  completedLessons: number;
  totalLessons: number;
  nextLessonTitle: string;
  nextLessonSlug: string;
}

export type ActivityType =
  | "lesson_complete"
  | "course_complete"
  | "achievement"
  | "xp_earned"
  | "streak_milestone";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  xp?: number;
}

interface SanityCourse {
  id: string;
  title: string;
  slug: string;
  difficulty?: string;
  modules?: Array<{
    lessons?: Array<{
      id: string;
      title: string;
      slug: string;
    }>;
  }>;
}

export async function getUserXpBalance(walletAddress: string): Promise<number> {
  try {
    const balance = await getXpBalance(new PublicKey(walletAddress));
    return balance.amount;
  } catch {
    return 0;
  }
}

export async function getActiveEnrollments(
  userId: string,
): Promise<ActiveCourse[]> {
  const [enrollments, courses, completions] = await Promise.all([
    db.select().from(enrollment).where(eq(enrollment.userId, userId)),
    safeFetch<SanityCourse[]>(allCoursesQuery),
    db
      .select()
      .from(lessonCompletion)
      .where(eq(lessonCompletion.userId, userId)),
  ]);

  if (!courses || enrollments.length === 0) return [];

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const completionsByCourse = new Map<string, Set<number>>();
  for (const lc of completions) {
    let set = completionsByCourse.get(lc.sanityCourseId);
    if (!set) {
      set = new Set();
      completionsByCourse.set(lc.sanityCourseId, set);
    }
    set.add(lc.lessonIndex);
  }

  const results: ActiveCourse[] = [];
  for (const enr of enrollments) {
    if (enr.closedAt) continue;
    const course = courseMap.get(enr.sanityCourseId);
    if (!course) continue;

    const allLessons = course.modules?.flatMap((m) => m.lessons ?? []) ?? [];
    const totalLessons = allLessons.length;
    if (totalLessons === 0) continue;

    const completed = completionsByCourse.get(enr.sanityCourseId);
    const completedCount = completed?.size ?? 0;

    const nextLesson =
      allLessons.find((_, i) => !completed?.has(i)) ?? allLessons[0]!;

    results.push({
      id: enr.sanityCourseId,
      title: course.title,
      slug: course.slug,
      difficulty:
        (course.difficulty as ActiveCourse["difficulty"]) ?? "beginner",
      completedLessons: completedCount,
      totalLessons,
      nextLessonTitle: nextLesson.title,
      nextLessonSlug: nextLesson.slug,
    });
  }

  return results;
}

export async function getRecentActivity(
  userId: string,
  limit = 10,
): Promise<ActivityItem[]> {
  const [lessonCompletions, courseCompletions] = await Promise.all([
    db
      .select()
      .from(lessonCompletion)
      .where(eq(lessonCompletion.userId, userId))
      .orderBy(desc(lessonCompletion.completedAt))
      .limit(limit),
    db
      .select()
      .from(courseCompletion)
      .where(eq(courseCompletion.userId, userId))
      .orderBy(desc(courseCompletion.completedAt))
      .limit(limit),
  ]);

  const items: ActivityItem[] = [
    ...lessonCompletions.map((lc) => ({
      id: lc.id,
      type: "lesson_complete" as const,
      title: `Lesson ${lc.lessonIndex + 1} completed`,
      description: lc.sanityCourseId,
      timestamp: lc.completedAt.toISOString(),
    })),
    ...courseCompletions.map((cc) => ({
      id: cc.id,
      type: "course_complete" as const,
      title: "Course completed",
      description: cc.sanityCourseId,
      timestamp: cc.completedAt.toISOString(),
    })),
  ];

  items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return items.slice(0, limit);
}
