'use client';

import { useState } from 'react';
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

interface AccentOption {
  name: string;
  color: string;
}

interface AppearanceSettingsProps {
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  accent?: string;
  onAccentChange?: (accent: string) => void;
  className?: string;
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

const ACCENT_OPTIONS: AccentOption[] = [
  { name: 'Emerald', color: '#008c4c' },
  { name: 'Forest', color: '#2f6b3f' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Purple', color: '#7c3aed' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Pink', color: '#db2777' },
];

export function AppearanceSettings({
  theme: themeProp,
  onThemeChange,
  accent: accentProp,
  onAccentChange,
  className,
}: AppearanceSettingsProps) {
  const [theme, setTheme] = useState<ThemeMode>(themeProp ?? 'system');
  const [accent, setAccent] = useState(accentProp ?? '#008c4c');

  function handleThemeChange(value: ThemeMode) {
    setTheme(value);
    onThemeChange?.(value);
  }

  function handleAccentChange(color: string) {
    setAccent(color);
    onAccentChange?.(color);
  }

  return (
    <Card className={cn('px-6 py-5', className)}>
      <h3
        className="mb-1 text-[14px] font-semibold text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Appearance
      </h3>
      <p
        className="mb-5 text-[13px] text-muted-foreground"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        Customize how Superteam Academy looks for you.
      </p>

      <div className="mb-6">
        <label
          className="mb-2 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Theme
        </label>
        <div className="flex gap-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleThemeChange(opt.value)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30',
                )}
              >
                <Icon
                  className={cn(
                    'size-5',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'text-[12px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          className="mb-2 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Accent Color
        </label>
        <div className="flex flex-wrap gap-3">
          {ACCENT_OPTIONS.map((opt) => {
            const active = accent === opt.color;
            return (
              <button
                key={opt.color}
                type="button"
                onClick={() => handleAccentChange(opt.color)}
                className="group flex flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full transition-all',
                    active && 'ring-2 ring-offset-2 ring-offset-background',
                  )}
                  style={{
                    backgroundColor: opt.color,
                    ...(active ? { ringColor: opt.color } : {}),
                  }}
                >
                  {active && <CheckIcon className="size-4 text-white" />}
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    active ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
