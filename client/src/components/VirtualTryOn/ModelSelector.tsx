import React, { useEffect, useState } from 'react';
import type { Model } from '../../types/model';
import { useTryOn } from '../../contexts/TryOnContext';
import { getModels, uploadModel } from '../../api/model';
import {
  validateImageFile,
  formatFileSize,
} from '../../utils/imageValidation';
import { getImageUrl } from '../../utils/url';
import './styles.css';

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useTryOn();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 加载模特列表
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getModels();
      setModels(response.data);
    } catch (err) {
      console.error('[ModelSelector] Load error:', err);
      setError(err instanceof Error ? err.message : '加载模特列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (model: Model) => {
    setSelectedModel(model.id === selectedModel?.id ? null : model);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setUploadProgress(0);

      const result = await uploadModel(file, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      // 处理可能的双层包装: 检查是否有 success 和 data 字段
      const uploadedModel = (result as any).success && (result as any).data
        ? (result as any).data
        : result;

      // 添加到列表并自动选中
      setModels((prev) => [uploadedModel, ...(Array.isArray(prev) ? prev : [])]);
      setSelectedModel(uploadedModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // 清空 input 以允许重复上传同一文件
      event.target.value = '';
    }
  };

  return (
    <div className="tryon-bottom-bar">
      <div className="tryon-bottom-bar-title">选择模特</div>

      {error && <div className="tryon-error">{error}</div>}

      <div className="tryon-model-list">
        {/* 上传按钮 */}
        <label className="tryon-model-thumbnail tryon-upload-zone">
          <input
            type="file"
            className="tryon-upload-input"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <div className="tryon-upload-icon">
            {uploading ? (
              <div className="tryon-loading-spinner" />
            ) : (
              '+'
            )}
          </div>
          {uploading && (
            <div className="tryon-upload-text">{uploadProgress}%</div>
          )}
          {!uploading && <div className="tryon-upload-text">上传模特</div>}
        </label>

        {/* 模特缩略图列表 */}
        {loading ? (
          <div className="tryon-loading-text">加载中...</div>
        ) : Array.isArray(models) && models.length > 0 ? (
          models.map((model) => (
            <div
              key={model.id}
              className={`tryon-model-thumbnail ${
                selectedModel?.id === model.id ? 'selected' : ''
              }`}
              onClick={() => handleModelClick(model)}
              title={`${model.width}x${model.height} - ${formatFileSize(
                model.fileSize
              )}`}
            >
              <img
                src={getImageUrl(model.url)}
                alt="Model"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="tryon-empty-text">
            暂无模特照片,请上传
          </div>
        )}
      </div>
    </div>
  );
};
