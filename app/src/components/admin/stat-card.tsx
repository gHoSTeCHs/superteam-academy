import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p
            className="text-[12px] font-medium text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {title}
          </p>
          <p
            className="text-[20px] font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {value}
          </p>
          {description && (
            <p
              className="mt-0.5 text-[12px] text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
