import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-4 w-3/4 animate-pulse rounded bg-muted', className)} {...props} />;
}
