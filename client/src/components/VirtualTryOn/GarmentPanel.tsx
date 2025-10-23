import React, { useEffect, useState } from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import type { Garment } from '../../types/garment';
import { useTryOn } from '../../contexts/TryOnContext';
import { getGarments, uploadGarment, deleteGarment } from '../../api/garment';
import {
  validateImageFile,
  formatFileSize,
} from '../../utils/imageValidation';
import { getImageUrl } from '../../utils/url';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import './styles.css';

interface GarmentPanelProps {}

export const GarmentPanel: React.FC<GarmentPanelProps> = () => {
  const { selectedGarment, setSelectedGarment } = useTryOn();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [hoveringGarmentId, setHoveringGarmentId] = useState<string | null>(null);

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

  const handleDeleteGarment = async (garmentId: string) => {
    try {
      await deleteGarment(garmentId);

      // 从列表中移除
      setGarments((prev) => prev.filter((g) => g.id !== garmentId));

      // 如果删除的是当前选中的服装,清空选中状态
      if (selectedGarment?.id === garmentId) {
        setSelectedGarment(null);
      }
    } catch (err) {
      console.error('[GarmentPanel] Delete error:', err);
      setError(err instanceof Error ? err.message : '删除失败');
    }
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
    <Accordion type="single" collapsible defaultValue="garments">
      <AccordionItem value="garments">
        <AccordionTrigger>服装库</AccordionTrigger>
        <AccordionContent>
        {error && <div className="tryon-error">{error}</div>}

        {/* Unified Grid with Upload Zone and Garments */}
        {loading ? (
          <div className="tryon-loading-text">加载中...</div>
        ) : (
          <div className="tryon-garment-grid">
            {/* Upload Zone - First Item */}
            <div
              className={`tryon-garment-card tryon-upload-card ${dragActive ? 'dragging' : ''}`}
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
              <label htmlFor="garment-upload-input" className="tryon-upload-zone-label">
                {uploading ? (
                  <div className="tryon-upload-content">
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
                  </div>
                ) : (
                  <div className="tryon-upload-content">
                    <div className="tryon-upload-icon">+</div>
                    <div className="tryon-upload-text">
                      点击或拖拽上传
                    </div>
                    <div className="tryon-upload-hint">
                      支持 JPG, PNG, WEBP
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Existing Garments */}
            {Array.isArray(garments) && garments.map((garment) => (
              <div
                key={garment.id}
                className={`tryon-garment-card ${
                  selectedGarment?.id === garment.id ? 'selected' : ''
                }`}
                onClick={() => handleGarmentClick(garment)}
                onMouseEnter={() => setHoveringGarmentId(garment.id)}
                onMouseLeave={() => setHoveringGarmentId(null)}
              >
                <div className="tryon-garment-image-wrapper">
                  <img
                    src={getImageUrl(garment.url)}
                    alt={garment.name}
                    className="tryon-garment-image"
                    loading="lazy"
                  />
                  {hoveringGarmentId === garment.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="tryon-garment-delete-btn"
                          onClick={(e) => e.stopPropagation()}
                          title="删除"
                        >
                          <IoCloseCircle />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除服装"{garment.name || '未命名服装'}"吗?此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteGarment(garment.id)}>
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="tryon-garment-info">
                  <div className="tryon-garment-name">{garment.name || '未命名服装'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
