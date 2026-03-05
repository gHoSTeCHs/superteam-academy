"use client";

import {
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/use-auth";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function UserMenu() {
  const { user, walletAddress, signOut } = useAuth();
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");

  const userName = (user?.name as string) || "Student";
  const avatarUrl = user?.image as string | undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex size-9 items-center justify-center rounded-full border border-border bg-muted transition-colors hover:bg-bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="User menu"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="size-4 text-muted-foreground" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel style={{ fontFamily: "var(--font-body)" }}>
          <div>{userName}</div>
          {walletAddress && (
            <div className="font-mono text-[11px] font-normal text-muted-foreground">
              {truncateAddress(walletAddress)}
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/dashboard">
              <LayoutDashboardIcon className="size-4" />
              {t("dashboard")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/profile">
              <UserIcon className="size-4" />
              {t("profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/settings">
              <SettingsIcon className="size-4" />
              {t("settings")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          style={{ fontFamily: "var(--font-body)" }}
          onClick={() => signOut()}
        >
          <LogOutIcon className="size-4" />
          {tAuth("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
