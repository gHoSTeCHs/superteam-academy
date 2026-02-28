import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-[12px]">
          {label && (
            <span
              className="font-medium text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              className="font-semibold text-primary"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'overflow-hidden rounded-full bg-muted',
          sizeClasses[size],
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #2f6b3f, #008c4c)',
          }}
        />
      </div>
    </div>
  );
}
