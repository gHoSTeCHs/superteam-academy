import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Image
        src="/images/logo/ST-DARK-GREEN-VERTICAL.svg"
        alt="Superteam Brasil"
        width={120}
        height={120}
        priority
        className="mb-8 dark:hidden"
      />
      <Image
        src="/images/logo/ST-OFF-WHITE-VERTICAL.svg"
        alt="Superteam Brasil"
        width={120}
        height={120}
        priority
        className="mb-8 hidden dark:block"
      />
      <h1 className="mb-3 text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Superteam Academy
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Learn Solana development with interactive courses, coding challenges, and on-chain credentials.
      </p>
      <Button asChild>
        <Link href="/showcase">View Component Showcase</Link>
      </Button>
    </div>
  );
}
