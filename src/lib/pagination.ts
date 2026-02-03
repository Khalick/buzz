import { supabase } from './supabase';

export interface PaginationOptions {
  page?: number;     // Changed from cursor-based to page-based
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in' | 'cs' | 'cd' | 'sl' | 'sr' | 'nxl' | 'nxr' | 'adj' | 'ov' | 'fts' | 'plfts' | 'phfts' | 'wfts';
    value: any;
  }>;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number | null;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

export class PaginationHelper {
  static async paginate<T>(
    table: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      pageSize = 10,
      orderByField = 'created_at',
      orderDirection = 'desc',
      filters = []
    } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' });

    // Apply filters
    for (const filter of filters) {
      // @ts-ignore - dynamic method access
      if (query[filter.operator]) {
        // @ts-ignore
        query = query[filter.operator](filter.field, filter.value);
      }
    }

    // Apply ordering
    query = query.order(orderByField, { ascending: orderDirection === 'asc' });

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: (data || []) as T[],
      count: totalCount,
      page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalPages
    };
  }
}