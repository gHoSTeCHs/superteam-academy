"use client";

import { ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { UserMenu } from "@/components/layout/user-menu";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  breadcrumbs?: Breadcrumb[];
  title?: string;
  className?: string;
}

export function AdminHeader({
  breadcrumbs,
  title,
  className,
}: AdminHeaderProps) {
  const t = useTranslations("AdminCommon");
  const crumbs = breadcrumbs ?? [{ label: t("breadcrumbDefault") }];

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-border bg-card px-6",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {crumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className="text-[13px] font-medium text-foreground"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {title && (
          <span
            className="text-[14px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </span>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
