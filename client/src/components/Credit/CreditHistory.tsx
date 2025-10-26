import React, { useState } from 'react';
import useSWR from 'swr';
import { creditApi } from '../../api/credit';
import type { CreditTransaction } from '../../types/credit';
import './CreditHistory.css';

export const CreditHistory: React.FC = () => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, error, isLoading } = useSWR(
    `/credit/transactions?cursor=${cursor || ''}`,
    () => creditApi.getTransactions(cursor, 20)
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INITIAL_GRANT':
        return '🎁';
      case 'DEDUCT':
        return '💸';
      case 'REFUND':
        return '💰';
      case 'ADMIN_ADJUSTMENT':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'INITIAL_GRANT':
        return '初始赠送';
      case 'DEDUCT':
        return '扣除';
      case 'REFUND':
        return '退还';
      case 'ADMIN_ADJUSTMENT':
        return '管理员调整';
      default:
        return type;
    }
  };

  const formatAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : amount.toString();
  };

  if (error) {
    return (
      <div className="credit-history">
        <div className="credit-history-error">
          <p>⚠️ 加载交易历史失败</p>
          <p className="error-detail">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="credit-history">
        <div className="credit-history-loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  const transactions = data?.items || [];
  const hasMore = data?.hasMore || false;

  return (
    <div className="credit-history">
      <div className="credit-history-header">
        <h3>交易历史</h3>
        <p className="credit-history-subtitle">查看您的 Credit 使用记录</p>
      </div>

      {transactions.length === 0 ? (
        <div className="credit-history-empty">
          <p>📭 暂无交易记录</p>
        </div>
      ) : (
        <>
          <div className="transaction-list">
            {transactions.map((transaction: CreditTransaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="transaction-details">
                  <div className="transaction-header">
                    <span className="transaction-type">
                      {getTransactionLabel(transaction.type)}
                    </span>
                    <span
                      className={`transaction-amount ${
                        transaction.amount > 0 ? 'positive' : 'negative'
                      }`}
                    >
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  <div className="transaction-footer">
                    <span className="transaction-date">
                      {new Date(transaction.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="transaction-balance">
                      余额: {transaction.balanceBefore} → {transaction.balanceAfter}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="credit-history-footer">
              <button
                onClick={() => setCursor(data?.nextCursor || undefined)}
                className="btn-load-more"
              >
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
