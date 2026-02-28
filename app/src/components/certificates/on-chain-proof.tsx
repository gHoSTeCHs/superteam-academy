'use client';

import { useState } from 'react';
import { ShieldCheckIcon, ExternalLinkIcon, CopyIcon, CheckIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OnChainProofProps {
  mintAddress: string;
  ownerAddress: string;
  collectionAddress?: string;
  metadataUri?: string;
  network?: 'mainnet-beta' | 'devnet';
  className?: string;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

function explorerUrl(address: string, network: string): string {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

export function OnChainProof({
  mintAddress,
  ownerAddress,
  collectionAddress,
  metadataUri,
  network = 'devnet',
  className,
}: OnChainProofProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function handleCopy(value: string, field: string) {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  const fields = [
    { label: 'Mint Address', value: mintAddress, key: 'mint' },
    { label: 'Owner', value: ownerAddress, key: 'owner' },
    ...(collectionAddress
      ? [{ label: 'Collection', value: collectionAddress, key: 'collection' }]
      : []),
    ...(metadataUri
      ? [{ label: 'Metadata URI', value: metadataUri, key: 'metadata' }]
      : []),
  ];

  return (
    <Card className={cn('px-6 py-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 text-primary" />
          <h3
            className="text-[14px] font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            On-Chain Verification
          </h3>
        </div>
        <Badge variant="primary" className="text-[10px]">
          {network === 'devnet' ? 'Devnet' : 'Mainnet'}
        </Badge>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p
                className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {field.label}
              </p>
              <p
                className="truncate text-[13px] font-medium text-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {truncateAddress(field.value)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 pl-2">
              <button
                type="button"
                onClick={() => handleCopy(field.value, field.key)}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copiedField === field.key ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </button>
              {field.key !== 'metadata' && (
                <a
                  href={explorerUrl(field.value, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <a
        href={explorerUrl(mintAddress, network)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <ExternalLinkIcon className="size-3.5" />
        View on Solana Explorer
      </a>
    </Card>
  );
}
