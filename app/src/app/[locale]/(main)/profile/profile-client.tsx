"use client";

import { useAuth } from "@/providers/auth-provider";
import { ProfileHeader } from "@/components/profile/profile-header";
import { BadgeShowcase } from "@/components/profile/badge-showcase";
import { CompletedCourses } from "@/components/profile/completed-courses";
import { CredentialCards } from "@/components/profile/credential-cards";
import { SkillRadar } from "@/components/profile/skill-radar";

interface ProfileClientProps {
  userId: string;
  displayName?: string;
}

export function ProfileClient({ userId, displayName }: ProfileClientProps) {
  const { walletAddress } = useAuth();
  const wallet = walletAddress ?? userId;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <ProfileHeader
        displayName={displayName}
        walletAddress={wallet}
        joinDate={new Date().toISOString()}
        xp={0}
        level={0}
        isOwnProfile
      />

      <div className="mt-8 space-y-8">
        <CredentialCards credentials={[]} />
        <CompletedCourses courses={[]} />
        <div className="grid gap-6 lg:grid-cols-2">
          <BadgeShowcase badges={[]} />
          <SkillRadar
            skills={[
              { label: "Solana", value: 0 },
              { label: "Rust", value: 0 },
              { label: "TypeScript", value: 0 },
              { label: "DeFi", value: 0 },
              { label: "NFTs", value: 0 },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
