import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { safeFetch } from "@/sanity/client";
import { groq } from "next-sanity";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { count } from "drizzle-orm";

interface SanityStats {
  total: number;
  published: number;
  draft: number;
}

interface RecentCourse {
  _id: string;
  title: string;
  _createdAt: string;
  isPublished: boolean;
}

async function getCourseStats(): Promise<SanityStats> {
  try {
    const result = await safeFetch<SanityStats>(groq`{
      "total": count(*[_type == "course"]),
      "published": count(*[_type == "course" && isPublished == true]),
      "draft": count(*[_type == "course" && (isPublished == false || !defined(isPublished))])
    }`);
    return result ?? { total: 0, published: 0, draft: 0 };
  } catch {
    return { total: 0, published: 0, draft: 0 };
  }
}

async function getUserCount(): Promise<number> {
  try {
    const result = await db.select({ value: count() }).from(user);
    return result[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

async function getRecentActivity(): Promise<RecentCourse[]> {
  try {
    const result = await safeFetch<RecentCourse[]>(groq`
      *[_type == "course"] | order(_createdAt desc)[0...5] {
        "_id": _id,
        title,
        _createdAt,
        isPublished
      }
    `);
    return result ?? [];
  } catch {
    return [];
  }
}

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${String(hours)} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${String(days)} day${days === 1 ? "" : "s"} ago`;
}

export default async function AdminPage() {
  const [courseStats, userCount, recentCourses] = await Promise.all([
    getCourseStats(),
    getUserCount(),
    getRecentActivity(),
  ]);

  const stats = {
    totalCourses: courseStats.total,
    publishedCourses: courseStats.published,
    draftCourses: courseStats.draft,
    totalEnrollments: 0,
    totalUsers: userCount,
    totalXpAwarded: 0,
  };

  const recentActivity = recentCourses.map((c) => ({
    id: c._id,
    action: c.isPublished ? "Published" : "Created",
    target: c.title,
    timestamp: formatRelativeTime(c._createdAt),
  }));

  return <AdminDashboard stats={stats} recentActivity={recentActivity} />;
}
