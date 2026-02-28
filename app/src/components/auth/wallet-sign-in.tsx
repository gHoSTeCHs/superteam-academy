'use client';

import { useState } from 'react';
import {
  WalletIcon,
  Loader2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WalletStep = 'idle' | 'connecting' | 'connected' | 'signing' | 'verifying' | 'authenticated';

interface WalletSignInProps {
  onAuthenticated?: (wallet: string) => void;
  className?: string;
}

const MOCK_WALLET = 'Fg6PQzSh3kNm8xK9rAbCdEfGhIjKlMnOpQrStUv';

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function WalletSignIn({ onAuthenticated, className }: WalletSignInProps) {
  const [step, setStep] = useState<WalletStep>('idle');

  async function handleConnect() {
    setStep('connecting');
    await new Promise((r) => setTimeout(r, 1200));
    setStep('connected');

    await new Promise((r) => setTimeout(r, 600));
    setStep('signing');
    await new Promise((r) => setTimeout(r, 1500));
    setStep('verifying');
    await new Promise((r) => setTimeout(r, 1000));
    setStep('authenticated');
    onAuthenticated?.(MOCK_WALLET);
  }

  if (step === 'authenticated') {
    return (
      <div className={cn('flex flex-col items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-5', className)}>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2Icon className="size-6 text-primary" />
        </div>
        <p
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Wallet Connected
        </p>
        <p
          className="font-mono text-[12px] text-muted-foreground"
        >
          {truncateWallet(MOCK_WALLET)}
        </p>
      </div>
    );
  }

  const isLoading = step !== 'idle';

  const stepLabels: Record<WalletStep, string> = {
    idle: 'Connect Wallet',
    connecting: 'Connecting...',
    connected: 'Wallet connected',
    signing: 'Sign message in wallet...',
    verifying: 'Verifying signature...',
    authenticated: 'Authenticated',
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <Button
        variant="primary"
        size="lg"
        className="w-full gap-2.5"
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2Icon className="size-5 animate-spin" />
        ) : (
          <WalletIcon className="size-5" />
        )}
        <span style={{ fontFamily: 'var(--font-body)' }}>
          {stepLabels[step]}
        </span>
      </Button>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5">
          <div className="flex gap-1">
            {(['connecting', 'signing', 'verifying'] as WalletStep[]).map((s) => {
              const active = s === step;
              const done = ['connecting', 'connected', 'signing', 'verifying', 'authenticated']
                .indexOf(step) > ['connecting', 'connected', 'signing', 'verifying', 'authenticated'].indexOf(s);
              return (
                <div
                  key={s}
                  className={cn(
                    'size-2 rounded-full transition-all',
                    active && 'scale-125 bg-primary',
                    done && 'bg-primary/40',
                    !active && !done && 'bg-muted-foreground/20',
                  )}
                />
              );
            })}
          </div>
          <span
            className="text-[12px] text-muted-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {stepLabels[step]}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheckIcon className="size-3" />
        <span style={{ fontFamily: 'var(--font-body)' }}>
          Sign-In with Solana (SIWS) — no transaction fees
        </span>
      </div>
    </div>
  );
}
