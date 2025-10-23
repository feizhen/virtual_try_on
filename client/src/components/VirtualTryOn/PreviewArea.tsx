import React, { useRef, useState } from 'react';
import { useTryOn } from '../../contexts/TryOnContext';
import { getImageUrl } from '../../utils/url';
import { uploadModel } from '../../api/model';
import { validateImageFile } from '../../utils/imageValidation';
import './styles.css';

export const PreviewArea: React.FC = () => {
  const { selectedModel, currentSession, setSelectedModel } = useTryOn();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  // 处理点击占位符上传
  const handlePlaceholderClick = () => {
    if (!uploading && !selectedModel && !currentSession) {
      fileInputRef.current?.click();
    }
  };

  // 处理重新上传
  const handleReupload = () => {
    fileInputRef.current?.click();
  };

  // 处理删除模特
  const handleDelete = () => {
    const confirmed = window.confirm('确定要删除这张模特照片吗?');
    if (confirmed) {
      setSelectedModel(null);
      setError(null);
    }
  };

  // 处理文件选择
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = await validateImageFile(file, {
      checkDimensions: true,
    });

    if (!validation.valid) {
      setError(validation.error || '文件验证失败');
      return;
    }

    // 上传文件
    try {
      setUploading(true);
      setError(null);

      const result = await uploadModel(file, {
        onProgress: (progress) => {
          console.log('Upload progress:', progress);
        },
      });

      // 处理可能的双层包装
      const uploadedModel = (result as any).success && (result as any).data
        ? (result as any).data
        : result;

      // 自动选中上传的模特
      setSelectedModel(uploadedModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      // 清空 input 以允许重复上传同一文件
      event.target.value = '';
    }
  };

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

    // 4. 如果选中了模特,显示模特照片和操作按钮
    if (selectedModel) {
      return (
        <div
          className="tryon-preview-image-container"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="tryon-preview-image-wrapper">
            <img
              src={getImageUrl(selectedModel.url)}
              alt="Selected model"
              className="tryon-preview-image"
            />
            {hovering && (
              <button
                className="tryon-delete-btn"
                onClick={handleDelete}
                title="删除"
              >
                ×
              </button>
            )}
          </div>
          <div className="tryon-preview-actions">
            <button
              className="tryon-action-btn tryon-action-btn-reupload"
              onClick={handleReupload}
              title="重新上传"
            >
              <span className="action-icon">🔄</span>
              <span className="action-text">重新上传</span>
            </button>
          </div>
        </div>
      );
    }

    // 5. 默认占位符
    return (
      <div
        className="tryon-preview-placeholder tryon-preview-placeholder-clickable"
        onClick={handlePlaceholderClick}
        style={{ cursor: uploading ? 'default' : 'pointer' }}
      >
        {uploading ? (
          <>
            <div className="tryon-loading-spinner" />
            <div>上传中...</div>
          </>
        ) : (
          <>
            <div className="tryon-preview-placeholder-icon">📤</div>
            <div>点击此处上传模特照片</div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              或从下方选择已有模特
            </div>
          </>
        )}
        {error && (
          <div style={{ fontSize: '14px', marginTop: '8px', color: '#ef4444' }}>
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tryon-preview-area">
      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {renderContent()}
    </div>
  );
};
