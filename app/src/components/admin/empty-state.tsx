import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3
        className="mt-4 text-[14px] font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p
        className="mt-1 text-[13px] text-muted-foreground"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {description}
      </p>
    </div>
  );
}
