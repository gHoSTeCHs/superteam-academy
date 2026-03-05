"use client";

import { CodeIcon, AwardIcon, TrophyIcon, GlobeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeaturesProps {
  className?: string;
}

export function Features({ className }: FeaturesProps) {
  const t = useTranslations("Landing");

  const features: {
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
    color: string;
    iconBg: string;
  }[] = [
    {
      icon: CodeIcon,
      titleKey: "featInteractiveCoding",
      descKey: "featInteractiveCodingDesc",
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      icon: AwardIcon,
      titleKey: "featOnChainCredentials",
      descKey: "featOnChainCredentialsDesc",
      color: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/10",
    },
    {
      icon: TrophyIcon,
      titleKey: "featXpLeaderboards",
      descKey: "featXpLeaderboardsDesc",
      color: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-500/10",
    },
    {
      icon: GlobeIcon,
      titleKey: "featMultiLanguage",
      descKey: "featMultiLanguageDesc",
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <section className={cn("px-6 py-16 md:px-12 md:py-20", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("whyLabel")}
          </p>
          <h2
            className="text-[28px] font-bold tracking-tight text-foreground md:text-[36px]"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            {t("whyTitle")}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.titleKey}
                className="px-5 py-6 transition-shadow hover:shadow-md"
              >
                <div
                  className={cn(
                    "mb-4 flex size-11 items-center justify-center rounded-xl",
                    feature.iconBg,
                  )}
                >
                  <Icon className={cn("size-5", feature.color)} />
                </div>
                <h3
                  className="mb-2 text-[15px] font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t(feature.titleKey)}
                </h3>
                <p
                  className="text-[13px] leading-relaxed text-muted-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {t(feature.descKey)}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
