'use client';

import { useState } from 'react';
import { GlobeIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const locales = [
  { value: 'en', label: 'EN', full: 'English' },
  { value: 'pt-BR', label: 'PT', full: 'Português' },
  { value: 'es', label: 'ES', full: 'Español' },
];

interface LocaleSwitcherProps {
  value?: string;
  onChange?: (locale: string) => void;
}

export function LocaleSwitcher({ value, onChange }: LocaleSwitcherProps) {
  const [locale, setLocale] = useState(value ?? 'en');

  function handleChange(next: string) {
    setLocale(next);
    onChange?.(next);
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[72px] gap-1 border-border bg-transparent px-2 text-[13px] font-medium">
        <GlobeIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            <span style={{ fontFamily: 'var(--font-body)' }}>{l.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
