import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'danger' | 'reward' | 'neutral' | 'solid';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-badge-primary-bg text-badge-primary-fg',
  danger: 'bg-badge-danger-bg text-badge-danger-fg',
  reward: 'bg-badge-reward-bg text-badge-reward-fg',
  neutral: 'bg-badge-neutral-bg text-badge-neutral-fg',
  solid: 'bg-btn-primary-bg text-btn-primary-fg',
};

export function Badge({ variant = 'primary', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-full px-[10px] py-1 text-[11px] font-semibold',
        variant === 'solid' && 'font-bold',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
