import { AwardIcon, ZapIcon, BookOpenIcon, TrendingUpIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CertificateData {
  courseName: string;
  trackName: string;
  recipientName?: string;
  recipientWallet: string;
  completionDate: string;
  totalXp: number;
  level: number;
  lessonsCompleted: number;
  mintAddress: string;
}

interface CertificateDisplayProps {
  certificate: CertificateData;
  className?: string;
}

function truncateWallet(wallet: string): string {
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function CertificateDisplay({ certificate, className }: CertificateDisplayProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div
        className="relative px-8 py-10"
        style={{
          background: 'linear-gradient(135deg, #2f6b3f 0%, #008c4c 50%, #2f6b3f 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <AwardIcon className="size-7" style={{ color: '#ffd23f' }} />
          </div>

          <p
            className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-body)', color: 'rgba(247, 234, 203, 0.6)' }}
          >
            Certificate of Completion
          </p>

          <h2
            className="mb-2 text-[24px] font-bold text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {certificate.courseName}
          </h2>

          <Badge
            variant="reward"
            className="mb-6 border-0 bg-white/15 text-[11px] text-white backdrop-blur-sm"
          >
            {certificate.trackName}
          </Badge>

          <div className="mx-auto mb-6 h-px w-48 bg-white/20" />

          <p
            className="mb-1 text-[11px] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-body)', color: 'rgba(247, 234, 203, 0.5)' }}
          >
            Awarded to
          </p>
          <p
            className="mb-1 text-[18px] font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {certificate.recipientName ?? truncateWallet(certificate.recipientWallet)}
          </p>
          {certificate.recipientName && (
            <p
              className="text-[12px]"
              style={{ fontFamily: 'var(--font-body)', color: 'rgba(247, 234, 203, 0.5)' }}
            >
              {truncateWallet(certificate.recipientWallet)}
            </p>
          )}

          <div className="mx-auto mt-6 h-px w-48 bg-white/20" />

          <p
            className="mt-4 text-[12px]"
            style={{ fontFamily: 'var(--font-body)', color: 'rgba(247, 234, 203, 0.5)' }}
          >
            Completed on {certificate.completionDate}
          </p>

          <div
            className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: 'rgba(255, 210, 63, 0.6)' }}
          >
            Superteam Academy
          </div>
        </div>
      </div>

      <div className="flex items-center justify-around border-t border-border px-6 py-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <ZapIcon className="size-3.5" style={{ color: '#ffd23f' }} />
            <span
              className="text-[16px] font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {certificate.totalXp.toLocaleString()}
            </span>
          </div>
          <span
            className="text-[10px] text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Total XP
          </span>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <TrendingUpIcon className="size-3.5 text-primary" />
            <span
              className="text-[16px] font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {certificate.level}
            </span>
          </div>
          <span
            className="text-[10px] text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Level
          </span>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <BookOpenIcon className="size-3.5 text-primary" />
            <span
              className="text-[16px] font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {certificate.lessonsCompleted}
            </span>
          </div>
          <span
            className="text-[10px] text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Lessons
          </span>
        </div>
      </div>
    </Card>
  );
}
