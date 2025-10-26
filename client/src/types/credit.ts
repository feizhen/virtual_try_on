export enum TransactionType {
  INITIAL_GRANT = 'INITIAL_GRANT',
  DEDUCT = 'DEDUCT',
  REFUND = 'REFUND',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

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
  sessionId: string | null;
  description: string;
  metadata: any;
  createdAt: string;
}

export interface CreditTransactionsResponse {
  items: CreditTransaction[];
  nextCursor: string | null;
  hasMore: boolean;
}
