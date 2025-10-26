import React from 'react';
import { useCredit } from '../../contexts/CreditContext';
import './CreditBadge.css';

export const CreditBadge: React.FC = () => {
  const { balance, isLoading, error } = useCredit();

  if (error) {
    return (
      <div className="credit-badge credit-badge-error" title="无法加载余额">
        <span className="credit-icon">💳</span>
        <span className="credit-text">--</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="credit-badge credit-badge-loading">
        <span className="credit-icon">💳</span>
        <span className="credit-text">...</span>
      </div>
    );
  }

  const creditAmount = balance?.creditBalance ?? 0;
  const isLow = creditAmount < 20;

  return (
    <div
      className={`credit-badge ${isLow ? 'credit-badge-low' : ''}`}
      title={`可用余额: ${creditAmount} credits\n总消费: ${balance?.totalCreditsSpent ?? 0}\n总获得: ${balance?.totalCreditsEarned ?? 0}`}
    >
      <span className="credit-icon">💳</span>
      <span className="credit-amount">{creditAmount}</span>
      <span className="credit-label">Credits</span>
    </div>
  );
};
