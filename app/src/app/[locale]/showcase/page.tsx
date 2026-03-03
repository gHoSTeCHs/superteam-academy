"use client";

import { useState, type ReactNode } from "react";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { CourseTable } from "@/components/admin/course-table";
import type { AdminCourseRow } from "@/components/admin/course-table";
import { PageHeader } from "@/components/admin/page-header";
import { PreviewBanner } from "@/components/admin/preview-banner";
import { BlockList } from "@/components/admin/content-editor";
import { CourseTree } from "@/components/admin/course-builder";
import {
  McqBuilder,
  TrueFalseBuilder,
  MatchingBuilder,
} from "@/components/admin/question-builders";
import type {
  McqConfig,
  TrueFalseConfig,
  MatchingConfig,
} from "@/components/admin/question-builders";
import BlockTypeIcon from "@/components/block-type-icon";
import { CodeChallenge } from "@/components/code-challenge";
import { CodeEditor } from "@/components/code-editor";
import ContextCard from "@/components/context-card";
import type { ContextCardData } from "@/components/context-card";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseHeader } from "@/components/courses/course-header";
import { EnrollButton } from "@/components/courses/enroll-button";
import { ModuleList } from "@/components/courses/module-list";
import { ProgressBar } from "@/components/courses/progress-bar";
import { ActiveCourses } from "@/components/dashboard/active-courses";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RecentAchievements } from "@/components/dashboard/recent-achievements";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { XpLevelCard } from "@/components/dashboard/xp-level-card";
import { CertificateDisplay } from "@/components/certificates/certificate-display";
import type { CertificateData } from "@/components/certificates/certificate-display";
import { OnChainProof } from "@/components/certificates/on-chain-proof";
import { CertificateShare } from "@/components/certificates/certificate-share";
import { SignInForm } from "@/components/auth/sign-in-form";
import { WalletSignIn } from "@/components/auth/wallet-sign-in";
import DifficultyBadge from "@/components/difficulty-badge";
import { Hero } from "@/components/landing/hero";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SkillRadar } from "@/components/profile/skill-radar";
import { BadgeShowcase } from "@/components/profile/badge-showcase";
import { CredentialCards } from "@/components/profile/credential-cards";
import { CompletedCourses } from "@/components/profile/completed-courses";
import { Features } from "@/components/landing/features";
import { CoursePreview } from "@/components/landing/course-preview";
import { Cta } from "@/components/landing/cta";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import type { LeaderboardEntry } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import type { Timeframe } from "@/components/leaderboard/leaderboard-filters";
import { UserRankCard } from "@/components/leaderboard/user-rank-card";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LanguageSettings } from "@/components/settings/language-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { LinkedAccounts } from "@/components/settings/linked-accounts";
import { LessonCompleteButton } from "@/components/lessons/lesson-complete-button";
import { LessonContent } from "@/components/lessons/lesson-content";
import { LessonNavigation } from "@/components/lessons/lesson-navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { WalletButton } from "@/components/layout/wallet-button";
import QuestionRenderer from "@/components/question-renderer";
import type { ShowcaseQuestion } from "@/components/question-renderer";
import QuestionTypeBadge from "@/components/question-type-badge";
import { TiptapEditor } from "@/components/tiptap-editor";
import { VideoPlayer } from "@/components/video-player";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getCalendarData } from "@/lib/streaks";
import type { CodeChallengeData, ContentBlock } from "@/types/content";
import type { Course } from "@/types/course";
import type { TiptapJSON } from "@/types/tiptap";
import type { VideoCheckpoint } from "@/types/video";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-2.5">
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="mb-8 text-[28px] font-bold tracking-tight"
      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
}

const brandColors = [
  { name: "Yellow", hex: "#ffd23f", textDark: true },
  { name: "Cream", hex: "#f7eacb", textDark: true },
  { name: "Dark Green", hex: "#2f6b3f", textDark: false },
  { name: "Emerald", hex: "#008c4c", textDark: false },
  { name: "Near-black", hex: "#1b231d", textDark: false },
];

const buttonVariants = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "danger",
] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const badgeData = [
  { variant: "primary" as const, label: "Beginner" },
  { variant: "danger" as const, label: "Advanced" },
  { variant: "reward" as const, label: "Featured" },
  { variant: "neutral" as const, label: "Draft" },
  { variant: "solid" as const, label: "Active" },
];

const QUESTION_TYPES = [
  "mcq",
  "multi_select_mcq",
  "theory",
  "short_answer",
  "essay",
  "fill_blank",
  "cloze",
  "matching",
  "ordering",
  "true_false",
  "diagram_label",
  "calculation",
  "assertion_reason",
  "matrix_matching",
  "numeric_entry",
  "group",
] as const;

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"] as const;

const BLOCK_TYPES = [
  "container",
  "text",
  "code",
  "diagram",
  "example",
  "exercise",
  "quiz",
  "reference",
  "comparison",
] as const;

const SAMPLE_CONTEXTS: ContextCardData[] = [
  {
    id: "ctx-passage-1",
    contextType: "passage",
    title: "Understanding Solana Accounts",
    content:
      'On Solana, all data is stored in what are called "accounts". Each account has a unique address (public key), ' +
      "a lamport balance, an owner program, and an optional data field. Programs themselves are stored in executable " +
      "accounts, while the state they manage is stored in separate data accounts. This separation of code and state " +
      "is a fundamental difference between Solana and EVM-based chains.",
  },
  {
    id: "ctx-table-1",
    contextType: "table",
    title: "Solana vs Ethereum Comparison",
    tableData: {
      headers: ["Feature", "Solana", "Ethereum"],
      rows: [
        [
          "Consensus",
          "Proof of History + Tower BFT",
          "Proof of Stake (Casper)",
        ],
        ["Block Time", "~400ms", "~12s"],
        ["Transaction Fee", "~$0.00025", "~$1-50 (varies)"],
        ["Programming Language", "Rust / Anchor", "Solidity / Vyper"],
      ],
    },
  },
  {
    id: "ctx-wordbank-1",
    contextType: "word_bank",
    title: "Solana Terminology",
    wordBank: [
      "validator",
      "slot",
      "epoch",
      "lamport",
      "rent",
      "PDA",
      "CPI",
      "ATA",
      "SPL token",
      "sealevel",
    ],
  },
];

const SAMPLE_QUESTION: ShowcaseQuestion = {
  number: "Q1",
  displayLabel: "Question 1",
  type: "group",
  content:
    "Solana Account Model -- Answer the following questions about how Solana stores data on-chain.",
  marks: 10,
  children: [
    {
      number: "Q1.a",
      displayLabel: "(a)",
      type: "mcq",
      content: "What is the maximum size of a Solana account data field?",
      marks: 3,
      options: [
        { label: "A", text: "1 MB", isCorrect: false },
        { label: "B", text: "10 MB", isCorrect: true },
        { label: "C", text: "100 KB", isCorrect: false },
        { label: "D", text: "Unlimited", isCorrect: false },
      ],
      children: [],
    },
    {
      number: "Q1.b",
      displayLabel: "(b)",
      type: "true_false",
      content:
        "On Solana, programs (smart contracts) can store mutable state within their own executable account.",
      marks: 2,
      trueFalseAnswer: false,
      requiresJustification: true,
      children: [],
    },
    {
      number: "Q1.c",
      displayLabel: "(c)",
      type: "matching",
      content: "Match each Solana concept with its correct description.",
      marks: 5,
      matchingPairs: [
        { left: "PDA", right: "Program-derived address without a private key" },
        { left: "CPI", right: "One program invoking another on-chain" },
        { left: "ATA", right: "Default token account for a wallet-mint pair" },
      ],
      matchingDistractors: [
        "A keypair generated off-chain",
        "The genesis block hash",
      ],
      children: [],
    },
  ],
};

const SAMPLE_TIPTAP_CONTENT: TiptapJSON = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Welcome to Solana Development" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is a sample rich text document rendered using TiptapRenderer. It supports ",
        },
        { type: "text", marks: [{ type: "bold" }], text: "bold" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "italic" }], text: "italic" },
        { type: "text", text: ", and other formatting." },
      ],
    },
  ],
};

const SAMPLE_CODE = `function findLargestAccount(accounts: { address: string; lamports: number }[]) {
  return accounts.reduce((max, acc) =>
    acc.lamports > max.lamports ? acc : max
  );
}`;

const SAMPLE_CHALLENGE: CodeChallengeData = {
  type: "code_challenge",
  language: "typescript",
  starterCode: `function addLamports(a: number, b: number): number {
  /* Your code here */
}`,
  solutionCode: `function addLamports(a: number, b: number): number {
  return a + b;
}`,
  testCases: [
    {
      name: "adds two positive numbers",
      assertionCode:
        'if (addLamports(2, 3) !== 5) throw new Error("Expected 5")',
    },
    {
      name: "handles zero",
      assertionCode:
        'if (addLamports(0, 100) !== 100) throw new Error("Expected 100")',
    },
    {
      name: "adds large lamport values",
      assertionCode:
        'if (addLamports(1000000, 2000000) !== 3000000) throw new Error("Expected 3000000")',
    },
  ],
  hints: [
    "Use the + operator to add two numbers together.",
    "Make sure to return the result with the return keyword.",
  ],
  maxAttempts: 5,
};

const SAMPLE_VIDEO_CHECKPOINTS: VideoCheckpoint[] = [
  {
    id: "cp-1",
    timestamp: 10,
    type: "quiz",
    questionData: {
      questionType: "mcq",
      content: "What is the smallest unit of SOL called?",
      responseConfig: {
        options: [
          { label: "A", text: "Lamport", is_correct: true },
          { label: "B", text: "Wei", is_correct: false },
          { label: "C", text: "Satoshi", is_correct: false },
          { label: "D", text: "Gwei", is_correct: false },
        ],
      },
    },
    maxAttempts: 3,
    hint: "Named after Leslie Lamport, who created the distributed systems theory Solana is built on.",
    skippable: true,
    xpReward: 5,
  },
  {
    id: "cp-2",
    timestamp: 30,
    type: "quiz",
    questionData: {
      questionType: "mcq",
      content: "How many lamports are in 1 SOL?",
      responseConfig: {
        options: [
          { label: "A", text: "1,000", is_correct: false },
          { label: "B", text: "1,000,000", is_correct: false },
          { label: "C", text: "1,000,000,000", is_correct: true },
          { label: "D", text: "1,000,000,000,000", is_correct: false },
        ],
      },
    },
    maxAttempts: 2,
    skippable: true,
    xpReward: 10,
  },
];

const CATALOG_COURSES: {
  course: Course;
  slug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  enrollmentCount: number;
  progress?: number;
}[] = [
  {
    slug: "intro-to-solana",
    difficulty: "beginner",
    enrollmentCount: 342,
    progress: 65,
    course: {
      id: "course-1",
      title: "Introduction to Solana Development",
      description:
        "Learn the fundamentals of building on Solana, from account models to program deployment.",
      language: "en",
      tags: ["solana", "rust"],
      modules: [
        {
          id: "m1",
          title: "Solana Basics",
          description: "",
          type: "text",
          sortOrder: 0,
          lessons: [
            {
              id: "l1",
              title: "What is Solana?",
              xpReward: 10,
              estimatedMinutes: 15,
              difficulty: "beginner",
              sortOrder: 0,
            },
            {
              id: "l2",
              title: "Account Model",
              xpReward: 15,
              estimatedMinutes: 20,
              difficulty: "beginner",
              sortOrder: 1,
            },
            {
              id: "l3",
              title: "Transactions",
              xpReward: 15,
              estimatedMinutes: 20,
              difficulty: "beginner",
              sortOrder: 2,
            },
          ],
        },
        {
          id: "m2",
          title: "First Program",
          description: "",
          type: "assessment",
          sortOrder: 1,
          lessons: [
            {
              id: "l4",
              title: "Hello World",
              xpReward: 25,
              estimatedMinutes: 30,
              difficulty: "intermediate",
              sortOrder: 0,
            },
            {
              id: "l5",
              title: "Testing",
              xpReward: 20,
              estimatedMinutes: 25,
              difficulty: "intermediate",
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },
  {
    slug: "anchor-fundamentals",
    difficulty: "intermediate",
    enrollmentCount: 189,
    course: {
      id: "course-2",
      title: "Anchor Framework Fundamentals",
      description:
        "Master the Anchor framework for building secure and efficient Solana programs with Rust.",
      language: "en",
      tags: ["anchor", "rust"],
      modules: [
        {
          id: "m3",
          title: "Anchor Setup",
          description: "",
          type: "text",
          sortOrder: 0,
          lessons: [
            {
              id: "l6",
              title: "Project Structure",
              xpReward: 15,
              estimatedMinutes: 20,
              difficulty: "intermediate",
              sortOrder: 0,
            },
            {
              id: "l7",
              title: "Accounts & Context",
              xpReward: 20,
              estimatedMinutes: 25,
              difficulty: "intermediate",
              sortOrder: 1,
            },
          ],
        },
        {
          id: "m4",
          title: "Advanced Patterns",
          description: "",
          type: "assessment",
          sortOrder: 1,
          lessons: [
            {
              id: "l8",
              title: "PDAs",
              xpReward: 30,
              estimatedMinutes: 35,
              difficulty: "advanced",
              sortOrder: 0,
            },
            {
              id: "l9",
              title: "CPIs",
              xpReward: 30,
              estimatedMinutes: 35,
              difficulty: "advanced",
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },
  {
    slug: "defi-on-solana",
    difficulty: "advanced",
    enrollmentCount: 87,
    course: {
      id: "course-3",
      title: "DeFi Protocol Design on Solana",
      description:
        "Design and implement AMMs, lending protocols, and yield strategies on Solana.",
      language: "en",
      tags: ["defi", "solana"],
      modules: [
        {
          id: "m5",
          title: "AMM Design",
          description: "",
          type: "text",
          sortOrder: 0,
          lessons: [
            {
              id: "l10",
              title: "Constant Product AMM",
              xpReward: 35,
              estimatedMinutes: 40,
              difficulty: "advanced",
              sortOrder: 0,
            },
            {
              id: "l11",
              title: "Liquidity Pools",
              xpReward: 35,
              estimatedMinutes: 40,
              difficulty: "advanced",
              sortOrder: 1,
            },
          ],
        },
        {
          id: "m6",
          title: "Lending",
          description: "",
          type: "assessment",
          sortOrder: 1,
          lessons: [
            {
              id: "l12",
              title: "Interest Rate Models",
              xpReward: 40,
              estimatedMinutes: 45,
              difficulty: "advanced",
              sortOrder: 0,
            },
          ],
        },
      ],
    },
  },
];

const SAMPLE_LESSON_BLOCKS: ContentBlock[] = [
  {
    id: "blk-1",
    type: "text",
    sortOrder: 0,
    data: {
      type: "text",
      content: [
        {
          _type: "block",
          _key: "h1",
          style: "h2",
          children: [
            {
              _type: "span",
              _key: "h1s1",
              text: "Understanding Solana Accounts",
              marks: [],
            },
          ],
          markDefs: [],
        },
        {
          _type: "block",
          _key: "p1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "p1s1",
              text: "On Solana, all data is stored in ",
              marks: [],
            },
            {
              _type: "span",
              _key: "p1s2",
              text: "accounts",
              marks: ["strong"],
            },
            {
              _type: "span",
              _key: "p1s3",
              text: ". Each account has a unique address (public key), a lamport balance, an owner program, and an optional data field.",
              marks: [],
            },
          ],
          markDefs: [],
        },
        {
          _type: "block",
          _key: "p2",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "p2s1",
              text: "Programs themselves are stored in executable accounts, while the state they manage is stored in separate data accounts. This separation of code and state is a fundamental difference between Solana and EVM-based chains.",
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
    },
  },
  {
    id: "blk-2",
    type: "callout",
    sortOrder: 1,
    data: {
      type: "callout",
      calloutType: "tip",
      title: "Key Insight",
      content:
        "Unlike Ethereum where smart contracts store their own state, Solana programs are stateless. All state is stored in separate accounts that the program owns.",
    },
  },
  {
    id: "blk-3",
    type: "code_example",
    sortOrder: 2,
    data: {
      type: "code_example",
      language: "rust",
      filename: "account_model.rs",
      code: `use anchor_lang::prelude::*;

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub xp_balance: u64,
    pub courses_completed: u16,
    pub streak_days: u16,
    pub bump: u8,
}

impl UserProfile {
    pub const LEN: usize = 8 + 32 + 8 + 2 + 2 + 1;
}`,
    },
  },
  {
    id: "blk-4",
    type: "text",
    sortOrder: 3,
    data: {
      type: "text",
      content: [
        {
          _type: "block",
          _key: "h2",
          style: "h3",
          children: [
            {
              _type: "span",
              _key: "h2s1",
              text: "Program Derived Addresses (PDAs)",
              marks: [],
            },
          ],
          markDefs: [],
        },
        {
          _type: "block",
          _key: "p3",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "p3s1",
              text: "PDAs are special addresses that are derived deterministically from a set of seeds and a program ID. They don't have corresponding private keys, which means only the program can sign for them.",
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
    },
  },
  {
    id: "blk-5",
    type: "callout",
    sortOrder: 4,
    data: {
      type: "callout",
      calloutType: "warning",
      title: "Common Mistake",
      content:
        "Never use find_program_address in on-chain code — use bump seeds from your account validation instead. Calling find_program_address on-chain wastes compute units.",
    },
  },
  {
    id: "blk-6",
    type: "code_challenge",
    sortOrder: 5,
    data: {
      type: "code_challenge",
      language: "typescript",
      starterCode: `function derivePDA(programId: string, seed: string): string {
  /* Your code here */
}`,
      solutionCode: `function derivePDA(programId: string, seed: string): string {
  return programId + ":" + seed;
}`,
      testCases: [
        {
          name: "derives PDA from program ID and seed",
          assertionCode:
            'if (derivePDA("abc", "user") !== "abc:user") throw new Error("Expected abc:user")',
        },
        {
          name: "handles empty seed",
          assertionCode:
            'if (derivePDA("abc", "") !== "abc:") throw new Error("Expected abc:")',
        },
      ],
      hints: [
        "Concatenate the programId and seed with a separator.",
        "Use the + operator with a colon separator.",
      ],
      maxAttempts: 5,
    },
  },
  {
    id: "blk-7",
    type: "quiz",
    sortOrder: 6,
    data: {
      type: "quiz",
      questionType: "mcq",
      content: "What is the maximum size of a Solana account's data field?",
      responseConfig: {
        options: [
          { label: "A", text: "1 MB", is_correct: false },
          { label: "B", text: "10 MB", is_correct: true },
          { label: "C", text: "100 KB", is_correct: false },
          { label: "D", text: "Unlimited", is_correct: false },
        ],
      },
    },
  },
];

const MOCK_ACTIVE_COURSES = [
  {
    id: "course-1",
    title: "Introduction to Solana Development",
    slug: "intro-to-solana",
    difficulty: "beginner" as const,
    completedLessons: 3,
    totalLessons: 5,
    nextLessonTitle: "Hello World Program",
    nextLessonSlug: "hello-world",
  },
  {
    id: "course-2",
    title: "Anchor Framework Fundamentals",
    slug: "anchor-fundamentals",
    difficulty: "intermediate" as const,
    completedLessons: 1,
    totalLessons: 4,
    nextLessonTitle: "Accounts & Context",
    nextLessonSlug: "accounts-context",
  },
];

const MOCK_ACHIEVEMENTS = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson",
    category: "progress" as const,
    xpReward: 50,
    earned: true,
    earnedAt: "2026-02-25",
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "7-day streak",
    category: "streaks" as const,
    xpReward: 100,
    earned: true,
    earnedAt: "2026-02-20",
  },
  {
    id: "rust-rookie",
    name: "Rust Rookie",
    description: "Complete a Rust course",
    category: "skills" as const,
    xpReward: 150,
    earned: false,
  },
  {
    id: "course-completer",
    name: "Course Completer",
    description: "Complete an entire course",
    category: "progress" as const,
    xpReward: 200,
    earned: false,
  },
  {
    id: "code-warrior",
    name: "Code Warrior",
    description: "Complete 10 code challenges",
    category: "special" as const,
    xpReward: 200,
    earned: true,
    earnedAt: "2026-02-22",
  },
  {
    id: "monthly-master",
    name: "Monthly Master",
    description: "30-day streak",
    category: "streaks" as const,
    xpReward: 500,
    earned: false,
  },
];

const MOCK_ACTIVITIES = [
  {
    id: "a1",
    type: "lesson_complete" as const,
    title: "Completed: Transactions",
    description: "Introduction to Solana Development",
    timestamp: "2 hours ago",
    xp: 15,
  },
  {
    id: "a2",
    type: "achievement" as const,
    title: "Achievement Unlocked!",
    description: "Code Warrior — Complete 10 code challenges",
    timestamp: "3 hours ago",
    xp: 200,
  },
  {
    id: "a3",
    type: "xp_earned" as const,
    title: "XP Earned",
    description: "Completed quiz in Account Model lesson",
    timestamp: "5 hours ago",
    xp: 25,
  },
  {
    id: "a4",
    type: "streak_milestone" as const,
    title: "7-Day Streak!",
    description: "Keep it up! Next milestone at 30 days",
    timestamp: "1 day ago",
  },
  {
    id: "a5",
    type: "lesson_complete" as const,
    title: "Completed: Account Model",
    description: "Introduction to Solana Development",
    timestamp: "1 day ago",
    xp: 15,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    wallet: "7nYB...kP9q",
    displayName: "SolanaWhale",
    xp: 12500,
    level: 11,
    streak: 45,
  },
  {
    rank: 2,
    wallet: "3xAf...mR2w",
    displayName: "RustCrab",
    xp: 10800,
    level: 10,
    streak: 32,
  },
  {
    rank: 3,
    wallet: "9kLm...vN4z",
    displayName: "AnchorDev",
    xp: 9200,
    level: 9,
    streak: 28,
  },
  { rank: 4, wallet: "5pQr...hJ7y", xp: 7600, level: 8, streak: 14 },
  {
    rank: 5,
    wallet: "2wEs...bK1x",
    displayName: "TokenMaster",
    xp: 6400,
    level: 8,
    streak: 7,
  },
  { rank: 6, wallet: "8tUi...cL3v", xp: 5100, level: 7, streak: 3 },
  {
    rank: 7,
    wallet: "4rOp...dM5u",
    displayName: "DeFiBuilder",
    xp: 4200,
    level: 6,
    streak: 12,
  },
  { rank: 8, wallet: "6yHg...eN8t", xp: 3800, level: 6, streak: 0 },
  {
    rank: 9,
    wallet: "1aWq...fP2s",
    displayName: "Web3Newbie",
    xp: 1850,
    level: 4,
    streak: 12,
  },
  { rank: 10, wallet: "0zXc...gQ9r", xp: 900, level: 3, streak: 1 },
];

const MOCK_LEADERBOARD_COURSES = [
  { id: "solana-101", title: "Introduction to Solana" },
  { id: "rust-basics", title: "Rust Fundamentals" },
  { id: "defi-deep-dive", title: "DeFi Deep Dive" },
];

const MOCK_CERTIFICATE: CertificateData = {
  courseName: "Introduction to Solana Development",
  trackName: "Solana Core",
  recipientName: "Web3Newbie",
  recipientWallet: "1aWqR7xkB9sNmOpQrStUvWxYzAbCdEfGhIjKlMnP2s",
  completionDate: "February 25, 2026",
  totalXp: 1850,
  level: 4,
  lessonsCompleted: 12,
  mintAddress: "CertMint7xkB9fP2sMnOpQrStUvWxYzAbCdEfGhIjKl",
};

const FEATURED_COURSES = [
  {
    id: "fc-1",
    title: "Introduction to Solana Development",
    description:
      "Learn the fundamentals of building on Solana, from account models to program deployment.",
    difficulty: "beginner" as const,
    lessonCount: 12,
    totalXp: 450,
    tags: ["solana", "rust"],
  },
  {
    id: "fc-2",
    title: "Anchor Framework Deep Dive",
    description:
      "Master the Anchor framework for building secure, tested Solana programs with TypeScript.",
    difficulty: "intermediate" as const,
    lessonCount: 16,
    totalXp: 680,
    tags: ["anchor", "rust"],
  },
  {
    id: "fc-3",
    title: "DeFi Protocol Design",
    description:
      "Build a full DeFi protocol — AMM, lending, and staking — from scratch on Solana.",
    difficulty: "advanced" as const,
    lessonCount: 20,
    totalXp: 950,
    tags: ["defi", "solana"],
  },
];

const MOCK_SKILLS = [
  { label: "Rust", value: 75 },
  { label: "Anchor", value: 60 },
  { label: "Frontend", value: 85 },
  { label: "Security", value: 30 },
  { label: "DeFi", value: 45 },
  { label: "NFTs", value: 55 },
];

const MOCK_PROFILE_BADGES = [
  {
    id: "b1",
    name: "First Steps",
    description: "Complete your first lesson",
    category: "progress" as const,
    earnedAt: "2026-01-15",
  },
  {
    id: "b2",
    name: "Week Warrior",
    description: "7-day streak",
    category: "streaks" as const,
    earnedAt: "2026-01-22",
  },
  {
    id: "b3",
    name: "Code Warrior",
    description: "Complete 10 code challenges",
    category: "skills" as const,
    earnedAt: "2026-02-01",
  },
  {
    id: "b4",
    name: "Solana Starter",
    description: "Complete Intro to Solana",
    category: "progress" as const,
    earnedAt: "2026-02-10",
  },
  {
    id: "b5",
    name: "Bug Hunter",
    description: "Find a bug in a challenge",
    category: "special" as const,
    earnedAt: "2026-02-14",
  },
  {
    id: "b6",
    name: "Speed Demon",
    description: "Complete 5 lessons in one day",
    category: "skills" as const,
    earnedAt: "2026-02-20",
  },
];

const MOCK_CREDENTIALS = [
  {
    id: "cr1",
    courseName: "Introduction to Solana",
    trackName: "Solana Core",
    level: 4,
    totalXp: 450,
    completedAt: "Feb 10, 2026",
    mintAddress: "CrEd1MiNt7xkB9fP2sMnOpQrStUvWxYzAbCdEfGh",
  },
  {
    id: "cr2",
    courseName: "Anchor Framework Deep Dive",
    trackName: "Solana Core",
    level: 6,
    totalXp: 680,
    completedAt: "Feb 25, 2026",
    mintAddress: "CrEd2MiNt3xAf9mR2wLnBcDeFgHiJkLmNoPqRsT",
  },
];

const MOCK_COMPLETED_COURSES = [
  {
    id: "cc1",
    title: "Introduction to Solana Development",
    difficulty: "beginner" as const,
    lessonsCompleted: 12,
    totalLessons: 12,
    xpEarned: 450,
    completedAt: "Feb 10",
  },
  {
    id: "cc2",
    title: "Anchor Framework Deep Dive",
    difficulty: "intermediate" as const,
    lessonsCompleted: 16,
    totalLessons: 16,
    xpEarned: 680,
    completedAt: "Feb 25",
  },
];

const MOCK_ADMIN_COURSES: AdminCourseRow[] = [
  {
    id: "ac1",
    title: "Introduction to Solana Development",
    status: "published",
    modules: 3,
    lessons: 12,
    enrollments: 234,
    createdAt: "Jan 15, 2026",
  },
  {
    id: "ac2",
    title: "Anchor Framework Deep Dive",
    status: "published",
    modules: 4,
    lessons: 16,
    enrollments: 156,
    createdAt: "Jan 28, 2026",
  },
  {
    id: "ac3",
    title: "DeFi Protocol Design",
    status: "published",
    modules: 5,
    lessons: 20,
    enrollments: 89,
    createdAt: "Feb 5, 2026",
  },
  {
    id: "ac4",
    title: "NFT Marketplace Tutorial",
    status: "draft",
    modules: 2,
    lessons: 8,
    enrollments: 0,
    createdAt: "Feb 20, 2026",
  },
  {
    id: "ac5",
    title: "Token Extensions Masterclass",
    status: "draft",
    modules: 3,
    lessons: 10,
    enrollments: 0,
    createdAt: "Feb 26, 2026",
  },
];

const SAMPLE_COURSE: Course = {
  id: "course-1",
  title: "Introduction to Solana Development",
  description:
    "Learn the fundamentals of building on Solana, from account models to program deployment.",
  language: "en",
  tags: ["solana", "rust", "web3", "beginner"],
  modules: [
    {
      id: "mod-1",
      title: "Getting Started",
      description:
        "Set up your development environment and understand Solana basics.",
      type: "text",
      sortOrder: 0,
      lessons: [
        {
          id: "les-1",
          title: "What is Solana?",
          xpReward: 10,
          estimatedMinutes: 15,
          difficulty: "beginner",
          sortOrder: 0,
        },
        {
          id: "les-2",
          title: "Setting Up Your Environment",
          xpReward: 15,
          estimatedMinutes: 20,
          difficulty: "beginner",
          sortOrder: 1,
        },
      ],
    },
    {
      id: "mod-2",
      title: "Your First Program",
      description: "Write and deploy a simple Solana program using Anchor.",
      type: "assessment",
      sortOrder: 1,
      lessons: [
        {
          id: "les-3",
          title: "Hello World Program",
          xpReward: 25,
          estimatedMinutes: 30,
          difficulty: "intermediate",
          sortOrder: 0,
        },
        {
          id: "les-4",
          title: "Testing with Bankrun",
          xpReward: 20,
          estimatedMinutes: 25,
          difficulty: "intermediate",
          sortOrder: 1,
        },
      ],
    },
  ],
};

export default function ShowcasePage() {
  const [editorValue, setEditorValue] = useState<TiptapJSON | null>(null);
  const [mcqConfig, setMcqConfig] = useState<McqConfig | null>(null);
  const [trueFalseConfig, setTrueFalseConfig] =
    useState<TrueFalseConfig | null>(null);
  const [matchingConfig, setMatchingConfig] = useState<MatchingConfig | null>(
    null,
  );
  const [codeValue, setCodeValue] = useState(SAMPLE_CODE);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [course, setCourse] = useState<Course>(SAMPLE_COURSE);
  const [lbTimeframe, setLbTimeframe] = useState<Timeframe>("all-time");
  const [lbCourseFilter, setLbCourseFilter] = useState("all");
  return (
    <div className="space-y-16">
      <section>
        <SectionLabel>Brand</SectionLabel>
        <SectionTitle>Color Palette</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {brandColors.map((color) => (
            <div key={color.hex} className="space-y-2">
              <div
                className="flex h-24 items-end rounded-xl p-3 shadow-sm"
                style={{ backgroundColor: color.hex }}
              >
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: color.textDark ? "#1b231d" : "#f7eacb" }}
                >
                  {color.hex.toUpperCase()}
                </span>
              </div>
              <p
                className="text-[13px] font-medium text-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {color.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Fonts</SectionLabel>
        <SectionTitle>Typography</SectionTitle>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Archivo -- Display Font
            </p>
            <div
              className="space-y-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <h1
                className="text-[40px] font-bold leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                H1 -- The quick brown fox
              </h1>
              <h2
                className="text-[32px] font-bold leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                H2 -- Jumps over the lazy dog
              </h2>
              <h3 className="text-[24px] font-semibold leading-snug">
                H3 -- Pack my box with five dozen
              </h3>
              <h4 className="text-[20px] font-semibold leading-snug">
                H4 -- Liquor jugs and heavy waltz
              </h4>
            </div>
            <div
              className="mt-4 flex flex-wrap gap-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-[16px] font-normal text-muted-foreground">
                Regular 400
              </span>
              <span className="text-[16px] font-medium text-muted-foreground">
                Medium 500
              </span>
              <span className="text-[16px] font-semibold text-muted-foreground">
                SemiBold 600
              </span>
              <span className="text-[16px] font-bold text-muted-foreground">
                Bold 700
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Inter -- Body Font
            </p>
            <p
              className="max-w-2xl text-[16px] leading-relaxed text-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Superteam Academy is an interactive learning platform for Solana
              development. Master blockchain fundamentals, build real dApps, and
              earn on-chain credentials that prove your expertise. From smart
              contracts to DeFi protocols, our structured curriculum guides you
              from beginner to advanced builder.
            </p>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Actions</SectionLabel>
        <SectionTitle>Buttons</SectionTitle>
        <div className="space-y-6">
          {buttonSizes.map((size) => (
            <div key={size} className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                Size: {size}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {buttonVariants.map((variant) => (
                  <Button
                    key={`${variant}-${size}`}
                    variant={variant}
                    size={size}
                  >
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </Button>
                ))}
                <Button variant="primary" size={size} disabled>
                  Disabled
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Labels</SectionLabel>
        <SectionTitle>Badges</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          {badgeData.map((badge) => (
            <Badge key={badge.variant} variant={badge.variant}>
              {badge.label}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Containers</SectionLabel>
        <SectionTitle>Cards</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div
              className="relative flex flex-col justify-end px-6 py-8"
              style={{
                background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
                minHeight: "160px",
              }}
            >
              <span
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#ffd23f" }}
              >
                SOL-101
              </span>
              <h3
                className="text-[22px] font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#f7eacb",
                  letterSpacing: "-0.01em",
                }}
              >
                Introduction to Solana
              </h3>
              <p
                className="mt-1 text-[13px]"
                style={{ color: "rgba(247, 234, 203, 0.7)" }}
              >
                Build your first on-chain program
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-muted-foreground">
                    Progress
                  </span>
                  <span className="font-semibold text-primary">65%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: "65%",
                      background: "linear-gradient(90deg, #2f6b3f, #008c4c)",
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                <div className="text-center">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Level
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">
                    Beginner
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Blocks
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">
                    12
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Weeks
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="reward">Featured</Badge>
                  <Badge variant="primary">Beginner</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3
                  className="mb-2 text-[18px] font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Getting Started with Web3
                </h3>
                <p
                  className="text-[14px] leading-relaxed text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Understand the fundamentals of blockchain technology, wallets,
                  and decentralized applications before diving into Solana
                  development.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="danger">Advanced</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <h3
                  className="mb-2 text-[18px] font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  DeFi Protocol Design
                </h3>
                <p
                  className="text-[14px] leading-relaxed text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Design and implement automated market makers, lending
                  protocols, and yield strategies on Solana.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Student Pages</SectionLabel>
        <SectionTitle>Landing Page</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Full landing page with hero, feature cards, featured course previews,
          and call-to-action.
        </p>
        <div className="-mx-6 space-y-0 overflow-hidden rounded-xl border border-border md:-mx-0">
          <Hero />
          <Features />
          <CoursePreview courses={FEATURED_COURSES} />
          <Cta />
        </div>
      </section>

      <section>
        <SectionLabel>Structure</SectionLabel>
        <SectionTitle>Layout Components</SectionTitle>
        <div className="space-y-10">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Header (Student)
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <Header />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Individual Controls
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Locale Switcher
                </p>
                <LocaleSwitcher />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Wallet Button
                </p>
                <WalletButton />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  User Menu
                </p>
                <UserMenu />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Admin Sidebar + Header
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex h-[400px]">
                <AdminSidebar />
                <div className="flex flex-1 flex-col">
                  <AdminHeader
                    breadcrumbs={[
                      { label: "Dashboard", href: "/admin" },
                      { label: "Courses" },
                    ]}
                  />
                  <div className="flex flex-1 items-center justify-center bg-background">
                    <p
                      className="text-[14px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Admin page content area
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Footer
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <Footer />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Inputs</SectionLabel>
        <SectionTitle>Form Elements</SectionTitle>
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Text Input
            </p>
            <div className="space-y-3">
              <Input placeholder="Enter your wallet address..." />
              <Input placeholder="Disabled input" disabled />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Switch
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Switch defaultChecked />
                <span className="text-[14px] font-medium text-foreground">
                  Enable notifications
                </span>
              </label>
              <label className="flex items-center gap-3">
                <Switch />
                <span className="text-[14px] font-medium text-foreground">
                  Dark mode auto-detect
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Checkbox
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <span className="text-[14px] font-medium text-foreground">
                  I agree to the terms and conditions
                </span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox />
                <span className="text-[14px] font-medium text-foreground">
                  Subscribe to course updates
                </span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox disabled />
                <span className="text-[14px] font-medium text-muted-foreground">
                  Premium feature (locked)
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>LMS Components</SectionLabel>
        <SectionTitle>LMS Badges</SectionTitle>
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Question Type Badges
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {QUESTION_TYPES.map((type) => (
                <QuestionTypeBadge key={type} type={type} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty Badges
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {DIFFICULTY_LEVELS.map((level) => (
                <DifficultyBadge key={level} level={level} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Block Type Icons
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {BLOCK_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <BlockTypeIcon type={type} />
                  <span
                    className="text-[12px] font-medium text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Browsing</SectionLabel>
        <SectionTitle>Course Catalog</SectionTitle>
        <div className="space-y-8">
          <CourseFilters />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CATALOG_COURSES.map((item) => (
              <CourseCard
                key={item.course.id}
                course={item.course}
                slug={item.slug}
                difficulty={item.difficulty}
                enrollmentCount={item.enrollmentCount}
                progress={item.progress}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Detail</SectionLabel>
        <SectionTitle>Course Detail View</SectionTitle>
        <div className="space-y-8">
          <CourseHeader
            course={CATALOG_COURSES[0]!.course}
            difficulty="beginner"
            enrollmentCount={342}
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <ModuleList
              modules={CATALOG_COURSES[0]!.course.modules}
              completedLessons={new Set(["l1", "l2"])}
            />
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Enrolled State
                </p>
                <div className="rounded-xl border border-border bg-card p-5">
                  <EnrollButton
                    status="enrolled"
                    progress={40}
                    totalLessons={5}
                    completedLessons={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Unenrolled State
                </p>
                <div className="rounded-xl border border-border bg-card p-5">
                  <EnrollButton status="unenrolled" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Completed State
                </p>
                <div className="rounded-xl border border-border bg-card p-5">
                  <EnrollButton status="completed" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Progress Bars
                </p>
                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <ProgressBar value={25} label="Quarter done" size="sm" />
                  <ProgressBar value={65} label="In progress" size="md" />
                  <ProgressBar value={100} label="Complete" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Learning</SectionLabel>
        <SectionTitle>Lesson View</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Split-pane layout: text/quiz/callouts on the left, code editor and
          challenges on the right. On mobile (&lt;768px), switches to tabbed
          view.
        </p>
        <div className="space-y-8">
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="border-b border-border bg-card px-6 py-4">
              <LessonNavigation
                moduleName="Module 1: Solana Basics"
                currentLesson={2}
                totalLessons={5}
                lessonTitle="Understanding Solana Accounts"
                hasPrevious
                hasNext
              />
            </div>
            <div className="px-6">
              <LessonContent blocks={SAMPLE_LESSON_BLOCKS} />
            </div>
            <div className="border-t border-border bg-card px-6 py-4">
              <LessonCompleteButton xpReward={15} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Complete Button States
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-3 text-[11px] font-medium text-muted-foreground">
                  Default
                </p>
                <LessonCompleteButton xpReward={25} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-3 text-[11px] font-medium text-muted-foreground">
                  Completed
                </p>
                <LessonCompleteButton xpReward={25} isCompleted />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-3 text-[11px] font-medium text-muted-foreground">
                  Last Lesson (Finalize Course)
                </p>
                <LessonCompleteButton xpReward={25} isLastLesson />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Gamification</SectionLabel>
        <SectionTitle>Student Dashboard</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          XP tracking, streak calendar, active courses, achievements, and
          activity feed — the student&apos;s home base.
        </p>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <XpLevelCard xp={1850} />
            <StreakCalendar
              days={getCalendarData("showcase-demo", 13)}
              currentStreak={12}
              longestStreak={23}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                Active Courses
              </p>
              <ActiveCourses courses={MOCK_ACTIVE_COURSES} />
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                Activity Feed
              </p>
              <ActivityFeed activities={MOCK_ACTIVITIES} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Achievement Badges
            </p>
            <RecentAchievements achievements={MOCK_ACHIEVEMENTS} />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Student Pages</SectionLabel>
        <SectionTitle>Profile</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          User profile with avatar, skill radar chart, achievement badges,
          on-chain credentials, and completed courses.
        </p>
        <div className="space-y-6">
          <ProfileHeader
            displayName="Web3Newbie"
            walletAddress="1aWqR7xkB9sNmOpQrStUvWxYzAbCdEfGhIjKlMnP2s"
            joinDate="Jan 2026"
            xp={1850}
            level={4}
            isOwnProfile
          />
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <SkillRadar skills={MOCK_SKILLS} />
            <BadgeShowcase badges={MOCK_PROFILE_BADGES} />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <CredentialCards credentials={MOCK_CREDENTIALS} />
            <CompletedCourses courses={MOCK_COMPLETED_COURSES} />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Gamification</SectionLabel>
        <SectionTitle>Leaderboard</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          XP leaderboard with rankings, filters, and current user highlight.
          Data sourced from Helius DAS API (XP token holders).
        </p>
        <div className="space-y-4">
          <UserRankCard
            rank={9}
            totalParticipants={847}
            displayName="Web3Newbie"
            wallet="1aWq...fP2s"
            xp={1850}
            level={4}
            streak={12}
          />
          <LeaderboardFilters
            timeframe={lbTimeframe}
            onTimeframeChange={setLbTimeframe}
            courseFilter={lbCourseFilter}
            onCourseFilterChange={setLbCourseFilter}
            courses={MOCK_LEADERBOARD_COURSES}
          />
          <LeaderboardTable
            entries={MOCK_LEADERBOARD}
            currentWallet="1aWq...fP2s"
          />
        </div>
      </section>

      <section>
        <SectionLabel>Student Pages</SectionLabel>
        <SectionTitle>Settings</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Appearance, language, account info, and linked accounts — all settings
          in one place.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <AppearanceSettings />
          <LanguageSettings />
          <AccountSettings
            displayName="Web3Newbie"
            email="learner@superteam.fun"
          />
          <LinkedAccounts
            walletAddress="1aWqR7xkB9fP2sMnOpQrStUvWxYz"
            googleEmail="learner@superteam.fun"
          />
        </div>
      </section>

      <section>
        <SectionLabel>Student Pages</SectionLabel>
        <SectionTitle>Certificate / Credential View</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          On-chain credential NFT display with verification proof, attributes,
          and social sharing.
        </p>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <CertificateDisplay certificate={MOCK_CERTIFICATE} />
          </div>
          <div className="space-y-6">
            <OnChainProof
              mintAddress={MOCK_CERTIFICATE.mintAddress}
              ownerAddress={MOCK_CERTIFICATE.recipientWallet}
              collectionAddress="ColLecT1oNaDdReSs7xkB9fP2sMnOpQrStUvWxYz"
              metadataUri="https://arweave.net/abc123-metadata-json"
              network="devnet"
            />
            <CertificateShare
              courseName={MOCK_CERTIFICATE.courseName}
              mintAddress={MOCK_CERTIFICATE.mintAddress}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Student Pages</SectionLabel>
        <SectionTitle>Sign In</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Multi-method authentication — Solana wallet (SIWS), Google, and
          GitHub. Wallet connect shows a step-by-step progress flow.
        </p>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Full Sign-In Form
            </p>
            <SignInForm />
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Wallet Sign-In (standalone)
            </p>
            <div className="rounded-xl border border-border bg-card p-6">
              <WalletSignIn />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Shared Context</SectionLabel>
        <SectionTitle>Context Cards</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_CONTEXTS.map((ctx) => (
            <ContextCard key={ctx.id} context={ctx} />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Assessment</SectionLabel>
        <SectionTitle>Question Renderer</SectionTitle>
        <div className="rounded-xl border border-border bg-card p-6">
          <QuestionRenderer q={SAMPLE_QUESTION} />
        </div>
      </section>

      <section>
        <SectionLabel>Rich Text</SectionLabel>
        <SectionTitle>Rich Text Editor</SectionTitle>
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              TiptapEditor (interactive)
            </p>
            <TiptapEditor
              value={editorValue}
              onChange={(json) => setEditorValue(json)}
              placeholder="Start typing to test the rich text editor..."
            />
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              TiptapRenderer (read-only output)
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <TiptapRenderer content={SAMPLE_TIPTAP_CONTENT} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Admin Tools</SectionLabel>
        <SectionTitle>Question Builders</SectionTitle>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              MCQ Builder
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <McqBuilder value={mcqConfig} onChange={setMcqConfig} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              True / False Builder
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <TrueFalseBuilder
                value={trueFalseConfig}
                onChange={setTrueFalseConfig}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Matching Builder
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <MatchingBuilder
                value={matchingConfig}
                onChange={setMatchingConfig}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Code</SectionLabel>
        <SectionTitle>Code Editor</SectionTitle>
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Monaco Editor (interactive)
            </p>
            <CodeEditor
              value={codeValue}
              onChange={setCodeValue}
              language="typescript"
              height="240px"
            />
          </div>
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              Read-only Mode
            </p>
            <CodeEditor
              value={SAMPLE_CODE}
              onChange={() => {}}
              language="typescript"
              readOnly
              height="160px"
            />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Challenges</SectionLabel>
        <SectionTitle>Code Challenge</SectionTitle>
        <p
          className="mb-4 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Write a function that adds two lamport values together. Click
          &quot;Run&quot; to test your solution.
        </p>
        <CodeChallenge challenge={SAMPLE_CHALLENGE} />
      </section>

      <section>
        <SectionLabel>Video</SectionLabel>
        <SectionTitle>Video Player with Checkpoints</SectionTitle>
        <p
          className="mb-4 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Video player with quiz checkpoints at 0:10 and 0:30. The video pauses
          automatically and presents a question overlay.
        </p>
        <div className="max-w-3xl">
          <VideoPlayer
            url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            checkpoints={SAMPLE_VIDEO_CHECKPOINTS}
          />
        </div>
      </section>

      <section>
        <SectionLabel>Admin</SectionLabel>
        <SectionTitle>Admin Dashboard</SectionTitle>
        <p
          className="mb-6 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Stats overview with course counts, users, enrollments, XP, course
          status breakdown, and recent activity.
        </p>
        <AdminDashboard />
      </section>

      <section>
        <SectionLabel>Admin</SectionLabel>
        <SectionTitle>Course Management</SectionTitle>
        <p
          className="mb-4 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Course list with status, stats, and CRUD actions. Edit, preview,
          publish/unpublish, and delete courses.
        </p>
        <div className="space-y-4">
          <PageHeader
            title="Courses"
            description="Manage your course catalog"
            action={{ label: "+ New Course", href: "/admin/courses/new" }}
          />
          <CourseTable courses={MOCK_ADMIN_COURSES} />
        </div>
      </section>

      <section>
        <SectionLabel>Admin</SectionLabel>
        <SectionTitle>Preview Mode Banner</SectionTitle>
        <p
          className="mb-4 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Banner shown when viewing draft content. Displays course name with
          Exit Preview and Publish actions.
        </p>
        <div className="overflow-hidden rounded-xl border border-border">
          <PreviewBanner courseName="NFT Marketplace Tutorial" />
        </div>
      </section>

      <section>
        <SectionLabel>Admin</SectionLabel>
        <SectionTitle>Content Block Editor</SectionTitle>
        <p
          className="mb-4 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Drag-and-drop block editor. Click &quot;Add Block&quot; to insert
          text, code, quiz, callout, image, or video blocks.
        </p>
        <BlockList blocks={blocks} onChange={setBlocks} />
      </section>

      <section>
        <SectionLabel>Admin</SectionLabel>
        <SectionTitle>Course Builder</SectionTitle>
        <p
          className="mb-4 text-[14px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Drag modules and lessons to reorder. Add new modules and lessons using
          the buttons.
        </p>
        <CourseTree course={course} onChange={setCourse} />
      </section>
    </div>
  );
}
