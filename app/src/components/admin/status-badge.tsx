import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <Badge variant={isActive ? 'primary' : 'neutral'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
