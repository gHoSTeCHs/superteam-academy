import {
  AwardIcon,
  ExternalLinkIcon,
  ShareIcon,
  ZapIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Credential {
  id: string;
  courseName: string;
  trackName: string;
  level: number;
  totalXp: number;
  completedAt: string;
  mintAddress: string;
}

interface CredentialCardsProps {
  credentials: Credential[];
  className?: string;
}

function truncateMint(mint: string): string {
  if (mint.length <= 12) return mint;
  return `${mint.slice(0, 6)}...${mint.slice(-4)}`;
}

export function CredentialCards({
  credentials,
  className,
}: CredentialCardsProps) {
  return (
    <Card className={cn("px-6 py-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AwardIcon className="size-4 text-primary" />
          <h3
            className="text-[14px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Credentials
          </h3>
        </div>
        <span
          className="text-[12px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {credentials.length} earned
        </span>
      </div>

      {credentials.length === 0 ? (
        <div className="py-6 text-center">
          <AwardIcon className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p
            className="text-[13px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Complete a course to earn your first credential
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background:
                    "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
                }}
              >
                <div>
                  <p
                    className="text-[14px] font-semibold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {cred.courseName}
                  </p>
                  <Badge
                    variant="reward"
                    className="mt-1 border-0 bg-white/15 text-[9px] text-white backdrop-blur-sm"
                  >
                    {cred.trackName}
                  </Badge>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <AwardIcon className="size-5" style={{ color: "#ffd23f" }} />
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="mb-3 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="size-3 text-primary" />
                    <span
                      className="text-[12px] font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Lv. {cred.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ZapIcon className="size-3" style={{ color: "#ffd23f" }} />
                    <span
                      className="text-[12px] font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {cred.totalXp.toLocaleString()} XP
                    </span>
                  </div>
                  <span
                    className="text-[11px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cred.completedAt}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {truncateMint(cred.mintAddress)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-7">
                      <ExternalLinkIcon className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7">
                      <ShareIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
