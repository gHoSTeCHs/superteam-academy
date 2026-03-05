"use client";

import {
  BookOpenIcon,
  UsersIcon,
  GraduationCapIcon,
  ZapIcon,
  FileEditIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  stats?: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    totalUsers: number;
    totalXpAwarded: number;
  };
  recentActivity?: {
    id: string;
    action: string;
    target: string;
    timestamp: string;
  }[];
  className?: string;
}

const DEFAULT_STATS = {
  totalCourses: 12,
  publishedCourses: 8,
  draftCourses: 4,
  totalEnrollments: 523,
  totalUsers: 847,
  totalXpAwarded: 42650,
};

const DEFAULT_ACTIVITY = [
  {
    id: "1",
    action: "Published",
    target: "Anchor Framework Deep Dive",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    action: "Created lesson",
    target: "Token Extensions Overview",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    action: "Updated",
    target: "Introduction to Solana",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    action: "New enrollment",
    target: "DeFi Protocol Design",
    timestamp: "1 day ago",
  },
  {
    id: "5",
    action: "Created",
    target: "NFT Marketplace Tutorial",
    timestamp: "2 days ago",
  },
];

export function AdminDashboard({
  stats = DEFAULT_STATS,
  recentActivity = DEFAULT_ACTIVITY,
  className,
}: AdminDashboardProps) {
  const t = useTranslations("AdminCommon");

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpenIcon}
          title={t("statTotalCourses")}
          value={stats.totalCourses}
          description="+2 this month"
        />
        <StatCard
          icon={UsersIcon}
          title={t("statTotalUsers")}
          value={stats.totalUsers}
          description="+48 this week"
        />
        <StatCard
          icon={GraduationCapIcon}
          title={t("statEnrollments")}
          value={stats.totalEnrollments}
          description="+32 this week"
        />
        <StatCard
          icon={ZapIcon}
          title={t("statXpAwarded")}
          value={stats.totalXpAwarded.toLocaleString()}
          description="+1,250 this week"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="px-5 py-4">
          <h3
            className="mb-3 text-[14px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("courseStatus")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-primary" />
                <span
                  className="text-[13px] text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {t("statusPublished")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[14px] font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stats.publishedCourses}
                </span>
                <div className="h-2.5 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(stats.publishedCourses / stats.totalCourses) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEditIcon className="size-4 text-yellow-600 dark:text-yellow-400" />
                <span
                  className="text-[13px] text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {t("statusDraft")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[14px] font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stats.draftCourses}
                </span>
                <div className="h-2.5 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-yellow-500"
                    style={{
                      width: `${(stats.draftCourses / stats.totalCourses) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="px-5 py-4">
          <h3
            className="mb-3 text-[14px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("recentActivity")}
          </h3>
          <div className="space-y-2.5">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <ClockIcon className="size-3.5 text-muted-foreground" />
                  <span
                    className="font-medium text-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.action}
                  </span>
                  <span
                    className="text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.target}
                  </span>
                </div>
                <span
                  className="text-[11px] text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
