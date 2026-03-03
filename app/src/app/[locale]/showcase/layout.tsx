import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import type { ReactNode } from "react";

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
        <Image
          src="/images/logo/ST-DARK-GREEN-HORIZONTAL.svg"
          alt="Superteam Brasil"
          width={180}
          height={40}
          priority
          className="dark:hidden"
        />
        <Image
          src="/images/logo/ST-OFF-WHITE-HORIZONTAL.svg"
          alt="Superteam Brasil"
          width={180}
          height={40}
          priority
          className="hidden dark:block"
        />
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
