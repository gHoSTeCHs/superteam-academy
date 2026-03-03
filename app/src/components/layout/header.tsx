"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LocaleSwitcher } from "./locale-switcher";
import { WalletButton } from "./wallet-button";
import { UserMenu } from "./user-menu";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/leaderboard", label: "Leaderboard" },
];

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo/ST-DARK-GREEN-HORIZONTAL.svg"
            alt="Superteam Academy"
            width={150}
            height={34}
            priority
            className="dark:hidden"
          />
          <Image
            src="/images/logo/ST-OFF-WHITE-HORIZONTAL.svg"
            alt="Superteam Academy"
            width={150}
            height={34}
            priority
            className="hidden dark:block"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground",
              )}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <WalletButton />
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
