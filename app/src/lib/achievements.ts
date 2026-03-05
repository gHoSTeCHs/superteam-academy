interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: "progress" | "streaks" | "skills" | "special";
  xpReward: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson",
    category: "progress",
    xpReward: 50,
  },
  {
    id: "course-completer",
    name: "Course Completer",
    description: "Complete an entire course",
    category: "progress",
    xpReward: 200,
  },
  {
    id: "speed-runner",
    name: "Speed Runner",
    description: "Complete a course in under 24 hours",
    category: "progress",
    xpReward: 300,
  },
  {
    id: "five-lessons",
    name: "Five Down",
    description: "Complete 5 lessons",
    category: "progress",
    xpReward: 75,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    category: "streaks",
    xpReward: 100,
  },
  {
    id: "monthly-master",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    category: "streaks",
    xpReward: 500,
  },
  {
    id: "century-scholar",
    name: "Century Scholar",
    description: "Maintain a 100-day streak",
    category: "streaks",
    xpReward: 1000,
  },
  {
    id: "rust-rookie",
    name: "Rust Rookie",
    description: "Complete a Rust course",
    category: "skills",
    xpReward: 150,
  },
  {
    id: "anchor-expert",
    name: "Anchor Expert",
    description: "Complete all Anchor courses",
    category: "skills",
    xpReward: 500,
  },
  {
    id: "defi-degen",
    name: "DeFi Degen",
    description: "Complete a DeFi course",
    category: "skills",
    xpReward: 150,
  },
  {
    id: "nft-creator",
    name: "NFT Creator",
    description: "Complete an NFT course",
    category: "skills",
    xpReward: 150,
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Join during launch month",
    category: "special",
    xpReward: 100,
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Score 100% on all quizzes in a course",
    category: "special",
    xpReward: 250,
  },
  {
    id: "code-warrior",
    name: "Code Warrior",
    description: "Complete 10 code challenges",
    category: "special",
    xpReward: 200,
  },
  {
    id: "community-builder",
    name: "Community Builder",
    description: "Share a certificate on Twitter",
    category: "special",
    xpReward: 50,
  },
];

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];
export type AchievementCategory = AchievementDefinition["category"];

export function getAchievementById(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getNewStreakAchievements(
  previousStreak: number,
  newStreak: number,
): AchievementDefinition[] {
  const thresholds = [
    { threshold: 7, id: "week-warrior" },
    { threshold: 30, id: "monthly-master" },
    { threshold: 100, id: "century-scholar" },
  ];

  return thresholds
    .filter((t) => previousStreak < t.threshold && newStreak >= t.threshold)
    .map((t) => ACHIEVEMENTS.find((a) => a.id === t.id)!)
    .filter(Boolean);
}
