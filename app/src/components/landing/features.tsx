import {
  CodeIcon,
  AwardIcon,
  TrophyIcon,
  GlobeIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  iconBg: string;
}

interface FeaturesProps {
  className?: string;
}

const FEATURES: Feature[] = [
  {
    icon: CodeIcon,
    title: 'Interactive Coding',
    description: 'Write real Solana programs in the browser with instant feedback, test cases, and hints.',
    color: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: AwardIcon,
    title: 'On-Chain Credentials',
    description: 'Earn verifiable NFT certificates stored on Solana. Prove your skills with on-chain proof.',
    color: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/10',
  },
  {
    icon: TrophyIcon,
    title: 'XP & Leaderboards',
    description: 'Earn XP for every lesson and challenge. Compete on the leaderboard and unlock achievements.',
    color: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-500/10',
  },
  {
    icon: GlobeIcon,
    title: 'Multi-Language',
    description: 'Learn in English, Portuguese, or Spanish. All courses available in your preferred language.',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
];

export function Features({ className }: FeaturesProps) {
  return (
    <section className={cn('px-6 py-16 md:px-12 md:py-20', className)}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Why Superteam Academy
          </p>
          <h2
            className="text-[28px] font-bold tracking-tight text-foreground md:text-[36px]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Everything you need to master Solana
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="px-5 py-6 transition-shadow hover:shadow-md">
                <div className={cn('mb-4 flex size-11 items-center justify-center rounded-xl', feature.iconBg)}>
                  <Icon className={cn('size-5', feature.color)} />
                </div>
                <h3
                  className="mb-2 text-[15px] font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed text-muted-foreground"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
