"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import {
  LeaderboardFilters,
  type Timeframe,
} from "@/components/leaderboard/leaderboard-filters";
import { UserRankCard } from "@/components/leaderboard/user-rank-card";

export function LeaderboardClient() {
  const { walletAddress } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>("all-time");
  const [courseFilter, setCourseFilter] = useState("all");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1
          className="text-[28px] font-bold tracking-tight text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          Leaderboard
        </h1>
        <p
          className="mt-1 text-[15px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          See how you rank against other learners.
        </p>
      </div>

      {walletAddress && (
        <UserRankCard
          rank={0}
          totalParticipants={0}
          wallet={walletAddress}
          xp={0}
          level={0}
          streak={0}
          className="mb-6"
        />
      )}

      <LeaderboardFilters
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        courseFilter={courseFilter}
        onCourseFilterChange={setCourseFilter}
        className="mb-6"
      />

      <LeaderboardTable
        entries={[]}
        currentWallet={walletAddress ?? undefined}
      />
    </div>
  );
}
