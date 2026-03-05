"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  const t = useTranslations("AdminCommon");
  return (
    <Badge variant={isActive ? "primary" : "neutral"}>
      {isActive ? t("statusActive") : t("statusInactive")}
    </Badge>
  );
}
