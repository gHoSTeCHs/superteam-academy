import { toast } from "sonner";
import { TrophyIcon, FlameIcon } from "lucide-react";

interface ToastableAchievement {
  name: string;
  description: string;
  category: string;
}

export function showAchievementToast(achievement: ToastableAchievement) {
  toast(achievement.name, {
    description: achievement.description,
    icon:
      achievement.category === "streaks" ? (
        <FlameIcon className="size-5" style={{ color: "#ffd23f" }} />
      ) : (
        <TrophyIcon className="size-5 text-primary" />
      ),
    duration: 4000,
  });
}
