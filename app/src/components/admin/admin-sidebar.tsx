"use client";

import {
  LayoutDashboardIcon,
  BookOpenIcon,
  FileTextIcon,
  EyeIcon,
  UsersIcon,
  BarChart3Icon,
  ChevronLeftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

const sidebarNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/admin/content", label: "Content", icon: FileTextIcon },
  { href: "/admin/students", label: "Students", icon: UsersIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/admin/preview", label: "Preview", icon: EyeIcon },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <span
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Admin Panel
        </span>
        <Link
          href="/"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <ChevronLeftIcon className="size-3.5" />
          Back to site
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {sidebarNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
