import { ZapIcon, FlameIcon, TrendingUpIcon, HashIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserRankCardProps {
  rank: number;
  totalParticipants: number;
  displayName?: string;
  wallet: string;
  xp: number;
  level: number;
  streak: number;
  className?: string;
}

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function UserRankCard({
  rank,
  totalParticipants,
  displayName,
  wallet,
  xp,
  level,
  streak,
  className,
}: UserRankCardProps) {
  const percentile = Math.round(
    ((totalParticipants - rank) / totalParticipants) * 100,
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div
        className="px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-full bg-white/15 text-[16px] font-bold text-white backdrop-blur-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayName
                ? displayName.charAt(0).toUpperCase()
                : wallet.charAt(0).toUpperCase()}
            </div>
            <div>
              <p
                className="text-[14px] font-semibold text-white"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {displayName ?? truncateWallet(wallet)}
              </p>
              <p
                className="text-[11px]"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(247, 234, 203, 0.7)",
                }}
              >
                Your Ranking
              </p>
            </div>
          </div>

          <Badge
            variant="reward"
            className="border-0 bg-white/15 text-[11px] text-white backdrop-blur-sm"
          >
            Top {percentile > 0 ? percentile : 1}%
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <HashIcon className="size-3.5 text-muted-foreground" />
            <span
              className="text-[18px] font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {rank}
            </span>
            <span
              className="text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              of {totalParticipants.toLocaleString()}
            </span>
          </div>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-1">
            <ZapIcon className="size-3.5" style={{ color: "#ffd23f" }} />
            <span
              className="text-[14px] font-bold text-foreground"
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
            Lv. {level}
          </Badge>

          <div className="flex items-center gap-1">
            <FlameIcon className="size-3.5" style={{ color: "#ffd23f" }} />
            <span
              className="text-[13px] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {streak}d
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
