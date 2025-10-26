import React, { createContext, useContext, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { creditApi } from '../api/credit';
import type { CreditBalance } from '../types/credit';

interface CreditContextType {
  balance: CreditBalance | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refreshBalance: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: balance,
    error,
    isLoading,
  } = useSWR<CreditBalance>('/credit/balance', () => creditApi.getBalance(), {
    revalidateOnMount: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const refreshBalance = useCallback(async () => {
    await mutate('/credit/balance');
  }, []);

  return (
    <CreditContext.Provider
      value={{
        balance,
        isLoading,
        error,
        refreshBalance,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};

export const useCredit = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
};
