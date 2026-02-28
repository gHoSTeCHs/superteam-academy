'use client';

import { useLocale } from 'next-intl';
import { GlobeIcon } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const locales = [
  { value: 'en', label: 'EN' },
  { value: 'pt-BR', label: 'PT' },
  { value: 'es', label: 'ES' },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(next: string) {
    router.replace(pathname, { locale: next });
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
