"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/cases?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-medium text-surface-900/60 transition-all hover:bg-surface-50"
        >
          Anterior
        </Link>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-brand-700 text-white"
                : "text-surface-900/50 hover:bg-surface-50 hover:text-surface-900"
            }`}
          >
            {page}
          </Link>
        ))}
      </div>

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-medium text-surface-900/60 transition-all hover:bg-surface-50"
        >
          Siguiente
        </Link>
      )}
    </div>
  );
}
