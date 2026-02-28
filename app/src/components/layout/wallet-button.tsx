'use client';

import { useState } from 'react';
import { WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
  const [connected, setConnected] = useState(false);
  const mockAddress = 'Fg6P...xK9r';

  if (connected) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2 font-mono text-[12px]', className)}
        onClick={() => setConnected(false)}
      >
        <span className="size-2 rounded-full bg-emerald-500" />
        {mockAddress}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      className={cn('gap-2', className)}
      onClick={() => setConnected(true)}
    >
      <WalletIcon className="size-4" />
      <span style={{ fontFamily: 'var(--font-body)' }}>Connect Wallet</span>
    </Button>
  );
}
