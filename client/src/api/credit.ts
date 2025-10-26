import { apiClient } from './client';
import type { CreditBalance, CreditTransactionsResponse } from '../types/credit';

export const creditApi = {
  /**
   * 获取用户 credit 余额
   */
  getBalance: async (): Promise<CreditBalance> => {
    const response = await apiClient.get('/credit/balance');
    return response.data;
  },

  /**
   * 获取用户 credit 交易历史
   */
  getTransactions: async (
    cursor?: string,
    limit: number = 20,
  ): Promise<CreditTransactionsResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await apiClient.get(
      `/credit/transactions?${params.toString()}`,
    );
    return response.data;
  },
};
