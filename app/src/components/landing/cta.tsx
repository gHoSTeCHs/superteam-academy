import { ArrowRightIcon, AwardIcon, ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CtaProps {
  onGetStarted?: () => void;
  className?: string;
}

export function Cta({ onGetStarted, className }: CtaProps) {
  return (
    <section className={cn('px-6 py-16 md:px-12 md:py-20', className)}>
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl px-8 py-12 text-center md:px-16 md:py-16"
        style={{
          background: 'linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div className="absolute -right-16 -top-16 size-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ffd23f 0%, transparent 70%)' }}
        />

        <div className="relative">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <AwardIcon className="size-7" style={{ color: '#ffd23f' }} />
          </div>

          <h2
            className="mb-3 text-[28px] font-bold text-white md:text-[36px]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Ready to build on Solana?
          </h2>

          <p
            className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed md:text-[16px]"
            style={{ fontFamily: 'var(--font-body)', color: 'rgba(247, 234, 203, 0.7)' }}
          >
            Join hundreds of developers earning on-chain credentials.
            Start with a free course and earn your first XP today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="gap-2 bg-white text-[#1b231d] hover:bg-white/90"
              onClick={onGetStarted}
            >
              <ZapIcon className="size-4" style={{ color: '#ffd23f' }} />
              <span style={{ fontFamily: 'var(--font-body)' }}>Start Learning for Free</span>
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>

          <p
            className="mt-5 text-[12px]"
            style={{ fontFamily: 'var(--font-body)', color: 'rgba(247, 234, 203, 0.4)' }}
          >
            No credit card required. Connect a wallet to earn credentials.
          </p>
        </div>
      </div>
    </section>
  );
}
