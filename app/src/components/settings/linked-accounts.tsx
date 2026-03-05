"use client";

import { useTranslations } from "next-intl";
import {
  WalletIcon,
  GithubIcon,
  MailIcon,
  LinkIcon,
  UnlinkIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface LinkedAccount {
  id: string;
  provider: string;
  icon: LucideIcon;
  label: string;
  value?: string;
  connected: boolean;
}

interface LinkedAccountsProps {
  walletAddress?: string;
  googleEmail?: string;
  githubUsername?: string;
  onLink?: (provider: string) => void;
  onUnlink?: (provider: string) => void;
  className?: string;
}

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function LinkedAccounts({
  walletAddress,
  googleEmail,
  githubUsername,
  onLink,
  onUnlink,
  className,
}: LinkedAccountsProps) {
  const t = useTranslations("Settings");

  const accounts: LinkedAccount[] = [
    {
      id: "wallet",
      provider: "wallet",
      icon: WalletIcon,
      label: t("solanaWallet"),
      value: walletAddress ? truncateWallet(walletAddress) : undefined,
      connected: !!walletAddress,
    },
    {
      id: "google",
      provider: "google",
      icon: MailIcon,
      label: "Google",
      value: googleEmail,
      connected: !!googleEmail,
    },
    {
      id: "github",
      provider: "github",
      icon: GithubIcon,
      label: "GitHub",
      value: githubUsername ? `@${githubUsername}` : undefined,
      connected: !!githubUsername,
    },
  ];

  return (
    <Card className={cn("px-6 py-5", className)}>
      <div className="mb-1 flex items-center gap-2">
        <LinkIcon className="size-4 text-primary" />
        <h3
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("linkedAccounts")}
        </h3>
      </div>
      <p
        className="mb-5 text-[13px] text-muted-foreground"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {t("linkedAccountsDescription")}
      </p>

      <div className="space-y-3">
        {accounts.map((account) => {
          const Icon = account.icon;
          return (
            <div
              key={account.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3",
                account.connected
                  ? "border-primary/20 bg-primary/5"
                  : "border-border",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    account.connected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[13px] font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {account.label}
                    </p>
                    {account.connected && (
                      <Badge variant="primary" className="text-[9px]">
                        {t("connected")}
                      </Badge>
                    )}
                  </div>
                  {account.value && (
                    <p
                      className="text-[11px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {account.value}
                    </p>
                  )}
                </div>
              </div>

              {account.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUnlink?.(account.provider)}
                  className="gap-1.5 text-[11px]"
                >
                  <UnlinkIcon className="size-3" />
                  {t("unlink")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onLink?.(account.provider)}
                  className="gap-1.5 text-[11px]"
                >
                  <LinkIcon className="size-3" />
                  {t("connect")}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
