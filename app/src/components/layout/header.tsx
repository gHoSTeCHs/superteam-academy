"use client";

import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LocaleSwitcher } from "./locale-switcher";
import { WalletButton } from "./wallet-button";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  className?: string;
  onMenuToggle?: () => void;
}

export function Header({ className, onMenuToggle }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const tAuth = useTranslations("Auth");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            <MenuIcon className="size-5" />
          </button>
        )}
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
            {tAuth("signIn")}
          </Link>
        )}
      </div>
    </header>
  );
}
