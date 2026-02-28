'use client';

import { ZapIcon, FlameIcon, TrendingUpIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  displayName?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streak: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentWallet?: string;
  className?: string;
}

function rankMedal(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function LeaderboardTable({ entries, currentWallet, className }: LeaderboardTableProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th
                className="w-16 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Rank
              </th>
              <th
                className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Learner
              </th>
              <th
                className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                XP
              </th>
              <th
                className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Level
              </th>
              <th
                className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isCurrentUser = currentWallet === entry.wallet;
              const medal = rankMedal(entry.rank);

              return (
                <tr
                  key={entry.wallet}
                  className={cn(
                    'border-b border-border transition-colors last:border-b-0',
                    isCurrentUser
                      ? 'bg-primary/5 ring-1 ring-inset ring-primary/20'
                      : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-3">
                    {medal ? (
                      <span className="text-[18px]">{medal}</span>
                    ) : (
                      <span
                        className="text-[14px] font-semibold text-muted-foreground"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {entry.rank}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
                          entry.rank <= 3
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {entry.displayName
                          ? entry.displayName.charAt(0).toUpperCase()
                          : entry.wallet.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="truncate text-[13px] font-semibold text-foreground"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {entry.displayName ?? truncateWallet(entry.wallet)}
                        </p>
                        {entry.displayName && (
                          <p
                            className="text-[11px] text-muted-foreground"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {truncateWallet(entry.wallet)}
                          </p>
                        )}
                        {isCurrentUser && (
                          <Badge variant="primary" className="mt-0.5 text-[9px]">You</Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <ZapIcon className="size-3.5" style={{ color: '#ffd23f' }} />
                      <span
                        className="text-[14px] font-bold text-foreground"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {entry.xp.toLocaleString()}
                      </span>
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Badge variant="neutral" className="text-[10px]">
                      <TrendingUpIcon className="mr-0.5 size-3" />
                      Lv. {entry.level}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[13px]">
                      <FlameIcon
                        className="size-3.5"
                        style={{ color: entry.streak > 0 ? '#ffd23f' : undefined }}
                      />
                      <span
                        className={cn(
                          'font-semibold',
                          entry.streak > 0 ? 'text-foreground' : 'text-muted-foreground',
                        )}
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {entry.streak}d
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
