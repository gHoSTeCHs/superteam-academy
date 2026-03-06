"use client";

import {
  LayoutDashboardIcon,
  BookOpenIcon,
  TrophyIcon,
  UserIcon,
  SettingsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboardIcon },
    { href: "/courses", label: t("courses"), icon: BookOpenIcon },
    { href: "/leaderboard", label: t("leaderboard"), icon: TrophyIcon },
    { href: "/profile", label: t("profile"), icon: UserIcon },
    { href: "/settings", label: t("settings"), icon: SettingsIcon },
  ];

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <span
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Superteam Academy
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/courses"
              ? pathname.startsWith("/courses")
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              style={{ fontFamily: "var(--font-body)" }}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p
          className="text-[11px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Superteam Academy v0.1.0
        </p>
      </div>
    </aside>
  );
}
