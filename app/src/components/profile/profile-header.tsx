"use client";

import { CalendarIcon, ZapIcon, TrendingUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  displayName?: string;
  walletAddress: string;
  joinDate: string;
  xp: number;
  level: number;
  isOwnProfile?: boolean;
  className?: string;
}

function truncateWallet(wallet: string): string {
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function ProfileHeader({
  displayName,
  walletAddress,
  joinDate,
  xp,
  level,
  isOwnProfile,
  className,
}: ProfileHeaderProps) {
  const t = useTranslations("Profile");
  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : walletAddress.slice(0, 2).toUpperCase();

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div
        className="px-6 py-8"
        style={{
          background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-[22px] font-bold text-white backdrop-blur-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                className="truncate text-[20px] font-bold text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.01em",
                }}
              >
                {displayName ?? truncateWallet(walletAddress)}
              </h2>
              {isOwnProfile && (
                <Badge
                  variant="reward"
                  className="border-0 bg-white/15 text-[9px] text-white backdrop-blur-sm"
                >
                  {t("you")}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span
                className="font-mono text-[12px]"
                style={{ color: "rgba(247, 234, 203, 0.6)" }}
              >
                {truncateWallet(walletAddress)}
              </span>
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "rgba(247, 234, 203, 0.5)" }}
              >
                <CalendarIcon className="size-3" />
                <span style={{ fontFamily: "var(--font-body)" }}>
                  {t("joined", { date: joinDate })}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 px-6 py-3">
        <div className="flex items-center gap-1.5">
          <ZapIcon className="size-4" style={{ color: "#ffd23f" }} />
          <span
            className="text-[16px] font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {xp.toLocaleString()}
          </span>
          <span
            className="text-[11px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            XP
          </span>
        </div>
        <div className="h-5 w-px bg-border" />
        <Badge variant="neutral" className="text-[10px]">
          <TrendingUpIcon className="mr-0.5 size-3" />
          {t("level", { n: level })}
        </Badge>
      </div>
    </Card>
  );
}
