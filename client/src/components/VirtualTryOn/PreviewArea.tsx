import React from 'react';
import { useTryOn } from '../../contexts/TryOnContext';
import { getImageUrl } from '../../utils/url';
import './styles.css';

export const PreviewArea: React.FC = () => {
  const { selectedModel, currentSession } = useTryOn();

  // 显示优先级: 试衣结果 > 选中的模特 > 占位符
  const renderContent = () => {
    // 1. 如果有试衣结果,显示结果
    if (currentSession?.result) {
      return (
        <img
          src={getImageUrl(currentSession.result.url)}
          alt="Try-on result"
          className="tryon-preview-image"
        />
      );
    }

    // 2. 如果正在处理中,显示加载状态
    if (
      currentSession &&
      (currentSession.status === 'pending' ||
        currentSession.status === 'processing')
    ) {
      return (
        <div className="tryon-loading-overlay">
          <div className="tryon-loading-spinner" />
          <div className="tryon-loading-text">
            {currentSession.status === 'pending'
              ? '正在准备...'
              : '正在生成试衣效果...'}
          </div>
        </div>
      );
    }

    // 3. 如果试衣失败,显示错误
    if (currentSession?.status === 'failed') {
      return (
        <div className="tryon-preview-placeholder">
          <div className="tryon-preview-placeholder-icon">⚠️</div>
          <div>试衣失败</div>
          {currentSession.errorMessage && (
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              {currentSession.errorMessage}
            </div>
          )}
        </div>
      );
    }

    // 4. 如果选中了模特,显示模特照片
    if (selectedModel) {
      return (
        <img
          src={getImageUrl(selectedModel.url)}
          alt="Selected model"
          className="tryon-preview-image"
        />
      );
    }

    // 5. 默认占位符
    return (
      <div className="tryon-preview-placeholder">
        <div className="tryon-preview-placeholder-icon">👤</div>
        <div>选择一个模特开始</div>
        <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
          从下方选择或上传模特照片
        </div>
      </div>
    );
  };

  return <div className="tryon-preview-area">{renderContent()}</div>;
};
