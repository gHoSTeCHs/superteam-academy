'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Pagination } from '@/components/admin/pagination';
import { EmptyState } from '@/components/admin/empty-state';
import type { PaginatedData } from '@/types/models';

export interface ColumnDef<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
  sortable?: boolean;
}

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  paginatedData: PaginatedData<T>;
  getRowKey: (row: T) => string;
  toolbar?: ReactNode;
  renderActions?: (row: T) => ReactNode;
  emptyState: EmptyStateConfig;
}

const alignmentClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === 'asc') {
    return <ArrowUp className="ml-1 inline h-3.5 w-3.5" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="ml-1 inline h-3.5 w-3.5" />;
  }
  return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
}

export function DataTable<T>({
  columns,
  paginatedData,
  getRowKey,
  toolbar,
  renderActions,
  emptyState,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentSort = searchParams.get('sort') ?? '';
  const currentDirection = searchParams.get('direction') ?? '';

  useEffect(() => {
    setIsLoading(false);
  }, [paginatedData]);

  const handleSort = useCallback(
    (columnId: string) => {
      setIsLoading(true);

      const params = new URLSearchParams(searchParams.toString());
      let nextDirection = 'asc';

      if (currentSort === columnId && currentDirection === 'asc') {
        nextDirection = 'desc';
      } else if (currentSort === columnId && currentDirection === 'desc') {
        params.delete('sort');
        params.delete('direction');
        router.push(`?${params.toString()}`);
        return;
      }

      params.set('sort', columnId);
      params.set('direction', nextDirection);
      params.delete('page');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, currentSort, currentDirection],
  );

  const allColumns = renderActions
    ? [...columns, { id: '_actions', header: '', cell: renderActions, align: 'right' as const, sortable: false }]
    : columns;

  const skeletonRowCount = paginatedData.meta.per_page;
  const hasData = paginatedData.data.length > 0;

  return (
    <Card>
      {toolbar && <div className="border-b border-border px-4 py-3">{toolbar}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            {allColumns.map((col) => {
              const alignment = alignmentClasses[col.align ?? 'left'] ?? 'text-left';
              const sortDirection =
                col.sortable && currentSort === col.id
                  ? (currentDirection as 'asc' | 'desc')
                  : null;

              return (
                <TableHead
                  key={col.id}
                  className={cn(alignment, col.width && `w-[${col.width}]`, col.className)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 hover:text-foreground"
                      onClick={() => handleSort(col.id)}
                    >
                      {col.header}
                      <SortIcon direction={sortDirection} />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                <TableRow key={`skeleton-${String(rowIndex)}`}>
                  {allColumns.map((col) => (
                    <TableCell key={col.id}>
                      {col.id === '_actions' ? (
                        <Skeleton className="ml-auto h-8 w-8 rounded" />
                      ) : (
                        <SkeletonText />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : hasData
              ? paginatedData.data.map((row) => (
                  <TableRow key={getRowKey(row)}>
                    {allColumns.map((col) => {
                      const alignment = alignmentClasses[col.align ?? 'left'] ?? 'text-left';
                      return (
                        <TableCell key={col.id} className={cn(alignment, col.className)}>
                          {col.cell(row)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={allColumns.length} className="h-48">
                      <EmptyState
                        icon={emptyState.icon}
                        title={emptyState.title}
                        description={emptyState.description}
                      />
                    </TableCell>
                  </TableRow>
                )}
        </TableBody>
      </Table>

      <div className="border-t border-border">
        <Pagination meta={paginatedData.meta} links={paginatedData.links} />
      </div>
    </Card>
  );
}
