'use client';

import { UserIcon, SettingsIcon, LogOutIcon, LayoutDashboardIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  userName?: string;
  avatarUrl?: string;
}

export function UserMenu({ userName = 'Student', avatarUrl }: UserMenuProps) {
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
        <DropdownMenuLabel
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {userName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem style={{ fontFamily: 'var(--font-body)' }}>
            <LayoutDashboardIcon className="size-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem style={{ fontFamily: 'var(--font-body)' }}>
            <UserIcon className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem style={{ fontFamily: 'var(--font-body)' }}>
            <SettingsIcon className="size-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" style={{ fontFamily: 'var(--font-body)' }}>
          <LogOutIcon className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
