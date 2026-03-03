import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PaginationLinks, PaginationMeta } from "@/types/models";

interface PaginationProps {
  meta: PaginationMeta;
  links: PaginationLinks;
}

function buildPageUrl(currentUrl: string | null, page: number): string {
  if (!currentUrl) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    return `?${params.toString()}`;
  }
  try {
    const url = new URL(currentUrl, "http://localhost");
    url.searchParams.set("page", String(page));
    return `?${url.searchParams.toString()}`;
  } catch {
    const params = new URLSearchParams();
    params.set("page", String(page));
    return `?${params.toString()}`;
  }
}

/**
 * Generates the page numbers to display in the pagination bar.
 * Shows first page, last page, and a window of pages around the current page,
 * with -1 representing ellipsis gaps.
 */
function getPageNumbers(currentPage: number, lastPage: number): number[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const pages: number[] = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(lastPage - 1, currentPage + 1);

  if (windowStart > 2) {
    pages.push(-1);
  }

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < lastPage - 1) {
    pages.push(-1);
  }

  pages.push(lastPage);
  return pages;
}

export function Pagination({ meta, links }: PaginationProps) {
  if (meta.last_page <= 1) {
    return null;
  }

  const referenceUrl = links.prev ?? links.next;
  const pageNumbers = getPageNumbers(meta.current_page, meta.last_page);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p
        className="text-[13px] text-muted-foreground"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {meta.from !== null && meta.to !== null
          ? `Showing ${meta.from} to ${meta.to} of ${meta.total} results`
          : `${meta.total} results`}
      </p>

      <div className="flex items-center gap-1">
        {links.prev ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={buildPageUrl(referenceUrl, meta.current_page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
        )}

        {pageNumbers.map((page, index) => {
          if (page === -1) {
            return (
              <span
                key={`ellipsis-${String(index)}`}
                className="flex h-8 w-8 items-center justify-center text-[13px] text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === meta.current_page;
          return (
            <Button
              key={page}
              variant={isCurrent ? "secondary" : "ghost"}
              size="icon"
              className={cn("h-8 w-8 text-[13px]", isCurrent && "font-bold")}
              asChild={!isCurrent}
              disabled={isCurrent}
            >
              {isCurrent ? (
                <span>{page}</span>
              ) : (
                <Link href={buildPageUrl(referenceUrl, page)}>{page}</Link>
              )}
            </Button>
          );
        })}

        {links.next ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={buildPageUrl(referenceUrl, meta.current_page + 1)}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        )}
      </div>
    </div>
  );
}
