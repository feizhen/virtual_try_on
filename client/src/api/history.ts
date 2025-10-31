/**
 * History API client
 */

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiClient } from './client';
import type {
  HistoryListResponse,
  HistoryDetailResponse,
  DeleteHistoryResponse,
  HistoryQueryParams,
  HistoryItem,
} from '../types/history';

/**
 * API endpoints
 */
export const historyApi = {
  /**
   * Get paginated history list
   */
  async getHistory(params?: HistoryQueryParams): Promise<HistoryListResponse> {
    const response = await apiClient.get('/history', {
      params,
    });
    // Backend wraps response in { success, data, timestamp, path }
    return response.data.data;
  },

  /**
   * Get single history item detail
   */
  async getHistoryDetail(id: string): Promise<HistoryDetailResponse> {
    const response = await apiClient.get(
      `/history/${id}`,
    );
    // Backend wraps response in { success, data, timestamp, path }
    return response.data.data;
  },

  /**
   * Delete history item
   */
  async deleteHistory(id: string): Promise<DeleteHistoryResponse> {
    const response = await apiClient.delete(
      `/history/${id}`,
    );
    // Backend wraps response in { success, data, timestamp, path }
    return response.data.data;
  },

  /**
   * Retry a try-on from history
   */
  async retryTryon(id: string): Promise<{ sessionId: string; status: string }> {
    const response = await apiClient.post(`/history/${id}/retry`);
    // Backend wraps response in { success, data, timestamp, path }
    return response.data.data;
  },
};

/**
 * SWR hook for fetching paginated history
 */
export function useHistory(params?: HistoryQueryParams) {
  const key = params
    ? ['/history', params]
    : '/history';

  const { data, error, isLoading, mutate } = useSWR<HistoryListResponse>(
    key,
    () => historyApi.getHistory(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  );

  return {
    history: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * SWR Infinite hook for infinite scrolling history
 */
export function useInfiniteHistory(limit: number = 20) {
  const getKey = (pageIndex: number, previousPageData: HistoryListResponse | null) => {
    // Reached the end
    if (previousPageData && !previousPageData.hasMore) return null;

    // First page, no cursor
    if (pageIndex === 0) return ['/history', { limit }];

    // Add the cursor to the API endpoint
    return ['/history', { cursor: previousPageData?.nextCursor, limit }];
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<HistoryListResponse>(
      getKey,
      ([_, params]) => historyApi.getHistory(params),
      {
        revalidateOnFocus: false,
        revalidateFirstPage: false,
      },
    );

  // Flatten the data
  const historyItems: HistoryItem[] = data
    ? data.flatMap((page) => page.data)
    : [];

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');

  const isEmpty = data?.[0]?.data.length === 0;

  const isReachingEnd =
    isEmpty || (data && !data[data.length - 1]?.hasMore) || false;

  const total = data?.[0]?.total || 0;

  return {
    historyItems,
    total,
    error,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    isValidating,
    size,
    setSize,
    mutate,
    loadMore: () => setSize(size + 1),
  };
}

/**
 * SWR hook for fetching single history item detail
 */
export function useHistoryDetail(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<HistoryDetailResponse>(
    id ? `/history/${id}` : null,
    () => (id ? historyApi.getHistoryDetail(id) : null),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    historyItem: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Delete history item helper
 */
export async function deleteHistoryItem(id: string): Promise<DeleteHistoryResponse> {
  return historyApi.deleteHistory(id);
}
