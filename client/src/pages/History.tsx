import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditBadge } from '../components/Credit/CreditBadge';
import { useCredit } from '../contexts/CreditContext';
import { useInfiniteHistory, historyApi } from '../api/history';
import type { HistoryItem } from '../types/history';
import './History.css';

/**
 * 历史记录页面
 * 展示用户的虚拟试衣历史记录，支持无限滚动加载
 */
export const History: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { refreshBalance } = useCredit();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState(false);

  // 使用无限滚动 hook 获取历史记录
  const {
    historyItems,
    total,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    mutate,
  } = useInfiniteHistory(20);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleItemClick = (item: HistoryItem) => {
    setSelectedItem(item);
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setRetryError(null);
    setRetrySuccess(false);
  };

  const handleRetry = async () => {
    if (!selectedItem) return;

    try {
      setIsRetrying(true);
      setRetryError(null);
      setRetrySuccess(false);

      // Call retry API
      const result = await historyApi.retryTryon(selectedItem.id);

      console.log('Retry initiated:', result);

      // Show success message
      setRetrySuccess(true);

      // Refresh balance and history
      await refreshBalance();
      await mutate();

      // Close modal after 2 seconds
      setTimeout(() => {
        closeDetail();
      }, 2000);
    } catch (error: any) {
      console.error('Retry failed:', error);
      setRetryError(
        error.response?.data?.message || '重试失败，请稍后再试',
      );
    } finally {
      setIsRetrying(false);
    }
  };

  // API URL 配置
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="history-container">
      {/* Top Navigation Bar */}
      <nav className="history-navbar">
        <div className="history-navbar-left">
          <h1 className="history-navbar-title">试衣历史</h1>
          {!isLoading && (
            <span className="history-count-badge">{total} 条记录</span>
          )}
        </div>

        <div className="history-navbar-right">
          {/* User Info */}
          {user && (
            <div className="history-navbar-user">
              <div className="history-navbar-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="history-navbar-user-info">
                <div className="history-navbar-user-name">{user.name}</div>
              </div>
            </div>
          )}

          {/* Credit Badge */}
          <CreditBadge />

          {/* Action Buttons */}
          <button
            onClick={() => navigate('/tryon')}
            className="history-navbar-btn history-navbar-btn-primary"
          >
            新试衣
          </button>
          <button
            onClick={() => navigate('/')}
            className="history-navbar-btn history-navbar-btn-secondary"
          >
            返回首页
          </button>
          <button
            onClick={handleLogout}
            className="history-navbar-btn history-navbar-btn-logout"
          >
            退出登录
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="history-main">
        {/* Loading State */}
        {isLoading && (
          <div className="history-loading">
            <div className="spinner"></div>
            <p>加载历史记录中...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && historyItems.length === 0 && (
          <div className="history-empty">
            <div className="history-empty-icon">📸</div>
            <h2>暂无试衣记录</h2>
            <p>开始你的第一次虚拟试衣吧！</p>
            <button
              onClick={() => navigate('/tryon')}
              className="btn btn-primary"
            >
              开始试衣
            </button>
          </div>
        )}

        {/* History Grid */}
        {!isLoading && historyItems.length > 0 && (
          <div className="history-content">
            <div className="history-grid">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="history-card"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Result Image */}
                  <div className="history-card-image-container">
                    <img
                      src={`${apiUrl}${item.resultImageUrl}`}
                      alt="Try-on result"
                      className="history-card-image"
                    />
                    <div className="history-card-overlay">
                      <span className="history-card-view-text">查看详情</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="history-card-info">
                    {/* Thumbnails */}
                    <div className="history-card-thumbnails">
                      <div className="history-card-thumbnail-item">
                        <img
                          src={`${apiUrl}${item.modelPhoto.url}`}
                          alt="Model"
                          className="history-card-thumbnail"
                        />
                        <span className="history-card-thumbnail-label">
                          模特
                        </span>
                      </div>
                      <div className="history-card-thumbnail-arrow">→</div>
                      <div className="history-card-thumbnail-item">
                        <img
                          src={`${apiUrl}${item.clothingItem.url}`}
                          alt="Clothing"
                          className="history-card-thumbnail"
                        />
                        <span className="history-card-thumbnail-label">
                          服装
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="history-card-meta">
                      <div className="history-card-meta-item">
                        <span className="history-card-meta-icon">⏱</span>
                        <span className="history-card-meta-text">
                          {item.processingDuration.toFixed(1)}s
                        </span>
                      </div>
                      <div className="history-card-meta-item">
                        <span className="history-card-meta-icon">💳</span>
                        <span className="history-card-meta-text">
                          {item.creditsUsed} credits
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="history-card-date">
                      {new Date(item.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {!isReachingEnd && (
              <div className="history-load-more">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="btn btn-secondary"
                >
                  {isLoadingMore ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}

            {/* End Indicator */}
            {isReachingEnd && historyItems.length > 0 && (
              <div className="history-end">
                <p>已显示全部 {total} 条记录</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="history-modal-overlay" onClick={closeDetail}>
          <div
            className="history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="history-modal-close" onClick={closeDetail}>
              ✕
            </button>

            <div className="history-modal-content">
              {/* Main Result Image */}
              <div className="history-modal-main-image">
                <img
                  src={`${apiUrl}${selectedItem.resultImageUrl}`}
                  alt="Try-on result"
                />
              </div>

              {/* Details */}
              <div className="history-modal-details">
                <h2 className="history-modal-title">试衣详情</h2>

                {/* Source Images */}
                <div className="history-modal-sources">
                  <div className="history-modal-source-item">
                    <div className="history-modal-source-label">模特照片</div>
                    <img
                      src={`${apiUrl}${selectedItem.modelPhoto.url}`}
                      alt="Model"
                      className="history-modal-source-image"
                    />
                    <div className="history-modal-source-filename">
                      {selectedItem.modelPhoto.originalFileName}
                    </div>
                  </div>

                  <div className="history-modal-source-item">
                    <div className="history-modal-source-label">服装图片</div>
                    <img
                      src={`${apiUrl}${selectedItem.clothingItem.url}`}
                      alt="Clothing"
                      className="history-modal-source-image"
                    />
                    <div className="history-modal-source-filename">
                      {selectedItem.clothingItem.originalFileName}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="history-modal-metadata">
                  <div className="history-modal-metadata-row">
                    <span className="history-modal-metadata-label">
                      处理时间
                    </span>
                    <span className="history-modal-metadata-value">
                      {selectedItem.processingDuration.toFixed(2)} 秒
                    </span>
                  </div>
                  <div className="history-modal-metadata-row">
                    <span className="history-modal-metadata-label">
                      消耗 Credits
                    </span>
                    <span className="history-modal-metadata-value">
                      {selectedItem.creditsUsed}
                    </span>
                  </div>
                  <div className="history-modal-metadata-row">
                    <span className="history-modal-metadata-label">
                      图片尺寸
                    </span>
                    <span className="history-modal-metadata-value">
                      {selectedItem.width} × {selectedItem.height}
                    </span>
                  </div>
                  <div className="history-modal-metadata-row">
                    <span className="history-modal-metadata-label">
                      文件大小
                    </span>
                    <span className="history-modal-metadata-value">
                      {(selectedItem.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="history-modal-metadata-row">
                    <span className="history-modal-metadata-label">
                      创建时间
                    </span>
                    <span className="history-modal-metadata-value">
                      {new Date(selectedItem.createdAt).toLocaleString(
                        'zh-CN',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="history-modal-actions">
                  {retrySuccess && (
                    <div className="retry-success-message">
                      ✓ 重试已发起，正在处理中...
                    </div>
                  )}
                  {retryError && (
                    <div className="retry-error-message">{retryError}</div>
                  )}
                  <div className="history-modal-buttons">
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying || retrySuccess}
                      className="btn btn-secondary"
                    >
                      {isRetrying ? '重试中...' : '重新生成'}
                    </button>
                    <a
                      href={`${apiUrl}${selectedItem.resultImageUrl}`}
                      download
                      className="btn btn-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      下载图片
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
