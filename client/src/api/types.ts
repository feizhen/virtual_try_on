// Credit System Types
export type TransactionType = 'INITIAL_GRANT' | 'DEDUCT' | 'REFUND' | 'ADMIN_ADJUSTMENT';

export interface CreditBalance {
  creditBalance: number;
  totalCreditsSpent: number;
  totalCreditsEarned: number;
  creditUpdatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TransactionListResponse {
  items: CreditTransaction[];
  nextCursor: string | null;
  hasMore: boolean;
}
