import { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

export interface OnChainCourse {
  courseId: string;
  creator: PublicKey;
  contentTxId: number[];
  version: number;
  lessonCount: number;
  difficulty: number;
  xpPerLesson: number;
  trackId: number;
  trackLevel: number;
  prerequisite: PublicKey | null;
  creatorRewardXp: number;
  minCompletionsForReward: number;
  totalCompletions: number;
  totalEnrollments: number;
  isActive: boolean;
  createdAt: BN;
  updatedAt: BN;
  bump: number;
}

export interface OnChainEnrollment {
  course: PublicKey;
  enrolledAt: BN;
  completedAt: BN | null;
  lessonFlags: [BN, BN, BN, BN];
  credentialAsset: PublicKey | null;
  bump: number;
}

export interface SerializedEnrollment {
  course: string;
  enrolledAt: number;
  completedAt: number | null;
  completedLessons: number[];
  credentialAsset: string | null;
  isFinalized: boolean;
}

export interface XpBalance {
  amount: number;
  decimals: number;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progress: number;
}

export interface DasCredential {
  id: string;
  name: string;
  uri: string;
  image: string;
  collection: string;
  attributes: Record<string, string>;
}

export interface LeaderboardEntry {
  wallet: string;
  amount: number;
  level: number;
}
