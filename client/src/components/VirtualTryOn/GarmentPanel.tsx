import React, { useEffect, useState } from 'react';
import type { Garment } from '../../types/garment';
import { useTryOn } from '../../contexts/TryOnContext';
import { getGarments, uploadGarment } from '../../api/garment';
import {
  validateImageFile,
  formatFileSize,
} from '../../utils/imageValidation';
import { getImageUrl } from '../../utils/url';
import './styles.css';

interface GarmentPanelProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const GarmentPanel: React.FC<GarmentPanelProps> = ({
  isExpanded = true,
  onToggle,
}) => {
  const { selectedGarment, setSelectedGarment } = useTryOn();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 加载服装列表
  useEffect(() => {
    loadGarments();
  }, []);

  const loadGarments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGarments();
      setGarments(response.data);
    } catch (err) {
      console.error('[GarmentPanel] Load error:', err);
      setError(err instanceof Error ? err.message : '加载服装列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGarmentClick = (garment: Garment) => {
    setSelectedGarment(
      garment.id === selectedGarment?.id ? null : garment
    );
  };

  const handleFileSelect = async (file: File) => {
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

      const result = await uploadGarment(file, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      // 处理可能的双层包装: 检查是否有 success 和 data 字段
      const uploadedGarment = (result as any).success && (result as any).data
        ? (result as any).data
        : result;

      // 转换 GarmentUploadResponse 为 Garment
      const newGarment: Garment = {
        ...uploadedGarment,
        userId: uploadedGarment.userId || '', // 后端会填充
        name: uploadedGarment.name || uploadedGarment.originalFileName || file.name,
        createdAt: uploadedGarment.uploadedAt,
        updatedAt: uploadedGarment.uploadedAt,
      };

      // 添加到列表并自动选中
      setGarments((prev) => [newGarment, ...(Array.isArray(prev) ? prev : [])]);
      setSelectedGarment(newGarment);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
      // 清空 input
      event.target.value = '';
    }
  };

  // 拖拽上传
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  return (
    <div className="tryon-panel-section">
      {/* Panel Header */}
      <div className="tryon-panel-header" onClick={onToggle}>
        <div className="tryon-panel-title">服装库</div>
        <div
          className={`tryon-panel-toggle ${isExpanded ? 'expanded' : ''}`}
        >
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* Panel Content */}
      <div
        className={`tryon-panel-content ${
          isExpanded ? '' : 'collapsed'
        }`}
      >
        {error && <div className="tryon-error">{error}</div>}

        {/* Upload Zone */}
        <div
          className={`tryon-upload-zone ${dragActive ? 'dragging' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="tryon-upload-input"
            id="garment-upload-input"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            disabled={uploading}
          />
          <label htmlFor="garment-upload-input" style={{ cursor: 'pointer' }}>
            {uploading ? (
              <>
                <div className="tryon-loading-spinner" />
                <div className="tryon-upload-text">
                  上传中 {uploadProgress}%
                </div>
                <div className="tryon-progress-bar">
                  <div
                    className="tryon-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="tryon-upload-icon">📤</div>
                <div className="tryon-upload-text">
                  点击或拖拽上传服装图片
                </div>
                <div className="tryon-upload-hint">
                  支持 JPG, PNG, WEBP,最大 10MB
                </div>
              </>
            )}
          </label>
        </div>

        {/* Garments Grid */}
        {loading ? (
          <div className="tryon-loading-text">加载中...</div>
        ) : !Array.isArray(garments) || garments.length === 0 ? (
          <div className="tryon-empty-state">
            <div className="tryon-empty-icon">👔</div>
            <div className="tryon-empty-text">
              暂无服装,请上传服装图片
            </div>
          </div>
        ) : (
          <div className="tryon-item-grid">
            {garments.map((garment) => (
              <div
                key={garment.id}
                className={`tryon-item-card ${
                  selectedGarment?.id === garment.id ? 'selected' : ''
                }`}
                onClick={() => handleGarmentClick(garment)}
                title={`${garment.name} - ${formatFileSize(
                  garment.fileSize
                )}`}
              >
                <img
                  src={getImageUrl(garment.url)}
                  alt={garment.name}
                  className="tryon-item-image"
                  loading="lazy"
                />
                <div className="tryon-item-name">{garment.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
