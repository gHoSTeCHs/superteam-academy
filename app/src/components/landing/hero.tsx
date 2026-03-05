"use client";

import { ArrowRightIcon, WalletIcon, ZapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroProps {
  onBrowseCourses?: () => void;
  onConnectWallet?: () => void;
  className?: string;
}

export function Hero({
  onBrowseCourses,
  onConnectWallet,
  className,
}: HeroProps) {
  const t = useTranslations("Landing");

  const stats = [
    { value: "500+", label: t("statLearners") },
    { value: "12", label: t("statCourses") },
    { value: "150+", label: t("statLessons") },
  ];

  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div
        className="relative px-6 py-20 md:px-12 md:py-28 lg:py-36"
        style={{
          background:
            "linear-gradient(135deg, #1b231d 0%, #2f6b3f 50%, #008c4c 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div
          className="absolute -right-32 -top-32 size-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ffd23f 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 size-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #008c4c 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge
            variant="reward"
            className="mb-6 border-0 bg-white/10 text-[12px] text-white backdrop-blur-sm"
          >
            <ZapIcon className="mr-1 size-3" style={{ color: "#ffd23f" }} />
            {t("heroBadge")}
          </Badge>

          <h1
            className="mb-4 text-[40px] font-bold leading-[1.1] text-white md:text-[56px] lg:text-[64px]"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
            }}
          >
            {t("heroTitle1")}{" "}
            <span style={{ color: "#ffd23f" }}>{t("heroTitle2")}</span>
          </h1>

          <p
            className="mx-auto mb-8 max-w-2xl text-[16px] leading-relaxed md:text-[18px]"
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(247, 234, 203, 0.7)",
            }}
          >
            {t("heroDescription")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="gap-2 bg-white text-[#1b231d] hover:bg-white/90"
              onClick={onBrowseCourses}
            >
              <span style={{ fontFamily: "var(--font-body)" }}>
                {t("browseCourses")}
              </span>
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={onConnectWallet}
            >
              <WalletIcon className="size-4" />
              <span style={{ fontFamily: "var(--font-body)" }}>
                {t("connectWallet")}
              </span>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-[24px] font-bold text-white md:text-[28px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-[11px] uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "rgba(247, 234, 203, 0.5)",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
