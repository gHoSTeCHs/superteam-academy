"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { AccountSettings } from "@/components/settings/account-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LanguageSettings } from "@/components/settings/language-settings";
import { LinkedAccounts } from "@/components/settings/linked-accounts";
import { cn } from "@/lib/utils";

type TabKey = "Account" | "Appearance" | "Language" | "Linked Accounts";

interface SettingsClientProps {
  displayName?: string;
  email?: string;
}

export function SettingsClient({ displayName, email }: SettingsClientProps) {
  const t = useTranslations("Settings");
  const { walletAddress } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("Account");

  const TABS: { key: TabKey; label: string }[] = [
    { key: "Account", label: t("tabAccount") },
    { key: "Appearance", label: t("tabAppearance") },
    { key: "Language", label: t("tabLanguage") },
    { key: "Linked Accounts", label: t("tabLinkedAccounts") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1
          className="text-[28px] font-bold tracking-tight text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          {t("settingsTitle")}
        </h1>
        <p
          className="mt-1 text-[15px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("settingsDescription")}
        </p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "Account" && (
          <AccountSettings displayName={displayName} email={email} />
        )}
        {activeTab === "Appearance" && <AppearanceSettings />}
        {activeTab === "Language" && <LanguageSettings />}
        {activeTab === "Linked Accounts" && (
          <LinkedAccounts walletAddress={walletAddress ?? undefined} />
        )}
      </div>
    </div>
  );
}
