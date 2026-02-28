'use client';

import { useState } from 'react';
import { GlobeIcon, CheckIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LanguageOption {
  code: string;
  label: string;
  native: string;
  flag: string;
}

interface LanguageSettingsProps {
  locale?: string;
  onLocaleChange?: (locale: string) => void;
  className?: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)', native: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
];

export function LanguageSettings({ locale: localeProp, onLocaleChange, className }: LanguageSettingsProps) {
  const [locale, setLocale] = useState(localeProp ?? 'en');

  function handleChange(code: string) {
    setLocale(code);
    onLocaleChange?.(code);
  }

  return (
    <Card className={cn('px-6 py-5', className)}>
      <div className="mb-1 flex items-center gap-2">
        <GlobeIcon className="size-4 text-primary" />
        <h3
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Language
        </h3>
      </div>
      <p
        className="mb-5 text-[13px] text-muted-foreground"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        Choose the language for the Superteam Academy interface. Course content availability may vary.
      </p>

      <div className="space-y-2">
        {LANGUAGES.map((lang) => {
          const active = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleChange(lang.code)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                active
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30',
              )}
            >
              <span className="text-[20px]">{lang.flag}</span>
              <div className="flex-1">
                <p
                  className={cn(
                    'text-[13px] font-semibold',
                    active ? 'text-primary' : 'text-foreground',
                  )}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {lang.label}
                </p>
                <p
                  className="text-[11px] text-muted-foreground"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {lang.native}
                </p>
              </div>
              {active && (
                <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                  <CheckIcon className="size-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
