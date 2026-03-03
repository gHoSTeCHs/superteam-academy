import {
  TrophyIcon,
  FlameIcon,
  RocketIcon,
  CodeIcon,
  StarIcon,
  ZapIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: "progress" | "streaks" | "skills" | "special";
  xpReward: number;
  earnedAt?: string;
  earned: boolean;
}

interface RecentAchievementsProps {
  achievements: Achievement[];
  className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
  progress: RocketIcon,
  streaks: FlameIcon,
  skills: CodeIcon,
  special: StarIcon,
};

const categoryColors: Record<string, string> = {
  progress: "bg-primary/10 text-primary",
  streaks: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  skills: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  special: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function RecentAchievements({
  achievements,
  className,
}: RecentAchievementsProps) {
  return (
    <Card className={cn("px-6 py-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Achievements
        </h3>
        <span
          className="text-[12px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {achievements.filter((a) => a.earned).length}/{achievements.length}{" "}
          earned
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = categoryIcons[achievement.category] ?? TrophyIcon;
          const colorClass =
            categoryColors[achievement.category] ?? categoryColors.progress;

          return (
            <div
              key={achievement.id}
              className={cn(
                "flex flex-col items-center rounded-xl border border-border p-3 text-center transition-all",
                achievement.earned
                  ? "bg-card"
                  : "bg-muted/50 opacity-50 grayscale",
              )}
            >
              <div
                className={cn(
                  "mb-2 flex size-10 items-center justify-center rounded-full",
                  colorClass,
                )}
              >
                <Icon className="size-5" />
              </div>
              <p
                className="mb-0.5 text-[12px] font-semibold text-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {achievement.name}
              </p>
              <p
                className="mb-2 line-clamp-2 text-[10px] leading-tight text-muted-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {achievement.description}
              </p>
              {achievement.earned ? (
                <Badge variant="reward" className="text-[9px]">
                  <ZapIcon className="mr-0.5 size-2.5" />+{achievement.xpReward}{" "}
                  XP
                </Badge>
              ) : (
                <Badge variant="neutral" className="text-[9px]">
                  Locked
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
