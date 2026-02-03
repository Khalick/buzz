'use client';

import { useState } from 'react';
import { PaginationHelper, PaginationOptions } from '@/lib/pagination';

export function usePagination<T>() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadPage = async (
    table: string,
    options: PaginationOptions = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = options.page || page;
      const result = await PaginationHelper.paginate<T>(table, {
        ...options,
        page: currentPage
      });

      setData(result.data);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotalCount(result.count || 0);
      setHasNextPage(result.hasNextPage);
      setHasPrevPage(result.hasPrevPage);
    } catch (err: any) {
      console.error('Pagination error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const nextPage = async (
    table: string,
    options: PaginationOptions = {}
  ) => {
    if (hasNextPage) {
      await loadPage(table, {
        ...options,
        page: page + 1
      });
    }
  };

  const prevPage = async (
    table: string,
    options: PaginationOptions = {}
  ) => {
    if (hasPrevPage) {
      await loadPage(table, {
        ...options,
        page: page - 1
      });
    }
  };

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    loadPage,
    nextPage,
    prevPage
  };
}