import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-[22px] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-1 text-[14px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button asChild size="sm">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
